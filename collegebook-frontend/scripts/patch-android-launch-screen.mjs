import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const androidRoot = resolve(projectRoot, "android");
const resourceRoot = resolve(androidRoot, "app", "src", "main", "res");
const blankDrawable = `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="1dp"
    android:height="1dp"
    android:viewportWidth="1"
    android:viewportHeight="1">
    <path android:fillColor="#00000000" android:pathData="M0,0h1v1h-1z" />
</vector>
`;

if (!existsSync(androidRoot)) {
  console.error("Android platform is missing. Run `npx cap add android` first.");
  process.exit(1);
}

const drawableDirectory = resolve(resourceRoot, "drawable");
mkdirSync(drawableDirectory, { recursive: true });
writeFileSync(resolve(drawableDirectory, "collegebook_blank_launch.xml"), blankDrawable);

const baseStyleFile = resolve(resourceRoot, "values", "styles.xml");
if (!existsSync(baseStyleFile)) {
  console.error("Capacitor Android styles.xml was not found.");
  process.exit(1);
}

const styleSource = readFileSync(baseStyleFile, "utf8");
const baseStyle = styleSource.replace(
  /(<item\s+name="android:background">)[^<]+(<\/item>)/g,
  "$1@drawable/splash$2",
);
writeFileSync(baseStyleFile, baseStyle);

const v31Directory = resolve(resourceRoot, "values-v31");
mkdirSync(v31Directory, { recursive: true });
writeFileSync(
  resolve(v31Directory, "styles.xml"),
  `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">
        <item name="android:windowSplashScreenBackground">@android:color/white</item>
        <item name="android:windowSplashScreenAnimatedIcon">@drawable/collegebook_blank_launch</item>
        <item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item>
    </style>
</resources>
`,
);

const adaptiveIconFiles = [
  resolve(resourceRoot, "mipmap-anydpi-v26", "ic_launcher.xml"),
  resolve(resourceRoot, "mipmap-anydpi-v26", "ic_launcher_round.xml"),
].filter(existsSync);

for (const iconFile of adaptiveIconFiles) {
  const source = readFileSync(iconFile, "utf8");
  const updated = source.replace(
    /<foreground>\s*<inset\s+android:drawable="@mipmap\/ic_launcher_foreground"\s+android:inset="16\.7%"\s*\/>\s*<\/foreground>/,
    '<foreground android:drawable="@mipmap/ic_launcher_foreground" />',
  );

  if (updated !== source) {
    writeFileSync(iconFile, updated);
  }
}

console.log(
  `Patched Android launch surface and ${adaptiveIconFiles.length} adaptive icon file(s).`,
);
