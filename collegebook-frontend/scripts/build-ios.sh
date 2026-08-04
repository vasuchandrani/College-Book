#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# CollegeBook — iOS build script
#
#   ./scripts/build-ios.sh open        -> build web + sync + open Xcode
#   ./scripts/build-ios.sh archive     -> unsigned/dev archive via xcodebuild
#   ./scripts/build-ios.sh ipa         -> export a signed .ipa (needs ExportOptions.plist)
#
# HARD REQUIREMENTS (Apple's rules, not ours):
#   - macOS + Xcode 15+
#   - An Apple Developer account ($99/yr) to install on any device you own
#   - iOS apps CANNOT be side-loaded from a website like an .apk.
#     Distribution is: TestFlight, App Store, or an Enterprise/ad-hoc
#     itms-services manifest tied to registered device UDIDs.
#   This is why the landing page shows "iOS coming soon" until
#   VITE_IOS_INSTALL_URL points at a TestFlight / manifest URL.
# ---------------------------------------------------------------------------
set -euo pipefail

MODE="${1:-open}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ "$(uname)" != "Darwin" ]]; then
  echo "iOS builds require macOS with Xcode installed." >&2
  exit 1
fi

echo "==> Installing dependencies"
npm install

echo "==> Building web assets (dist/)"
npm run build

if [ ! -d ios ]; then
  echo "==> Adding iOS platform"
  npx cap add ios
fi

echo "==> Syncing web assets + plugins into ios/"
npx cap sync ios
(cd ios/App && pod install)

if grep -q "server:" capacitor.config.ts; then
  echo "!! WARNING: remove the 'server' block from capacitor.config.ts before release."
fi

WORKSPACE="ios/App/App.xcworkspace"
SCHEME="App"
ARCHIVE="build/CollegeBook.xcarchive"

case "$MODE" in
  open)
    npx cap open ios
    echo "Set your Team under Signing & Capabilities, then Product > Archive."
    ;;
  archive)
    xcodebuild -workspace "$WORKSPACE" -scheme "$SCHEME" \
      -configuration Release -destination 'generic/platform=iOS' \
      -archivePath "$ARCHIVE" archive
    echo "Archive: $ARCHIVE"
    ;;
  ipa)
    xcodebuild -exportArchive -archivePath "$ARCHIVE" \
      -exportOptionsPlist ios/ExportOptions.plist \
      -exportPath build/ipa
    echo "IPA: build/ipa/App.ipa"
    echo "Upload to TestFlight:  xcrun altool --upload-app -f build/ipa/App.ipa -t ios -u <apple-id>"
    ;;
  *)
    echo "Unknown mode '$MODE' (use: open | archive | ipa)" >&2
    exit 1
    ;;
esac
