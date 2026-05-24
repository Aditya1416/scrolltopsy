# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Scrolltopsy native modules — keep all so RN bridge reflection works
-keep class app.scrolltopsy.android.** { *; }
-keepclassmembers class app.scrolltopsy.android.** { *; }

# React Native bridge
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# Firebase / Google
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# Expo modules
-keep class expo.modules.** { *; }

# Strip verbose logs in release
-assumenosideeffects class android.util.Log {
    public static int v(...);
    public static int d(...);
}
