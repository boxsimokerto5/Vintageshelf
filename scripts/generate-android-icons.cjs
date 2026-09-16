const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const LOGO_SRC = path.resolve(__dirname, '../public/assets/logo.jpg');
const RES_DIR = path.resolve(__dirname, '../android/app/src/main/res');

if (!fs.existsSync(LOGO_SRC)) {
  console.error(`Error: Logo not found at ${LOGO_SRC}`);
  process.exit(1);
}

console.log('Generating Android icons and splash screens from:', LOGO_SRC);

// 1. Density mappings for launcher icons
const MIPMAP_DENSITIES = [
  { dir: 'mipmap-mdpi', iconSize: 48, fgSize: 108 },
  { dir: 'mipmap-hdpi', iconSize: 72, fgSize: 162 },
  { dir: 'mipmap-xhdpi', iconSize: 96, fgSize: 216 },
  { dir: 'mipmap-xxhdpi', iconSize: 144, fgSize: 324 },
  { dir: 'mipmap-xxxhdpi', iconSize: 192, fgSize: 432 }
];

MIPMAP_DENSITIES.forEach(({ dir, iconSize, fgSize }) => {
  const targetDir = path.join(RES_DIR, dir);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // A. ic_launcher.png (Rounded Square)
  const roundRectRadius = Math.round(iconSize * 0.18);
  const launcherPath = path.join(targetDir, 'ic_launcher.png');
  const launcherCmd = `convert "${LOGO_SRC}" -resize ${iconSize}x${iconSize} \\( -size ${iconSize}x${iconSize} xc:none -fill white -draw "roundrectangle 0,0 ${iconSize - 1},${iconSize - 1} ${roundRectRadius},${roundRectRadius}" \\) -compose copy_opacity -composite PNG32:"${launcherPath}"`;
  execSync(launcherCmd);

  // B. ic_launcher_round.png (Circular)
  const circleRadius = Math.floor(iconSize / 2);
  const roundPath = path.join(targetDir, 'ic_launcher_round.png');
  const roundCmd = `convert "${LOGO_SRC}" -resize ${iconSize}x${iconSize} \\( -size ${iconSize}x${iconSize} xc:none -fill white -draw "circle ${circleRadius},${circleRadius} ${circleRadius},1" \\) -compose copy_opacity -composite PNG32:"${roundPath}"`;
  execSync(roundCmd);

  // C. ic_launcher_foreground.png (Adaptive icon foreground with safe area)
  const fgPath = path.join(targetDir, 'ic_launcher_foreground.png');
  const innerSize = Math.round(fgSize * 0.72);
  const innerR = Math.floor(innerSize / 2);
  const tempInner = `/tmp/inner_${fgSize}.png`;
  const innerCmd = `convert "${LOGO_SRC}" -resize ${innerSize}x${innerSize} \\( -size ${innerSize}x${innerSize} xc:none -fill white -draw "circle ${innerR},${innerR} ${innerR},1" \\) -compose copy_opacity -composite PNG32:"${tempInner}"`;
  execSync(innerCmd);
  const fgCmd = `convert -size ${fgSize}x${fgSize} xc:none "${tempInner}" -gravity center -composite PNG32:"${fgPath}"`;
  execSync(fgCmd);
  try { fs.unlinkSync(tempInner); } catch (e) {}

  console.log(`✓ Generated ${dir}: ic_launcher (${iconSize}x${iconSize}), ic_launcher_round (${iconSize}x${iconSize}), ic_launcher_foreground (${fgSize}x${fgSize})`);
});

// 2. Splash screens
const SPLASH_SCREENS = [
  { dir: 'drawable', width: 480, height: 320 },
  { dir: 'drawable-port-mdpi', width: 320, height: 480 },
  { dir: 'drawable-port-hdpi', width: 480, height: 800 },
  { dir: 'drawable-port-xhdpi', width: 720, height: 1280 },
  { dir: 'drawable-port-xxhdpi', width: 960, height: 1600 },
  { dir: 'drawable-port-xxxhdpi', width: 1280, height: 1920 },
  { dir: 'drawable-land-mdpi', width: 480, height: 320 },
  { dir: 'drawable-land-hdpi', width: 800, height: 480 },
  { dir: 'drawable-land-xhdpi', width: 1280, height: 720 },
  { dir: 'drawable-land-xxhdpi', width: 1600, height: 960 },
  { dir: 'drawable-land-xxxhdpi', width: 1920, height: 1280 }
];

SPLASH_SCREENS.forEach(({ dir, width, height }) => {
  const targetDir = path.join(RES_DIR, dir);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const splashPath = path.join(targetDir, 'splash.png');
  const emblemSize = Math.round(Math.min(width, height) * 0.42);
  const emblemR = Math.floor(emblemSize / 2);
  const tempSplashEmblem = `/tmp/splash_emblem_${emblemSize}.png`;

  const emblemCmd = `convert "${LOGO_SRC}" -resize ${emblemSize}x${emblemSize} \\( -size ${emblemSize}x${emblemSize} xc:none -fill white -draw "circle ${emblemR},${emblemR} ${emblemR},1" \\) -compose copy_opacity -composite PNG32:"${tempSplashEmblem}"`;
  execSync(emblemCmd);

  const splashCmd = `convert -size ${width}x${height} xc:"#180903" "${tempSplashEmblem}" -gravity center -composite PNG32:"${splashPath}"`;
  execSync(splashCmd);
  try { fs.unlinkSync(tempSplashEmblem); } catch (e) {}

  console.log(`✓ Generated splash screen for ${dir} (${width}x${height})`);
});

console.log('All icons and splash screens successfully generated!');
