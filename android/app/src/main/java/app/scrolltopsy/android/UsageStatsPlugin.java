package app.scrolltopsy.android;

import android.app.AppOpsManager;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.provider.Settings;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.List;

@CapacitorPlugin(name = "UsageStats")
public class UsageStatsPlugin extends Plugin {

    @PluginMethod
    public void hasPermission(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("granted", isPermissionGranted());
        call.resolve(ret);
    }

    @PluginMethod
    public void requestPermission(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        JSObject ret = new JSObject();
        ret.put("opened", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void queryTopApp(PluginCall call) {
        if (!isPermissionGranted()) {
            call.reject("PERMISSION_DENIED");
            return;
        }

        Long startTime = call.getLong("startTime");
        long endTime = call.getLong("endTime", System.currentTimeMillis());

        if (startTime == null || startTime <= 0) {
            call.reject("INVALID_START_TIME");
            return;
        }

        UsageStatsManager usm = (UsageStatsManager)
            getContext().getSystemService(Context.USAGE_STATS_SERVICE);

        List<UsageStats> stats = usm.queryUsageStats(
            UsageStatsManager.INTERVAL_BEST, startTime, endTime
        );

        String ownPackage = getContext().getPackageName();
        String topPackage = null;
        long topTime = 0;

        if (stats != null) {
            for (UsageStats us : stats) {
                if (us.getPackageName().equals(ownPackage)) continue;
                if (us.getTotalTimeInForeground() > topTime) {
                    topTime = us.getTotalTimeInForeground();
                    topPackage = us.getPackageName();
                }
            }
        }

        JSObject ret = new JSObject();
        if (topPackage == null || topTime < 5000) {
            ret.put("detected", false);
            call.resolve(ret);
            return;
        }

        ret.put("detected", true);
        ret.put("packageName", topPackage);
        ret.put("appName", getAppLabel(topPackage));
        ret.put("foregroundMs", topTime);
        call.resolve(ret);
    }

    private boolean isPermissionGranted() {
        AppOpsManager appOps = (AppOpsManager)
            getContext().getSystemService(Context.APP_OPS_SERVICE);
        int mode = appOps.checkOpNoThrow(
            AppOpsManager.OPSTR_GET_USAGE_STATS,
            android.os.Process.myUid(),
            getContext().getPackageName()
        );
        return mode == AppOpsManager.MODE_ALLOWED;
    }

    private String getAppLabel(String packageName) {
        PackageManager pm = getContext().getPackageManager();
        try {
            ApplicationInfo info = pm.getApplicationInfo(packageName, 0);
            return pm.getApplicationLabel(info).toString();
        } catch (PackageManager.NameNotFoundException e) {
            return packageName;
        }
    }
}
