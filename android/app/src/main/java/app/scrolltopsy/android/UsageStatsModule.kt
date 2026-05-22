package app.scrolltopsy.android

import android.app.AppOpsManager
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.provider.Settings
import com.facebook.react.bridge.*
import java.util.Calendar

class UsageStatsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "UsageStats"

    @ReactMethod fun hasPermission(promise: Promise) {
        promise.resolve(isPermissionGranted())
    }

    @ReactMethod fun requestPermission() {
        val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        reactApplicationContext.startActivity(intent)
    }

    @ReactMethod fun getUsageStats(days: Double, promise: Promise) {
        if (!isPermissionGranted()) { promise.reject("PERMISSION_DENIED", "Usage stats permission not granted"); return }
        try {
            val usm = reactApplicationContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val pm = reactApplicationContext.packageManager
            val own = reactApplicationContext.packageName
            val now = System.currentTimeMillis()

            // Use start-of-day for day=1 (matches what user sees in Digital Wellbeing)
            val startMs = if (days.toInt() == 1) {
                Calendar.getInstance().apply {
                    set(Calendar.HOUR_OF_DAY, 0); set(Calendar.MINUTE, 0)
                    set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
                }.timeInMillis
            } else {
                Calendar.getInstance().apply { add(Calendar.DAY_OF_YEAR, -days.toInt()) }.timeInMillis
            }

            // Accurate per-app totals via UsageEvents
            val usageMap = mutableMapOf<String, Long>()
            val foregroundSince = mutableMapOf<String, Long>()
            val events = usm.queryEvents(startMs, now)
            val event = UsageEvents.Event()
            while (events?.hasNextEvent() == true) {
                events.getNextEvent(event)
                val pkg = event.packageName ?: continue
                if (pkg == own) continue
                when (event.eventType) {
                    UsageEvents.Event.MOVE_TO_FOREGROUND -> foregroundSince[pkg] = event.timeStamp
                    UsageEvents.Event.MOVE_TO_BACKGROUND -> foregroundSince.remove(pkg)?.let { since ->
                        usageMap[pkg] = (usageMap[pkg] ?: 0L) + (event.timeStamp - since)
                    }
                }
            }
            foregroundSince.forEach { (pkg, since) ->
                usageMap[pkg] = (usageMap[pkg] ?: 0L) + (now - since)
            }

            val result = WritableNativeArray()
            usageMap.entries
                .filter { it.value > 10_000L && isUserApp(pm, it.key) }
                .sortedByDescending { it.value }
                .take(30)
                .forEach { (pkg, ms) ->
                    val map = WritableNativeMap().apply {
                        putString("packageName", pkg)
                        putString("appName", getAppLabel(pm, pkg))
                        putDouble("totalMs", ms.toDouble())
                        putDouble("lastUsed", now.toDouble())
                        putInt("appCategory", getAndroidCategory(pm, pkg))
                    }
                    result.pushMap(map)
                }
            promise.resolve(result)
        } catch (e: Exception) { promise.reject("ERROR", e.message) }
    }

    @ReactMethod fun getCurrentForegroundApp(promise: Promise) {
        if (!isPermissionGranted()) { promise.resolve(null); return }
        try {
            val usm = reactApplicationContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val end = System.currentTimeMillis()
            val start = end - 5 * 60 * 1000L
            val stats = usm.queryUsageStats(UsageStatsManager.INTERVAL_BEST, start, end)
            val pm = reactApplicationContext.packageManager
            val own = reactApplicationContext.packageName
            val top = stats?.filter { it.packageName != own }?.maxByOrNull { it.lastTimeUsed }
            if (top != null && top.lastTimeUsed > System.currentTimeMillis() - 30000) {
                val map = WritableNativeMap().apply {
                    putString("packageName", top.packageName)
                    putString("appName", getAppLabel(pm, top.packageName))
                    putDouble("lastUsed", top.lastTimeUsed.toDouble())
                }
                promise.resolve(map)
            } else { promise.resolve(null) }
        } catch (e: Exception) { promise.resolve(null) }
    }

    private fun isPermissionGranted(): Boolean {
        val appOps = reactApplicationContext.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS,
            android.os.Process.myUid(), reactApplicationContext.packageName)
        return mode == AppOpsManager.MODE_ALLOWED
    }

    private fun getAppLabel(pm: PackageManager, pkg: String): String {
        return try {
            val info = pm.getApplicationInfo(pkg, 0)
            pm.getApplicationLabel(info).toString()
        } catch (e: Exception) { pkg.split(".").lastOrNull() ?: pkg }
    }

    private fun getAndroidCategory(pm: PackageManager, pkg: String): Int {
        return try {
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                pm.getApplicationInfo(pkg, 0).category
            } else -1
        } catch (e: Exception) { -1 }
    }

    private fun isUserApp(pm: PackageManager, pkg: String): Boolean {
        return try {
            val flags = pm.getApplicationInfo(pkg, 0).flags
            (flags and android.content.pm.ApplicationInfo.FLAG_SYSTEM) == 0
        } catch (e: Exception) { true }
    }
}
