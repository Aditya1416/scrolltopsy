package app.scrolltopsy.android

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.os.Build
import android.provider.Settings
import android.view.accessibility.AccessibilityEvent

class BlockAccessibilityService : AccessibilityService() {

    companion object {
        @Volatile var isEnabled = false
        // Current foreground package, readable by TrackingService for live notification
        @Volatile var currentFgPkg: String? = null

        fun isGranted(context: Context): Boolean {
            return try {
                val services = Settings.Secure.getString(
                    context.contentResolver,
                    Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
                ) ?: return false
                services.contains("${context.packageName}/.BlockAccessibilityService")
            } catch (_: Exception) { false }
        }
    }

    private var lastBlockedPkg: String? = null
    private var lastBlockedAt = 0L
    private lateinit var blockerPrefs: SharedPreferences

    override fun onServiceConnected() {
        isEnabled = true
        blockerPrefs = getSharedPreferences(BlockerModule.PREFS_NAME, Context.MODE_PRIVATE)
        serviceInfo = AccessibilityServiceInfo().apply {
            eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED or
                         AccessibilityEvent.TYPE_WINDOWS_CHANGED
            feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
            notificationTimeout = 0
        }
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        event ?: return
        if (event.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return
        val pkg = event.packageName?.toString() ?: return
        if (pkg == packageName) return

        currentFgPkg = pkg

        val blockEntry = blockerPrefs.getLong("${BlockerModule.KEY_PREFIX}$pkg", 0L)
        if (blockEntry == 0L) return

        val forceStop = blockerPrefs.getBoolean("${BlockerModule.KEY_FORCE_STOP}$pkg", false)
        if (!forceStop) return

        if (ShameInterceptActivity.isShowing) return

        val gauntletTs = blockerPrefs.getLong("${BlockerModule.KEY_GAUNTLET_TS}$pkg", 0L)
        val now = System.currentTimeMillis()
        if (now - gauntletTs < 3 * 60_000L) return

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) return

        // Debounce: don't re-intercept the same app within 2s (handles multi-activity launches)
        if (pkg == lastBlockedPkg && now - lastBlockedAt < 2_000L) return
        lastBlockedPkg = pkg
        lastBlockedAt = now

        val screenCount = blockerPrefs.getInt("${BlockerModule.KEY_SCREENS}$pkg", 1)
        val appName = try {
            packageManager.getApplicationLabel(packageManager.getApplicationInfo(pkg, 0)).toString()
        } catch (_: Exception) { pkg.split(".").last() }

        val intent = Intent(this, ShameInterceptActivity::class.java).apply {
            putExtra(ShameInterceptActivity.EXTRA_PKG, pkg)
            putExtra(ShameInterceptActivity.EXTRA_APP_NAME, appName)
            putExtra(ShameInterceptActivity.EXTRA_SCREEN_COUNT, screenCount)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                    Intent.FLAG_ACTIVITY_SINGLE_TOP or
                    Intent.FLAG_ACTIVITY_NO_ANIMATION
        }
        startActivity(intent)
    }

    override fun onInterrupt() {}

    override fun onDestroy() {
        isEnabled = false
        currentFgPkg = null
        super.onDestroy()
    }
}
