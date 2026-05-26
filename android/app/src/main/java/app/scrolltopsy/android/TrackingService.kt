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
import android.provider.Settings
import androidx.core.app.NotificationCompat
import java.util.Calendar
import kotlin.math.max

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
    private val blockCheckRunnable = object : Runnable {
        override fun run() {
            checkBlockedApps()
            handler.postDelayed(this, 1_500L)
        }
    }

    // Tracks the highest shame level already fired per app today
    private val alreadyShamed = mutableMapOf<String, Int>()
    // Tracks blocked apps currently in foreground (to only intercept on entry, not continuously)
    private val blockedAppsInFg = mutableSetOf<String>()
    // Last known foreground pkg (for detecting fg exits)
    private var lastFgPkg: String? = null

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
        handler.postDelayed(blockCheckRunnable, 2_000L)
        return START_NOT_STICKY
    }

    override fun onDestroy() {
        isRunning = false
        handler.removeCallbacks(pollRunnable)
        handler.removeCallbacks(blockCheckRunnable)
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
            // 30-minute window handles Samsung's delayed event delivery
            val events = usm.queryEvents(now - 30 * 60_000L, now) ?: return null
            var currentFg: String? = null
            // True when our own app holds the most recent MOVE_TO_FOREGROUND; suppresses fallback.
            var ownAppInFg = false
            // Samsung One UI sometimes skips MOVE_TO_FOREGROUND for user apps; track the last
            // ACTIVITY_RESUMED as a fallback. Never override a primary MOVE_TO_FOREGROUND result —
            // Samsung also fires ACTIVITY_RESUMED for system components (keyboard, SoundAlive) which
            // would otherwise shadow the real foreground user app.
            var lastResumedFallback: String? = null
            val event = UsageEvents.Event()
            while (events.hasNextEvent()) {
                events.getNextEvent(event)
                val pkg = event.packageName ?: continue
                when (event.eventType) {
                    UsageEvents.Event.MOVE_TO_FOREGROUND -> {
                        if (pkg == packageName) {
                            ownAppInFg = true
                            currentFg = null
                        } else {
                            ownAppInFg = false
                            currentFg = pkg
                        }
                    }
                    UsageEvents.Event.MOVE_TO_BACKGROUND -> {
                        if (pkg == packageName) ownAppInFg = false
                        if (currentFg == pkg) currentFg = null
                    }
                }
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q &&
                    event.eventType == UsageEvents.Event.ACTIVITY_RESUMED &&
                    pkg != packageName) {
                    lastResumedFallback = pkg
                }
            }
            // Suppress fallback when our own app is currently in the foreground (scrolltopsy or
            // ShameInterceptActivity) — the stale lastResumedFallback would be a different app.
            val result = if (ownAppInFg) null else (currentFg ?: lastResumedFallback)
            android.util.Log.d("STFgPkg", "currentFg=$currentFg ownAppInFg=$ownAppInFg fallback=$lastResumedFallback → $result")
            result
        } catch (e: Exception) { null }
    }

    // ── Quota / Shame ─────────────────────────────────────────────────────────

    private fun checkQuotas(usage: Map<String, Long>) {
        val prefs = getSharedPreferences(QuotaModule.PREFS_NAME, Context.MODE_PRIVATE)
        val blockerPrefs = getSharedPreferences(BlockerModule.PREFS_NAME, Context.MODE_PRIVATE)
        val pm = packageManager

        usage.forEach { (pkg, ms) ->
            val limitMins = prefs.getInt("${QuotaModule.KEY_PREFIX}$pkg", 0)
            if (limitMins <= 0) {
                alreadyShamed.remove(pkg)
                // Clear any stale block entry when quota is removed
                if (blockerPrefs.contains("${BlockerModule.KEY_PREFIX}$pkg")) {
                    blockerPrefs.edit()
                        .remove("${BlockerModule.KEY_PREFIX}$pkg")
                        .remove("${BlockerModule.KEY_SCREENS}$pkg")
                        .remove("${BlockerModule.KEY_GAUNTLET_TS}$pkg")
                        .apply()
                    blockedAppsInFg.remove(pkg)
                }
                return@forEach
            }

            val usageMins = ms / 60_000L
            val overMins = usageMins - limitMins

            if (overMins < 0) {
                alreadyShamed.remove(pkg)
                // Clear block since usage dropped back under quota
                if (blockerPrefs.contains("${BlockerModule.KEY_PREFIX}$pkg")) {
                    blockerPrefs.edit()
                        .remove("${BlockerModule.KEY_PREFIX}$pkg")
                        .remove("${BlockerModule.KEY_SCREENS}$pkg")
                        .remove("${BlockerModule.KEY_GAUNTLET_TS}$pkg")
                        .apply()
                    blockedAppsInFg.remove(pkg)
                }
                return@forEach
            }

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

            // Write/update block entry every cycle when force-stop is enabled and over quota.
            // Removing the !contains guard ensures the entry is written even if the service
            // restarted after force_stop was set, or if a previous write was missed.
            val forceStop = blockerPrefs.getBoolean("${BlockerModule.KEY_FORCE_STOP}$pkg", false)
            if (forceStop) {
                val screenCount = max(1, limitMins / 60 + 1)
                val existingTs = blockerPrefs.getLong("${BlockerModule.KEY_PREFIX}$pkg", 0L)
                blockerPrefs.edit()
                    .putLong("${BlockerModule.KEY_PREFIX}$pkg",
                        if (existingTs > 0L) existingTs else System.currentTimeMillis())
                    .putInt("${BlockerModule.KEY_SCREENS}$pkg", screenCount)
                    .apply()
                if (existingTs == 0L) {
                    try {
                        (getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager)
                            .killBackgroundProcesses(pkg)
                    } catch (_: Exception) {}
                }
            }
        }
    }

    // ── Blocked app interception ──────────────────────────────────────────────

    private fun checkBlockedApps() {
        val blockerPrefs = getSharedPreferences(BlockerModule.PREFS_NAME, Context.MODE_PRIVATE)
        val blockedPkgs = blockerPrefs.all.keys
            .filter { it.startsWith(BlockerModule.KEY_PREFIX) }
            .map { it.removePrefix(BlockerModule.KEY_PREFIX) }

        val currentFg = getCurrentForegroundPkg()

        // Track foreground exits: when pkg leaves fg, clear tracking so next entry triggers intercept
        val prev = lastFgPkg
        if (prev != null && prev != currentFg) {
            android.util.Log.d("STBlock", "fg exit: $prev → removing from blockedInFg")
            blockedAppsInFg.remove(prev)
        }
        lastFgPkg = currentFg

        if (blockedPkgs.isEmpty()) return
        android.util.Log.d("STBlock", "fg=$currentFg blockedPkgs=$blockedPkgs blockedInFg=$blockedAppsInFg isShowing=${ShameInterceptActivity.isShowing}")
        if (ShameInterceptActivity.isShowing) { android.util.Log.d("STBlock", "SKIP: isShowing"); return }
        if (currentFg == null || currentFg !in blockedPkgs) { android.util.Log.d("STBlock", "SKIP: fg null or not blocked"); return }
        if (currentFg in blockedAppsInFg) { android.util.Log.d("STBlock", "SKIP: already in blockedInFg"); return }

        // Grace period: don't re-intercept within 30s of completing the gauntlet
        val gauntletTs = blockerPrefs.getLong("${BlockerModule.KEY_GAUNTLET_TS}$currentFg", 0L)
        if (System.currentTimeMillis() - gauntletTs < 30_000L) {
            android.util.Log.d("STBlock", "SKIP: gauntlet grace period active")
            blockedAppsInFg.add(currentFg)
            return
        }

        // Overlay permission is required to start an activity from a background service
        // on Android 10+. Without it, startActivity() silently fails.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
            android.util.Log.d("STBlock", "SKIP: no overlay permission")
            blockedAppsInFg.add(currentFg) // don't spam-retry on every 1.5s tick
            return
        }

        blockedAppsInFg.add(currentFg)
        val screenCount = blockerPrefs.getInt("${BlockerModule.KEY_SCREENS}$currentFg", 1)
        val appDisplayName = getAppLabel(packageManager, currentFg)

        android.util.Log.d("STBlock", "LAUNCHING ShameInterceptActivity for $currentFg screens=$screenCount")
        val intent = Intent(this, ShameInterceptActivity::class.java).apply {
            putExtra(ShameInterceptActivity.EXTRA_PKG, currentFg)
            putExtra(ShameInterceptActivity.EXTRA_APP_NAME, appDisplayName)
            putExtra(ShameInterceptActivity.EXTRA_SCREEN_COUNT, screenCount)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        startActivity(intent)
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
            .setSmallIcon(R.drawable.ic_notification)
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

            val userApps = usage.entries
                .filter { it.key != packageName && isUserApp(pm, it.key) }
                .sortedByDescending { it.value }

            val totalMs = userApps.sumOf { it.value }
            val totalMins = totalMs / 60_000L

            val top5 = userApps.take(5)
                .joinToString("  ·  ") { "${getAppLabel(pm, it.key)} ${formatTime(it.value)}" }

            val title = if (currentLabel != null)
                "still on $currentLabel  ·  ${formatTime(currentMs)} gone."
            else if (totalMins > 0)
                "${formatTime(totalMs)} lost today."
            else
                "scrolltopsy  ·  watching."

            val body = if (top5.isNotEmpty()) "today's damage: $top5" else "no screen time recorded yet"

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
            .setSmallIcon(R.drawable.ic_notification)
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
