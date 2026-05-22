package app.scrolltopsy.android

import android.content.Intent
import android.os.Build
import com.facebook.react.bridge.*

class TrackingServiceModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "TrackingService"

    @ReactMethod fun startService() {
        val intent = Intent(reactApplicationContext, TrackingService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            reactApplicationContext.startForegroundService(intent)
        } else {
            reactApplicationContext.startService(intent)
        }
    }

    @ReactMethod fun stopService() {
        reactApplicationContext.stopService(Intent(reactApplicationContext, TrackingService::class.java))
    }

    @ReactMethod fun isRunning(promise: Promise) {
        promise.resolve(TrackingService.isRunning)
    }
}
