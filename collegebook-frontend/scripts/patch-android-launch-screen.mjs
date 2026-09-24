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

const styleFiles = [
  resolve(resourceRoot, "values", "styles.xml"),
  resolve(resourceRoot, "values-v31", "styles.xml"),
].filter(existsSync);

if (styleFiles.length === 0) {
  console.error("Capacitor Android styles.xml was not found.");
  process.exit(1);
}

for (const styleFile of styleFiles) {
  const source = readFileSync(styleFile, "utf8");
  const updated = source.replace(
    /(<item\s+name="android:windowSplashScreenAnimatedIcon">)[^<]+(<\/item>)/g,
    "$1@drawable/collegebook_blank_launch$2",
  );

  if (updated === source && !source.includes("collegebook_blank_launch")) {
    console.error(`Android launch icon entry was not found in ${styleFile}.`);
    process.exit(1);
  }

  writeFileSync(styleFile, updated);
}

console.log(`Patched ${styleFiles.length} Android launch style file(s).`);
