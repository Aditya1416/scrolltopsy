package app.scrolltopsy.android

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.*

class BlockerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "AppBlocker"

    companion object {
        const val PREFS_NAME = "scrolltopsy_blocks"
        const val KEY_PREFIX = "block_"
        const val KEY_SCREENS = "screens_"
        const val KEY_FORCE_STOP = "force_stop_"
        const val KEY_GAUNTLET_TS = "gauntlet_ts_"
        const val KEY_BLOCK_ENABLED = "block_on_overtime_enabled" // legacy, unused
        const val KEY_THEME_DARK = "theme_dark"
    }

    private val prefs get() = reactApplicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    @ReactMethod fun setForceStop(packageName: String, enabled: Boolean) {
        prefs.edit().putBoolean("$KEY_FORCE_STOP$packageName", enabled).apply()
    }

    @ReactMethod fun isForceStopEnabled(packageName: String, promise: Promise) {
        promise.resolve(prefs.getBoolean("$KEY_FORCE_STOP$packageName", false))
    }

    @ReactMethod fun setBlockEnabled(enabled: Boolean) {
        prefs.edit().putBoolean(KEY_BLOCK_ENABLED, enabled).apply()
    }

    @ReactMethod fun isBlockEnabled(promise: Promise) {
        promise.resolve(prefs.getBoolean(KEY_BLOCK_ENABLED, false))
    }

    @ReactMethod fun blockApp(packageName: String, screenCount: Double) {
        prefs.edit()
            .putLong("$KEY_PREFIX$packageName", System.currentTimeMillis())
            .putInt("$KEY_SCREENS$packageName", screenCount.toInt().coerceIn(1, 20))
            .apply()
    }

    @ReactMethod fun unblockApp(packageName: String) {
        prefs.edit()
            .remove("$KEY_PREFIX$packageName")
            .remove("$KEY_SCREENS$packageName")
            .remove("$KEY_GAUNTLET_TS$packageName")
            .apply()
    }

    @ReactMethod fun clearGauntlet(packageName: String) {
        prefs.edit().remove("${KEY_GAUNTLET_TS}$packageName").apply()
    }

    @ReactMethod fun setThemeDark(isDark: Boolean) {
        prefs.edit().putBoolean(KEY_THEME_DARK, isDark).apply()
    }

    @ReactMethod fun getBlockedApps(promise: Promise) {
        val result = WritableNativeArray()
        prefs.all.forEach { (key, value) ->
            if (key.startsWith(KEY_PREFIX)) {
                val pkg = key.removePrefix(KEY_PREFIX)
                val screens = prefs.getInt("$KEY_SCREENS$pkg", 1)
                val map = WritableNativeMap().apply {
                    putString("packageName", pkg)
                    putInt("screenCount", screens)
                    putDouble("blockedAt", (value as? Long ?: 0L).toDouble())
                }
                result.pushMap(map)
            }
        }
        promise.resolve(result)
    }

    @ReactMethod fun hasOverlayPermission(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            promise.resolve(Settings.canDrawOverlays(reactApplicationContext))
        } else {
            promise.resolve(true)
        }
    }

    @ReactMethod fun hasAccessibilityPermission(promise: Promise) {
        promise.resolve(BlockAccessibilityService.isGranted(reactApplicationContext))
    }

    @ReactMethod fun requestAccessibilityPermission() {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        reactApplicationContext.startActivity(intent)
    }

    @ReactMethod fun requestOverlayPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:${reactApplicationContext.packageName}")
            ).apply { flags = Intent.FLAG_ACTIVITY_NEW_TASK }
            reactApplicationContext.startActivity(intent)
        }
    }
}
