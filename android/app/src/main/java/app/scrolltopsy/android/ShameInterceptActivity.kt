package app.scrolltopsy.android

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
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

        private val GENERIC_MESSAGES = listOf(
            "you said you were done.\nyou lied.",
            "what exactly do you think\nyou'll find in there this time?",
            "the void called.\nyou answered.",
            "you literally set a limit on this.\nyou're here anyway.",
            "congratulations on\nignoring yourself.",
            "your future self is watching.\nthey're not impressed.",
            "you already hit your limit.\nwhat changed in the last 30 seconds?",
            "reopening it won't feel different.\nyou already know how this ends.",
            "you set this limit because\nyou knew you couldn't stop.",
            "back again.\nbeen here before, haven't you.",
            "the slot machine brain wins again.",
            "what you're looking for\nisn't in there. but sure.",
            "every time you do this\nyou make it harder to stop next time.",
            "you knew this would happen.\npart of you planned for it.",
            "back here again.\nthe app didn't miss you.\nyou missed the feeling.",
        )

        private val APP_INTERCEPT_MESSAGES = mapOf(
            "instagram" to listOf(
                "you checked whether anyone liked you.\nthe number changed nothing.",
                "you came back to see if anything changed.\nnothing did. it never does.",
                "you opened instagram because you were bored.\nyou'll close it feeling worse.\nthis is not a coincidence.",
                "you scrolled past strangers performing happiness for an algorithm.\nnone of it was real.",
                "the reel is 30 seconds.\nyou watched many of them.\nno thought you had was your own.",
            ),
            "tiktok" to listOf(
                "tiktok's entire purpose is to make\ntime disappear without you noticing.\nit worked on you again.",
                "the algorithm learned something about your insecurities today.\nyou donated that knowledge freely.",
                "you were going to do something.\ntiktok remembered that you say that every time.",
                "designed by engineers to be unputdownable.\nyou just confirmed their product works.",
                "your attention span is now slightly shorter\nthan it was this morning.",
            ),
            "youtube" to listOf(
                "you watched someone else\ndo the thing you said you wanted to do.",
                "passive consumption. no skill gained.\nno conversation had. no step taken.",
                "the autoplay feature exists because\nyou've proven you won't stop yourself.\nit was right.",
                "you were avoiding something.\nyoutube held you in that avoidance.\nit's still there.",
                "your to-do list didn't shrink\nwhile you were gone.",
            ),
            "youtube.music" to listOf(
                "you called it background music.\nyou meant distraction.",
                "you weren't enjoying music.\nyou were postponing the silence\nwhere your thoughts live.",
                "audio chosen by an algorithm\nthat profits from your continued presence.",
            ),
            "twitter" to listOf(
                "other people's anger.\nyou absorbed it. you'll carry it.",
                "you checked twitter to understand the world.\nyou left more confused and more anxious.\nas designed.",
                "scrolling through outrage.\nnone of it required your presence.\nall of it got it anyway.",
            ),
            "reddit" to listOf(
                "proving to strangers\nyou're smarter than them.\nnobody won.",
                "reddit gave you the feeling of being informed\nwithout the inconvenience of doing anything about it.",
                "communities designed to make you feel\nyou belong somewhere.\nyou left feeling the same as before.",
            ),
            "snapchat" to listOf(
                "the streak is a leash they put on you\nand told you to maintain.",
                "documenting your life for people\nyou wouldn't call if something was wrong.",
                "snap exists to make you afraid of being forgotten.\nyou're here feeding that fear.",
            ),
            "facebook" to listOf(
                "a platform that knows more about your psychology\nthan your closest friends.\nyou just gave it more data.",
                "you were the product.\nthe algorithm flagged this as engagement.",
                "content that made you feel slightly worse\nabout people you used to care about.",
            ),
            "whatsapp" to listOf(
                "they didn't suddenly need you.\nthe message you're afraid to miss\nwas not there.",
                "monitoring other people's activity timestamps.\nthis is not connection. this is anxiety.",
                "you checked. nothing changed.\nyou'll check again in 10 minutes.",
                "the blue tick doesn't mean they need you right now.\nyou know that. you're here anyway.",
                "everyone is fine. the status update told you.\nyou came back to check again.",
            ),
            "netflix" to listOf(
                "you said one more episode.\nyou're back.",
                "content designed to end on a moment\nthat makes stopping feel wrong.\nthey were right about you.",
                "you were tired. netflix kept you awake\nso you'd be more tired tomorrow.",
            ),
            "streaming" to listOf(
                "you queued up a show\nyou'll fall asleep watching.",
                "content selected by an algorithm\nthat knows your weaknesses better than you do.",
                "one more episode is never one more episode.\nthe platform was designed around that fact.",
                "you're not relaxing.\nyou're anesthetising.",
            ),
            "spotify" to listOf(
                "you called it background music.\nyou meant distraction.",
                "mood-matching playlist selected so you\nnever have to sit with your actual mood.",
                "curated by an algorithm\nprofiting from your continued presence.",
            ),
            "audio" to listOf(
                "you weren't enjoying music.\nyou were postponing the silence\nwhere your thoughts live.",
                "noise to avoid noticing\nyou're avoiding something.",
            ),
            "social" to listOf(
                "you checked to see if anyone was thinking of you.\nnothing changed.",
                "performance of connection\nwithout the risk of actual vulnerability.",
                "you're here because the silence felt louder\nthan whatever is in there.",
            ),
            "chrome" to listOf(
                "the infinite scroll\nin a different container.",
                "you opened a browser to 'just look something up'.\nyou know how this goes.",
                "boundless distraction\nwith no algorithm to blame it on this time.",
            ),
            "games" to listOf(
                "a world designed to be\nmore rewarding than your actual life.\nby design, not coincidence.",
                "the game gave you a sense of progress.\nyour real-life tasks did not progress.",
                "the dopamine was engineered.\nthe achievement was not real.\nyou knew this. you played anyway.",
            ),
            "clash" to listOf(
                "attacking strangers\nto generate metrics for a quarterly report.",
                "clash exists because you need the feeling of winning something.\nit sold you that feeling. you bought it.",
            ),
            "pubg" to listOf(
                "manufactured survival instinct.\nyour actual life went unattended.",
                "no skill gained here\ntransfers outside the game.",
            ),
            "shopping" to listOf(
                "you came for one thing.\nyou stayed for things you don't need.",
                "retail therapy isn't therapy.\nbrowsing changed nothing about how you feel.",
                "the app's job is to convert your boredom into purchases.\nit's very good at its job.",
            ),
            "news" to listOf(
                "events happening to other people\nin places you cannot affect.\nyour presence here changed nothing.",
                "you checked the news to feel informed.\nyou feel anxious instead.\nthis happens every time.",
                "the world's problems are still there.\nyou just know more of them now.",
            ),
        )
    }

    private fun getAppCategory(pkg: String): String? {
        // Exact package → category: accurate for known apps regardless of name
        val exactMap = mapOf(
            "com.whatsapp" to "whatsapp", "com.whatsapp.w4b" to "whatsapp",
            "com.instagram.android" to "instagram", "com.instagram.lite" to "instagram",
            "com.facebook.katana" to "facebook", "com.facebook.lite" to "facebook",
            "com.facebook.orca" to "facebook", "com.facebook.mlite" to "facebook",
            "com.snapchat.android" to "snapchat",
            "com.twitter.android" to "twitter", "com.twitter.lite" to "twitter",
            "com.X.android" to "twitter",
            "com.reddit.frontpage" to "reddit",
            "com.zhiliaoapp.musically" to "tiktok", "com.ss.android.ugc.trill" to "tiktok",
            "com.ss.android.ugc.aweme" to "tiktok",
            "com.linkedin.android" to "social",
            "com.pinterest" to "social",
            "com.discord" to "social",
            "org.telegram.messenger" to "social", "org.telegram.messenger.web" to "social",
            "org.telegram.plus" to "social",
            "com.viber.voip" to "social",
            "com.skype.raider" to "social",
            "com.netflix.mediaclient" to "netflix",
            "com.google.android.youtube" to "youtube",
            "com.google.android.apps.youtube.music" to "youtube.music",
            "in.startv.hotstar" to "streaming", "com.hotstar.android" to "streaming",
            "com.disney.disneyplus" to "streaming",
            "com.amazon.avod.thirdpartyclient" to "streaming",
            "com.mxtech.videoplayer.ad" to "streaming",
            "com.mxtech.videoplayer.pro" to "streaming",
            "com.spotify.music" to "spotify",
            "com.jiosaavn" to "audio", "com.gaana" to "audio",
            "com.wynk.music" to "audio", "com.soundcloud.android" to "audio",
            "in.amazon.mShop.android.shopping" to "shopping",
            "com.amazon.mShop.android.shopping" to "shopping",
            "com.flipkart.android" to "shopping",
            "com.myntra.android" to "shopping",
            "com.meesho.supply" to "shopping",
            "net.ajio.app" to "shopping",
            "com.nykaa.android" to "shopping",
            "com.alibaba.aliexpresshd" to "shopping",
            "com.ebay.mobile" to "shopping",
            "com.inshorts" to "news",
            "com.ndtv.news" to "news", "com.ndtv.app" to "news",
            "com.aajtak.mobile" to "news",
            "in.dailyhunt" to "news",
            "com.google.android.apps.newsd" to "news",
            "com.eterno" to "news",
            "com.supercell.clashofclans" to "clash",
            "com.supercell.clashroyale" to "clash",
            "com.tencent.ig" to "pubg", "com.pubg.imobile" to "pubg",
            "com.garena.freefiremax" to "games", "com.garena.freefire" to "games",
            "com.king.candycrushsaga" to "games",
            "com.roblox.client" to "games",
            "com.mojang.minecraftpe" to "games",
            "com.android.chrome" to "chrome",
            "org.mozilla.firefox" to "chrome",
            "com.microsoft.emmx" to "chrome",
            "com.opera.browser" to "chrome",
            "com.UCMobile.intl" to "chrome",
            "com.brave.browser" to "chrome",
        )
        exactMap[pkg]?.let { return it }

        // Substring fallback for variants / regional builds
        val p = pkg.lowercase()
        val substrMatch = when {
            p.contains("instagram") -> "instagram"
            p.contains("youtube.music") || p.contains("youtubemusic") -> "youtube.music"
            p.contains("youtube") -> "youtube"
            p.contains("tiktok") || p.contains("musically") -> "tiktok"
            p.contains("twitter") || p.contains(".x.android") -> "twitter"
            p.contains("reddit") -> "reddit"
            p.contains("snapchat") -> "snapchat"
            p.contains("facebook") || p.contains("fb.katana") -> "facebook"
            p.contains("whatsapp") -> "whatsapp"
            p.contains("netflix") -> "netflix"
            p.contains("spotify") -> "spotify"
            p.contains("hotstar") || p.contains("disneyplus") -> "streaming"
            p.contains("clash") -> "clash"
            p.contains("pubg") || p.contains("battlegrounds") -> "pubg"
            p.contains("amazon") && !p.contains("music") && !p.contains("alexa") && !p.contains("echo") -> "shopping"
            p.contains("flipkart") || p.contains("myntra") || p.contains("ajio") || p.contains("meesho") -> "shopping"
            p.contains("inshorts") || p.contains("ndtv") || p.contains("dailyhunt") -> "news"
            p.contains("telegram") || p.contains("discord") || p.contains("viber") -> "social"
            else -> null
        }
        if (substrMatch != null) return substrMatch

        // Final fallback: use Android's own app category metadata
        return try {
            val appInfo = packageManager.getApplicationInfo(pkg, 0)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                when (appInfo.category) {
                    ApplicationInfo.CATEGORY_SOCIAL -> "social"
                    ApplicationInfo.CATEGORY_VIDEO -> "streaming"
                    ApplicationInfo.CATEGORY_AUDIO -> "audio"
                    ApplicationInfo.CATEGORY_NEWS -> "news"
                    ApplicationInfo.CATEGORY_GAME -> "games"
                    else -> null
                }
            } else null
        } catch (_: Exception) { null }
    }

    private fun getMessageForPkg(pkg: String, index: Int): String {
        val category = getAppCategory(pkg)
        val pool = if (category != null) APP_INTERCEPT_MESSAGES[category] else null
        return pool?.get(index % pool.size) ?: GENERIC_MESSAGES[index % GENERIC_MESSAGES.size]
    }

    private var currentScreen = 0
    private var totalScreens = 1
    private lateinit var pkg: String
    private lateinit var appName: String
    private lateinit var mono: Typeface
    private var isDark = true

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        isShowing = true
        overridePendingTransition(0, 0) // zero-delay: no slide/fade animation

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
        isDark = getSharedPreferences(BlockerModule.PREFS_NAME, Context.MODE_PRIVATE)
            .getBoolean(BlockerModule.KEY_THEME_DARK, true)

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
        finish()
        overridePendingTransition(0, 0)
    }

    private fun renderScreen() {
        val dp = resources.displayMetrics.density

        val bgColor = if (isDark) "#0a0a0a" else "#f5f5f5"
        val msgColor = if (isDark) "#cccccc" else "#1a1a1a"
        val counterColor = if (isDark) "#2a2a2a" else "#bbbbbb"
        val btnIdleColor = if (isDark) "#444444" else "#aaaaaa"

        val root = FrameLayout(this).apply {
            setBackgroundColor(Color.parseColor(bgColor))
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
            setTextColor(Color.parseColor(counterColor))
            textSize = 10f
            typeface = mono
            letterSpacing = 0.1f
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, (56 * dp).toInt())
        }

        val message = TextView(this).apply {
            text = getMessageForPkg(pkg, currentScreen)
            setTextColor(Color.parseColor(msgColor))
            textSize = 17f
            typeface = mono
            gravity = Gravity.CENTER
            setLineSpacing(0f, 1.7f)
            setPadding(0, 0, 0, (80 * dp).toInt())
        }

        val isLast = currentScreen >= totalScreens - 1
        val btn = TextView(this).apply {
            text = if (isLast) "fine. open it." else "still wanting to open?"
            setTextColor(Color.parseColor(if (isLast) "#E24B4A" else btnIdleColor))
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
        // Keep block entry so service can re-intercept on next open — just set a 30s grace timestamp
        getSharedPreferences(BlockerModule.PREFS_NAME, Context.MODE_PRIVATE).edit()
            .putLong("${BlockerModule.KEY_GAUNTLET_TS}$pkg", System.currentTimeMillis())
            .apply()

        val launchIntent = packageManager.getLaunchIntentForPackage(pkg)
        if (launchIntent != null) {
            launchIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED
            startActivity(launchIntent)
        }
        finish()
        overridePendingTransition(0, 0)
    }
}
