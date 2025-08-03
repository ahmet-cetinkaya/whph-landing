#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const SCREENSHOTS_DIR = path.join(PUBLIC_DIR, 'app-screenshots');

// Target sizes for responsive images
const SIZES = [
  { suffix: '', width: 400, quality: 85 }, // Default mobile size
  { suffix: '@2x', width: 800, quality: 85 }, // Retina mobile
];

// Detect ImageMagick version and commands
let MAGICK_COMMANDS = {
  identify: 'identify',
  convert: 'convert',
};

function detectImageMagickVersion() {
  try {
    // Try ImageMagick v7+ first
    execSync('which magick', { stdio: 'ignore' });
    MAGICK_COMMANDS = {
      identify: 'magick identify',
      convert: 'magick',
    };
    console.log('✅ Using ImageMagick v7+ commands');
    return true;
  } catch (error) {
    // Fallback to ImageMagick v6
    try {
      execSync('which convert', { stdio: 'ignore' });
      MAGICK_COMMANDS = {
        identify: 'identify',
        convert: 'convert',
      };
      console.log('⚠️  Using ImageMagick v6 commands (consider upgrading to v7+)');
      return true;
    } catch (fallbackError) {
      return false;
    }
  }
}

async function optimizeImages() {
  console.log('🖼️  Optimizing screenshot images...');

  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    console.log('❌ Screenshots directory not found');
    return;
  }

  const languages = fs.readdirSync(SCREENSHOTS_DIR).filter(item => {
    return fs.statSync(path.join(SCREENSHOTS_DIR, item)).isDirectory();
  });

  console.log(`📁 Found ${languages.length} language directories`);

  for (const lang of languages) {
    const langDir = path.join(SCREENSHOTS_DIR, lang);
    const images = fs.readdirSync(langDir).filter(file => file.endsWith('.webp'));

    console.log(`\n🔄 Processing ${lang} (${images.length} images)`);

    for (const image of images) {
      const inputPath = path.join(langDir, image);
      const baseName = path.parse(image).name;

      // Check current image dimensions
      try {
        const dimensions = execSync(`${MAGICK_COMMANDS.identify} -format "%wx%h" "${inputPath}"`, {
          encoding: 'utf8',
        }).trim();
        const [width, height] = dimensions.split('x').map(Number);

        console.log(`  📏 ${image}: ${width}x${height}`);

        // Skip if already optimized (width <= 400)
        if (width <= 400) {
          console.log(`  ✅ ${image}: Already optimized`);
          continue;
        }

        // Generate optimized version
        const outputPath = path.join(langDir, `${baseName}_optimized.webp`);

        // Use ImageMagick to resize and optimize
        const cmd = `${MAGICK_COMMANDS.convert} "${inputPath}" -resize 400x711 -quality 85 -format webp "${outputPath}"`;
        execSync(cmd, { stdio: 'inherit' });

        // Replace original with optimized version
        fs.renameSync(outputPath, inputPath);

        console.log(`  ✅ ${image}: Optimized to 400x711`);
      } catch (error) {
        console.error(`  ❌ Error processing ${image}:`, error.message);
      }
    }
  }

  console.log('\n🎉 Image optimization complete!');
}

// Main execution
if (detectImageMagickVersion()) {
  optimizeImages();
} else {
  console.log('❌ ImageMagick not found. Please install it:');
  console.log('  macOS: brew install imagemagick');
  console.log('  Ubuntu: sudo apt-get install imagemagick');
  console.log('  Arch: sudo pacman -S imagemagick');
}
