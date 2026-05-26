export default {
  // Common
  cancel: 'cancel',
  remove: 'remove',
  done: 'done',
  loading: 'loading…',

  // LoginScreen
  login_brand: 'scrolltopsy',
  login_title: 'an autopsy of\nyour screen time.',
  login_body: 'this app reads your usage stats.\nit will show you exactly which apps\nare eating your life, and by how much.\n\nno judgement. just numbers.\nbrutal, accurate numbers.',
  login_requires: 'requires access to:',
  login_perm_usage: 'usage statistics',
  login_perm_overlay: 'display over apps',
  login_perm_notifications: 'notifications',
  login_sign_in: 'sign in with google →',
  login_signing_in: 'signing in…',
  login_privacy_note: 'weekly aggregates sync to firestore.\nraw sessions stay on your device.',
  login_sign_in_failed: 'sign in failed',

  // HomeScreen
  home_doom_mins: 'doom mins today',
  home_tap_breakdown: 'tap for breakdown',
  home_risk: 'risk:',
  home_top_offenders: 'top offenders today',
  home_tap_limit: '· tap to set limit',
  home_by_category: 'by category',
  home_permission_needed: 'usage permission needed',
  home_permission_body: 'scrolltopsy needs access to usage stats\nto automatically track your doomscrolling.\nno manual input required.',
  home_grant_access: 'grant access →',
  home_ios_title: 'ios detected',
  home_ios_body: 'background tracking and auto usage stats\nare android-only features.\n\nyou can still track sessions manually\nusing the button below.',
  home_track_session: '→ track a session',
  home_tracking_active: '● tracking active — tap to stop',
  home_start_tracking: '○ start background tracking',
  home_sessions_today: 'sessions today',
  home_no_sessions: 'no sessions recorded.',
  home_limit_over: 'limit: {{limit}}m  ·  +{{over}}m over',
  home_limit_within: 'limit: {{limit}}m  ·  within quota',

  // TrackingScreen
  tracking_still_scrolling: 'still scrolling',
  tracking_done: "i'm done",

  // ShameScreen
  shame_autopsy: 'autopsy complete',
  shame_unrecoverable: 'minutes unrecoverable',
  shame_pages: 'pages you could have read',
  shame_steps: 'steps you could have walked',
  shame_lines: 'lines of code',
  shame_nap: 'fraction of a power nap',
  shame_classification: 'classification',
  shame_go_again: 'go again',
  shame_done: 'done for now',
  shame_share: 'share →',
  shame_today: 'today: {{mins}}m  ·  session {{n}}  ·  total: {{total}}m',

  // SettingsModal
  settings_signed_in: 'signed in',
  settings_verified: '✓ verified',
  settings_not_verified: '⚠ not verified — check email',
  settings_backup: 'back up my data',
  settings_backed_up: 'backed up.',
  settings_backup_failed: 'backup failed',
  settings_share: 'share this week',
  settings_sign_out: 'sign out',
  settings_delete: 'delete all my data',
  settings_delete_confirm: 'delete all data',
  settings_delete_body: 'this cannot be undone.',
  settings_delete_cancel: 'cancel',
  settings_delete_btn: 'delete everything',
  settings_light_mode: 'light mode',
  settings_dark_mode: 'dark mode',
  settings_privacy: 'privacy policy',
  settings_language: 'language',

  // QuotaPickerModal
  quota_daily_limit: 'daily limit  ·  {{app}}',
  quota_hours: 'hours',
  quota_mins: 'mins',
  quota_set: 'set limit: {{limit}}',
  quota_force_stop_label: 'force stop when limit reached',
  quota_force_stop_desc: 'intercepts the app every time you open it',
  quota_remove: 'remove limit',

  // Overlay permission prompt (force-stop)
  overlay_title: 'display over other apps',
  overlay_body: "force-stop needs the 'display over other apps' permission to intercept an app when your limit is exceeded. grant it in settings.",
  overlay_go_settings: 'go to settings',

  // Accessibility permission prompt (force-stop real-time blocking)
  accessibility_title: 'accessibility permission',
  accessibility_body: "instant blocking needs the accessibility permission to detect app opens in real time. without it, the block can take up to 15 seconds to appear.",
  accessibility_go_settings: 'enable in settings',
  accessibility_restricted_hint: "if the toggle is grayed out: app info → ⋮ → allow restricted settings, then try again.",

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
