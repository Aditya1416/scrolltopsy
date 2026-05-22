package app.scrolltopsy.android

import android.content.Context
import com.facebook.react.bridge.*

class QuotaModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "AppQuota"

    private val prefs get() = reactApplicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    companion object {
        const val PREFS_NAME = "scrolltopsy_quotas"
        const val KEY_PREFIX = "quota_"
    }

    @ReactMethod fun setQuota(packageName: String, limitMins: Double) {
        prefs.edit().putInt("$KEY_PREFIX$packageName", limitMins.toInt()).apply()
    }

    @ReactMethod fun clearQuota(packageName: String) {
        prefs.edit().remove("$KEY_PREFIX$packageName").apply()
    }

    @ReactMethod fun getQuota(packageName: String, promise: Promise) {
        promise.resolve(prefs.getInt("$KEY_PREFIX$packageName", 0).toDouble())
    }

    @ReactMethod fun getAllQuotas(promise: Promise) {
        val result = WritableNativeMap()
        prefs.all.forEach { (key, value) ->
            if (key.startsWith(KEY_PREFIX) && value is Int && value > 0) {
                result.putDouble(key.removePrefix(KEY_PREFIX), value.toDouble())
            }
        }
        promise.resolve(result)
    }
}
