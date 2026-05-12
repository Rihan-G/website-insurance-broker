Sindicom UI refresh — automated screenshots (Puppeteer, 1440×900 viewport, full page where noted).

01_home_light.png      Public home, light theme (aurora hero, Sindicom nav)
02_home_dark.png       Same page, dark theme (localStorage sb_theme=dark)
03_login.png           Sign-in page with Sindicom branding
04_dashboard.png       Broker dashboard after demo login
05_quote_calculator.png  Quotes / multi-currency calculator
06_compliance_aml.png    Compliance + AML name check panel

Regenerate: start `pnpm dev`, then from repo root:
  node /path/to/capture.mjs
(see cloud agent history for capture.mjs, or use Puppeteer script with CHROME_PATH and OUT_DIR)

Demo login used: broker@demo.sindicombrokers.local / BrokerDemo!SindicomBrokers (demo auth when Supabase is not configured).
