package app.scrolltopsy.android

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.os.Build
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.view.WindowInsets
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView

class ShameInterceptActivity : Activity() {

    companion object {
        const val EXTRA_PKG = "pkg"
        const val EXTRA_APP_NAME = "app_name"
        const val EXTRA_SCREEN_COUNT = "screen_count"

        var isShowing = false

        private val SHAME_MESSAGES = listOf(
            "you said you were done.\nyou lied.",
            "what exactly do you think\nyou'll find in there this time?",
            "the void called.\nyou answered.",
            "you literally built a timer\nto stop this from happening.",
            "this is exactly what\nyou were trying to avoid.",
            "congratulations on\nignoring yourself.",
            "your future self is watching.\nthey're not impressed.",
            "you already hit your limit.\nwhat changed in the last 30 seconds?",
            "reopening it won't feel different.\nyou already know how this ends.",
            "it'll still be there tomorrow.\nyou'll still feel bad tomorrow.",
            "you set this limit because\nyou knew you couldn't stop.",
            "back again.\nbeen here before, haven't you.",
            "the slot machine brain wins again.",
            "what you're looking for\nisn't in there. but sure.",
            "every time you do this\nyou make it harder to stop next time.",
        )
    }

    private var currentScreen = 0
    private var totalScreens = 1
    private lateinit var pkg: String
    private lateinit var appName: String
    private lateinit var mono: Typeface

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        isShowing = true

        window.apply {
            addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
                setShowWhenLocked(true)
                setTurnScreenOn(true)
            } else {
                @Suppress("DEPRECATION")
                addFlags(
                    WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                    WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
                )
            }
            decorView.systemUiVisibility =
                View.SYSTEM_UI_FLAG_FULLSCREEN or
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            setBackgroundDrawableResource(android.R.color.transparent)
        }

        pkg = intent.getStringExtra(EXTRA_PKG) ?: run { finish(); return }
        appName = intent.getStringExtra(EXTRA_APP_NAME) ?: pkg.split(".").last()
        totalScreens = intent.getIntExtra(EXTRA_SCREEN_COUNT, 1).coerceIn(1, 20)

        mono = try {
            Typeface.createFromAsset(assets, "fonts/SpaceMono_Regular.ttf")
        } catch (_: Exception) { Typeface.MONOSPACE }

        renderScreen()
    }

    override fun onDestroy() {
        isShowing = false
        super.onDestroy()
    }

    // Intercept back — going back without completing = don't open the app,
    // but block persists so next open attempt shows shame screens again.
    override fun onBackPressed() {
        finish() // just close, no app launch
    }

    private fun renderScreen() {
        val dp = resources.displayMetrics.density

        val root = FrameLayout(this).apply {
            setBackgroundColor(Color.parseColor("#0a0a0a"))
        }

        val container = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
            setPadding((32 * dp).toInt(), (60 * dp).toInt(), (32 * dp).toInt(), (60 * dp).toInt())
        }

        val appLabel = TextView(this).apply {
            text = appName.lowercase()
            setTextColor(Color.parseColor("#E24B4A"))
            textSize = 11f
            typeface = mono
            letterSpacing = 0.15f
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, (16 * dp).toInt())
        }

        val counter = TextView(this).apply {
            text = "screen ${currentScreen + 1} of $totalScreens"
            setTextColor(Color.parseColor("#2a2a2a"))
            textSize = 10f
            typeface = mono
            letterSpacing = 0.1f
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, (56 * dp).toInt())
        }

        val msgIndex = currentScreen % SHAME_MESSAGES.size
        val message = TextView(this).apply {
            text = SHAME_MESSAGES[msgIndex]
            setTextColor(Color.parseColor("#cccccc"))
            textSize = 17f
            typeface = mono
            gravity = Gravity.CENTER
            setLineSpacing(0f, 1.7f)
            setPadding(0, 0, 0, (80 * dp).toInt())
        }

        val isLast = currentScreen >= totalScreens - 1
        val btn = TextView(this).apply {
            text = if (isLast) "fine. open it." else "still wanting to open?"
            setTextColor(Color.parseColor(if (isLast) "#E24B4A" else "#444444"))
            textSize = 11f
            typeface = mono
            letterSpacing = 0.08f
            gravity = Gravity.CENTER
            setPadding(0, (32 * dp).toInt(), 0, 0)
            setOnClickListener {
                if (isLast) {
                    clearBlockAndOpen()
                } else {
                    currentScreen++
                    renderScreen()
                }
            }
        }

        container.addView(appLabel)
        container.addView(counter)
        container.addView(message)
        container.addView(btn)
        root.addView(container)
        setContentView(root)
    }

    private fun clearBlockAndOpen() {
        getSharedPreferences(BlockerModule.PREFS_NAME, Context.MODE_PRIVATE).edit()
            .remove("${BlockerModule.KEY_PREFIX}$pkg")
            .remove("${BlockerModule.KEY_SCREENS}$pkg")
            .apply()

        val launchIntent = packageManager.getLaunchIntentForPackage(pkg)
        if (launchIntent != null) {
            launchIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED
            startActivity(launchIntent)
        }
        finish()
    }
}
