package app.scrolltopsy.android

import android.app.*
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.BitmapFactory
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import androidx.core.app.NotificationCompat
import java.util.Calendar

class TrackingService : Service() {
    companion object {
        const val CHANNEL_ID = "scrolltopsy_tracking"
        const val SHAME_CHANNEL_ID = "scrolltopsy_shame"
        const val NOTIF_ID = 1001
        var isRunning = false
    }

    private val handler = Handler(Looper.getMainLooper())
    private val pollRunnable = object : Runnable {
        override fun run() {
            updateNotification()
            handler.postDelayed(this, 10_000L)
        }
    }

    // Tracks the highest shame level already fired per app today
    private val alreadyShamed = mutableMapOf<String, Int>()

    override fun onCreate() {
        super.onCreate()
        createNotificationChannels()
        isRunning = true
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val notification = buildLiveNotification("scrolltopsy  ·  watching", "calculating today's usage…")
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIF_ID, notification,
                android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC)
        } else {
            startForeground(NOTIF_ID, notification)
        }
        handler.post(pollRunnable)
        return START_NOT_STICKY
    }

    override fun onDestroy() {
        isRunning = false
        handler.removeCallbacks(pollRunnable)
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    // ── Core: accurate usage from UsageEvents ─────────────────────────────────

    private fun getAccurateDayUsage(): Map<String, Long> {
        return try {
            val usm = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val cal = Calendar.getInstance().apply {
                set(Calendar.HOUR_OF_DAY, 0); set(Calendar.MINUTE, 0)
                set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
            }
            val now = System.currentTimeMillis()
            val events = usm.queryEvents(cal.timeInMillis, now) ?: return emptyMap()

            val usageMap = mutableMapOf<String, Long>()
            val foregroundSince = mutableMapOf<String, Long>()
            val event = UsageEvents.Event()

            while (events.hasNextEvent()) {
                events.getNextEvent(event)
                val pkg = event.packageName ?: continue
                if (pkg == packageName) continue
                when (event.eventType) {
                    UsageEvents.Event.MOVE_TO_FOREGROUND ->
                        foregroundSince[pkg] = event.timeStamp
                    UsageEvents.Event.MOVE_TO_BACKGROUND ->
                        foregroundSince.remove(pkg)?.let { since ->
                            usageMap[pkg] = (usageMap[pkg] ?: 0L) + (event.timeStamp - since)
                        }
                }
            }
            foregroundSince.forEach { (pkg, since) ->
                usageMap[pkg] = (usageMap[pkg] ?: 0L) + (now - since)
            }
            usageMap
        } catch (e: Exception) { emptyMap() }
    }

    private fun getCurrentForegroundPkg(): String? {
        return try {
            val usm = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val now = System.currentTimeMillis()
            val events = usm.queryEvents(now - 5 * 60_000L, now) ?: return null
            var currentFg: String? = null
            val event = UsageEvents.Event()
            while (events.hasNextEvent()) {
                events.getNextEvent(event)
                val pkg = event.packageName ?: continue
                if (pkg == packageName) continue
                when (event.eventType) {
                    UsageEvents.Event.MOVE_TO_FOREGROUND -> currentFg = pkg
                    UsageEvents.Event.MOVE_TO_BACKGROUND ->
                        if (currentFg == pkg) currentFg = null
                }
            }
            currentFg
        } catch (e: Exception) { null }
    }

    // ── Quota / Shame ─────────────────────────────────────────────────────────

    private fun checkQuotas(usage: Map<String, Long>) {
        val prefs = getSharedPreferences(QuotaModule.PREFS_NAME, Context.MODE_PRIVATE)
        val pm = packageManager

        usage.forEach { (pkg, ms) ->
            val limitMins = prefs.getInt("${QuotaModule.KEY_PREFIX}$pkg", 0)
            if (limitMins <= 0) { alreadyShamed.remove(pkg); return@forEach }

            val usageMins = ms / 60_000L
            val overMins = usageMins - limitMins

            if (overMins < 0) { alreadyShamed.remove(pkg); return@forEach }

            val level = when {
                overMins >= 120 -> 5
                overMins >= 60  -> 4
                overMins >= 30  -> 3
                overMins >= 10  -> 2
                else            -> 1
            }
            val current = alreadyShamed[pkg] ?: 0
            if (level > current) {
                alreadyShamed[pkg] = level
                fireShameNotification(pkg, getAppLabel(pm, pkg), overMins.toInt(), level)
            }
        }
    }

    private fun fireShameNotification(pkg: String, appName: String, overMins: Int, level: Int) {
        val (title, body) = when (level) {
            1 -> Pair(
                "hey.",
                "$appName limit hit. your future self is disappointed."
            )
            2 -> Pair(
                "$appName  ·  +${overMins}m",
                "you literally set this limit yourself. and yet."
            )
            3 -> Pair(
                "$appName  ·  +${overMins}m",
                "you're deep in the void. ${overMins}m past your own limit."
            )
            4 -> Pair(
                "$appName  ·  +${overMins}m",
                "an hour past your limit. what is happening to you."
            )
            5 -> Pair(
                "$appName  ·  +${overMins}m  ·  critical",
                "$appName has consumed you. you had one rule."
            )
            else -> return
        }

        val intent = Intent(this, MainActivity::class.java)
        val pending = PendingIntent.getActivity(this, pkg.hashCode(), intent, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
        val largeIcon = BitmapFactory.decodeResource(resources, R.mipmap.ic_launcher)

        val vibration = when (level) {
            1 -> longArrayOf(0, 250)
            2 -> longArrayOf(0, 250, 100, 250)
            3 -> longArrayOf(0, 300, 100, 300, 100, 300)
            4 -> longArrayOf(0, 400, 100, 400, 100, 600)
            else -> longArrayOf(0, 500, 100, 500, 100, 500, 100, 800)
        }

        val notification = NotificationCompat.Builder(this, SHAME_CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setLargeIcon(largeIcon)
            .setContentIntent(pending)
            .setAutoCancel(true)
            .setVibrate(vibration)
            .setColor(0xE24B4A.toInt())
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .build()

        val notifId = 2000 + (Math.abs(pkg.hashCode()) % 1000)
        (getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager)
            .notify(notifId, notification)
    }

    // ── Live notification ─────────────────────────────────────────────────────

    private fun updateNotification() {
        try {
            val pm = packageManager
            val usage = getAccurateDayUsage()
            val currentPkg = getCurrentForegroundPkg()
            val currentLabel = currentPkg?.let { getAppLabel(pm, it) }
            val currentMs = currentPkg?.let { usage[it] } ?: 0L

            val top5 = usage.entries
                .filter { it.key != packageName && isUserApp(pm, it.key) }
                .sortedByDescending { it.value }
                .take(5)
                .joinToString("  ·  ") { "${getAppLabel(pm, it.key)} ${formatTime(it.value)}" }

            val title = if (currentLabel != null)
                "now: $currentLabel  ·  ${formatTime(currentMs)}"
            else
                "scrolltopsy  ·  watching"

            val body = top5.ifEmpty { "no screen time recorded yet" }

            val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            nm.notify(NOTIF_ID, buildLiveNotification(title, body))

            checkQuotas(usage)
        } catch (_: Exception) {}
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private fun formatTime(ms: Long): String {
        val mins = ms / 60000
        return when {
            mins == 0L -> "<1m"
            mins >= 60 -> "${mins / 60}h${(mins % 60).let { if (it > 0) "${it}m" else "" }}"
            else -> "${mins}m"
        }
    }

    private fun getAppLabel(pm: PackageManager, pkg: String): String {
        return try {
            pm.getApplicationLabel(pm.getApplicationInfo(pkg, 0)).toString()
        } catch (_: Exception) { pkg.split(".").lastOrNull() ?: pkg }
    }

    private fun isUserApp(pm: PackageManager, pkg: String): Boolean {
        return try {
            val flags = pm.getApplicationInfo(pkg, 0).flags
            (flags and android.content.pm.ApplicationInfo.FLAG_SYSTEM) == 0
        } catch (_: Exception) { true }
    }

    private fun buildLiveNotification(title: String, text: String): Notification {
        val intent = Intent(this, MainActivity::class.java)
        val pending = PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_IMMUTABLE)
        val largeIcon = BitmapFactory.decodeResource(resources, R.mipmap.ic_launcher)
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(text)
            .setStyle(NotificationCompat.BigTextStyle().bigText(text))
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setLargeIcon(largeIcon)
            .setContentIntent(pending)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setColor(0xE24B4A.toInt())
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            nm.createNotificationChannel(
                NotificationChannel(CHANNEL_ID, "Live Usage Tracking", NotificationManager.IMPORTANCE_LOW).apply {
                    description = "Live screen time — updates every 10s"
                    setShowBadge(false)
                }
            )
            nm.createNotificationChannel(
                NotificationChannel(SHAME_CHANNEL_ID, "Screen Time Alerts", NotificationManager.IMPORTANCE_HIGH).apply {
                    description = "Alerts when you exceed your app time limits"
                    enableVibration(true)
                    setShowBadge(true)
                }
            )
        }
    }
}
