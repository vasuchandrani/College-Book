#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# CollegeBook — Android build script
#
#   ./scripts/build-android.sh debug      -> app-debug.apk   (installable now)
#   ./scripts/build-android.sh release    -> app-release.apk (needs keystore)
#   ./scripts/build-android.sh bundle     -> app-release.aab (Play Store)
#
# Requirements on YOUR machine:
#   - Node 20+, JDK 17, Android SDK / Android Studio
#   - ANDROID_HOME exported
# ---------------------------------------------------------------------------
set -euo pipefail

MODE="${1:-debug}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> Installing dependencies"
npm install

echo "==> Building web assets (dist/)"
npm run build

if [ ! -d android ]; then
  echo "==> Adding Android platform"
  npx cap add android
fi

echo "==> Syncing web assets + plugins into android/"
npx cap sync android

# The dev hot-reload server block must NOT be present in a distributable build.
if grep -q "server:" capacitor.config.ts; then
  echo "!! WARNING: capacitor.config.ts still contains a 'server' block."
  echo "!! Remove it before shipping, otherwise the app loads the sandbox URL."
fi

cd android
case "$MODE" in
  debug)
    ./gradlew assembleDebug
    echo "APK: android/app/build/outputs/apk/debug/app-debug.apk"
    ;;
  release)
    # Requires android/keystore.properties (never commit it):
    #   storeFile=/absolute/path/collegebook.keystore
    #   storePassword=...
    #   keyAlias=collegebook
    #   keyPassword=...
    ./gradlew assembleRelease
    echo "APK: android/app/build/outputs/apk/release/app-release.apk"
    ;;
  bundle)
    ./gradlew bundleRelease
    echo "AAB: android/app/build/outputs/bundle/release/app-release.aab"
    ;;
  *)
    echo "Unknown mode '$MODE' (use: debug | release | bundle)" >&2
    exit 1
    ;;
esac

echo "==> Done. Upload the artifact to your CDN and set VITE_APK_DOWNLOAD_URL."
