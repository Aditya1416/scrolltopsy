export default {
  // Common
  cancel: 'cancel',
  remove: 'hatao',
  done: 'ho gaya',
  loading: 'load ho raha hai…',

  // LoginScreen
  login_brand: 'scrolltopsy',
  login_title: 'aapke screen time ki\nautopsy.',
  login_body: 'yeh app aapki usage stats padhta hai.\nbatayega exactly kaun se apps\naapki life kha rahe hain, kitna.\n\nkoi judgement nahi. bas numbers.\nbrutal, accurate numbers.',
  login_requires: 'access chahiye:',
  login_perm_usage: 'usage statistics',
  login_perm_overlay: 'apps ke upar dikhna',
  login_perm_notifications: 'notifications',
  login_sign_in: 'google se sign in karo →',
  login_signing_in: 'sign in ho raha hai…',
  login_privacy_note: 'weekly totals firestore mein jayenge.\nbaki sab phone pe rahega.',
  login_sign_in_failed: 'sign in fail ho gaya',

  // HomeScreen
  home_doom_mins: 'aaj ke doom mins',
  home_tap_breakdown: 'breakdown ke liye tap karo',
  home_risk: 'risk:',
  home_top_offenders: 'aaj ke top offenders',
  home_tap_limit: '· limit set karne ke liye tap karo',
  home_by_category: 'category ke hisaab se',
  home_permission_needed: 'usage permission chahiye',
  home_permission_body: 'scrolltopsy ko usage stats ka access chahiye\ntaaki aapka doomscrolling track ho sake.\nkoi manual input nahi.',
  home_grant_access: 'access do →',
  home_ios_title: 'iOS detect hua',
  home_ios_body: 'background tracking aur auto usage stats\nsirf Android pe kaam karta hai.\n\nsessions manually track karo\nneeche diye button se.',
  home_track_session: '→ ek session track karo',
  home_tracking_active: '● tracking chal rahi hai — band karne ke liye tap karo',
  home_start_tracking: '○ background tracking shuru karo',
  home_sessions_today: 'aaj ke sessions',
  home_no_sessions: 'koi session record nahi hua.',
  home_limit_over: 'limit: {{limit}}m  ·  +{{over}}m zyada',
  home_limit_within: 'limit: {{limit}}m  ·  limit ke andar',

  // TrackingScreen
  tracking_still_scrolling: 'abhi bhi scroll ho raha hai',
  tracking_done: 'ho gaya mera',

  // ShameScreen
  shame_autopsy: 'autopsy complete',
  shame_unrecoverable: 'minutes wapas nahi aayenge',
  shame_pages: 'pages jo padh sakta tha',
  shame_steps: 'kadam jo chal sakta tha',
  shame_lines: 'lines of code',
  shame_nap: 'power nap ka hissa',
  shame_classification: 'classification',
  shame_go_again: 'phir se',
  shame_done: 'abhi ke liye bas',
  shame_share: 'share karo →',
  shame_today: 'aaj: {{mins}}m  ·  session {{n}}  ·  total: {{total}}m',

  // SettingsModal
  settings_signed_in: 'signed in',
  settings_verified: '✓ verified',
  settings_not_verified: '⚠ verify nahi hua — email check karo',
  settings_backup: 'data backup karo',
  settings_backed_up: 'backup ho gaya.',
  settings_backup_failed: 'backup fail ho gaya',
  settings_share: 'is hafte ka share karo',
  settings_sign_out: 'sign out karo',
  settings_delete: 'mera sara data delete karo',
  settings_delete_confirm: 'sara data delete karo',
  settings_delete_body: 'yeh wapas nahi hoga.',
  settings_delete_cancel: 'cancel',
  settings_delete_btn: 'sab kuch delete karo',
  settings_light_mode: 'light mode',
  settings_dark_mode: 'dark mode',
  settings_privacy: 'privacy policy',
  settings_language: 'bhasha',

  // QuotaPickerModal
  quota_daily_limit: 'daily limit  ·  {{app}}',
  quota_hours: 'ghante',
  quota_mins: 'mins',
  quota_set: 'limit set karo: {{limit}}',
  quota_force_stop_label: 'limit hone par force stop karo',
  quota_force_stop_desc: 'har baar kholne par app rok dega',
  quota_remove: 'limit hatao',

  // Overlay permission prompt
  overlay_title: 'doosre apps ke upar dikhna',
  overlay_body: "force-stop ko 'display over other apps' permission chahiye taaki limit exceed hone par app rok sake. settings mein jaake do.",
  overlay_go_settings: 'settings mein jao',

  // Accessibility permission prompt
  accessibility_title: 'accessibility permission',
  accessibility_body: 'instant blocking ke liye accessibility permission chahiye taaki real time mein app opens detect ho sakein. iske bina block aane mein 15 second lag sakte hain.',
  accessibility_go_settings: 'settings mein enable karo',
  accessibility_restricted_hint: 'agar toggle gray hai: app info → ⋮ → restricted settings allow karo, phir try karo.',

  // Categories
  cat_social: 'social',
  cat_entertainment: 'entertainment',
  cat_news: 'news',
  cat_games: 'games',
  cat_shopping: 'shopping',
  cat_messaging: 'messaging',
  cat_browser: 'browser',
  cat_productivity: 'productivity',
  cat_other: 'other',
} as const;
