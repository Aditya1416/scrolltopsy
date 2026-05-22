package app.scrolltopsy.android

import android.app.*
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import androidx.core.app.NotificationCompat
import java.util.Calendar

class TrackingService : Service() {
    companion object {
        const val CHANNEL_ID = "scrolltopsy_tracking"
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

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        isRunning = true
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val notification = buildNotification("scrolltopsy", "calculating today's usage…")
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
            // add still-active apps
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

    // ── Notification ──────────────────────────────────────────────────────────

    private fun updateNotification() {
        try {
            val pm = packageManager
            val usage = getAccurateDayUsage()
            val currentPkg = getCurrentForegroundPkg()
            val currentLabel = currentPkg?.let { getAppLabel(pm, it) }
            val currentMs = currentPkg?.let { usage[it] } ?: 0L

            val top3 = usage.entries
                .filter { it.key != packageName && isUserApp(pm, it.key) }
                .sortedByDescending { it.value }
                .take(3)
                .joinToString("  ·  ") { "${getAppLabel(pm, it.key)} ${formatTime(it.value)}" }

            val title = if (currentLabel != null)
                "now: $currentLabel  ·  ${formatTime(currentMs)}"
            else
                "scrolltopsy  ·  watching"

            val body = top3.ifEmpty { "no screen time recorded yet" }

            val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            nm.notify(NOTIF_ID, buildNotification(title, body))
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

    private fun buildNotification(title: String, text: String): Notification {
        val intent = Intent(this, MainActivity::class.java)
        val pending = PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_IMMUTABLE)
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(text)
            .setStyle(NotificationCompat.BigTextStyle().bigText(text))
            .setSmallIcon(android.R.drawable.ic_menu_view)
            .setContentIntent(pending)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setColor(0xE24B4A.toInt())
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val ch = NotificationChannel(
                CHANNEL_ID, "Live Usage Tracking",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Live screen time — updates every 10s"
                setShowBadge(false)
            }
            (getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager)
                .createNotificationChannel(ch)
        }
    }
}
