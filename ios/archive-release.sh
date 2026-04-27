#!/usr/bin/env bash
# Release archive + App Store IPA for WebViewApp (React Native bundles JS in the Xcode Release phase).
# Requires: full Xcode (not only Command Line Tools), CocoaPods, Apple Developer account, signing set up in Xcode at least once.
#
# Usage (from repo root):
#   npm run ios:release
# Optional:
#   DEVELOPMENT_TEAM=ABCDE12345 npm run ios:release
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
IOS="$ROOT/ios"
ARCHIVE="$IOS/build/WebViewApp.xcarchive"
EXPORT_DIR="$IOS/build/ipa"

cd "$IOS"

# glog / React Native pods compile for iphoneos; Command Line Tools alone are not enough.
if ! xcrun --sdk iphoneos --show-sdk-path &>/dev/null; then
  echo ""
  echo "ERROR: iOS SDK (iphoneos) not found. CocoaPods will fail building glog with:"
  echo '  xcrun: error: SDK "iphoneos" cannot be located'
  echo ""
  echo "Fix:"
  echo "  1) Install Xcode from the Mac App Store (full app, not only Command Line Tools)."
  echo "  2) Open Xcode once; accept license; let it install extra components."
  echo "  3) Point the active developer directory at Xcode:"
  echo "       sudo xcode-select -s /Applications/Xcode.app/Contents/Developer"
  echo "  4) Clear the broken glog pod cache, then reinstall:"
  echo "       rm -rf Pods Podfile.lock ~/Library/Caches/CocoaPods/Pods/External/glog-*"
  echo "       pod install"
  echo ""
  exit 1
fi

pod install

mkdir -p "$IOS/build"

EXTRA=()
if [[ -n "${DEVELOPMENT_TEAM:-}" ]]; then
  EXTRA+=(DEVELOPMENT_TEAM="$DEVELOPMENT_TEAM")
fi

xcodebuild \
  -workspace WebViewApp.xcworkspace \
  -scheme WebViewApp \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath "$ARCHIVE" \
  archive \
  ${EXTRA[@]+"${EXTRA[@]}"} \
  -allowProvisioningUpdates

# Some React Native Hermes distributions ship without a framework dSYM in the archive.
# Xcode validation then warns: "Upload Symbols Failed ... hermes.framework ...".
# If Hermes is present, generate the framework dSYM from the archived binary.
APP_PATH="$ARCHIVE/Products/Applications/WebViewApp.app"
HERMES_BIN="$APP_PATH/Frameworks/hermes.framework/hermes"
HERMES_DSYM_DIR="$ARCHIVE/dSYMs/hermes.framework.dSYM"
if [[ -f "$HERMES_BIN" ]]; then
  echo ""
  echo "Generating Hermes dSYM (if missing)..."
  rm -rf "$HERMES_DSYM_DIR"
  dsymutil "$HERMES_BIN" -o "$HERMES_DSYM_DIR" || true
  if [[ -d "$HERMES_DSYM_DIR" ]]; then
    echo "Hermes dSYM: $HERMES_DSYM_DIR"
    dwarfdump --uuid "$HERMES_BIN" || true
    dwarfdump --uuid "$HERMES_DSYM_DIR" || true
  fi
fi

rm -rf "$EXPORT_DIR"
mkdir -p "$EXPORT_DIR"

xcodebuild \
  -exportArchive \
  -archivePath "$ARCHIVE" \
  -exportPath "$EXPORT_DIR" \
  -exportOptionsPlist "$IOS/ExportOptions-app-store.plist" \
  -allowProvisioningUpdates

echo ""
echo "Archive: $ARCHIVE"
echo "IPA folder: $EXPORT_DIR"
ls -la "$EXPORT_DIR"
