#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync, exec } from 'child_process';
import { promisify } from 'util';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const SCREENSHOTS_DIR = path.join(PUBLIC_DIR, 'app-screenshots');

// Target sizes for responsive images
const SIZES = [
  { suffix: '-480', width: 480, quality: 85, description: 'Mobile' },
  { suffix: '-720', width: 720, quality: 85, description: 'Tablet' },
  { suffix: '-1080', width: 1080, quality: 90, description: 'Desktop' },
  { suffix: '', width: null, quality: 95, description: 'Original' }, // Keep original size
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

  const execAsync = promisify(exec);

  // Process each language in parallel
  const languagePromises = languages.map(async (lang) => {
    const langDir = path.join(SCREENSHOTS_DIR, lang);
    const images = fs.readdirSync(langDir).filter(file => file.endsWith('.webp'));

    console.log(`\n🔄 Processing ${lang} (${images.length} images)`);

    // Process each image in parallel
    const imagePromises = images.map(async (image) => {
      const inputPath = path.join(langDir, image);
      const baseName = path.parse(image).name;
      const extension = path.parse(image).ext;

      // Skip if this is already a variant (contains size suffix)
      if (baseName.includes('-480') || baseName.includes('-720') || baseName.includes('-1080')) {
        console.log(`  ⏭️  ${image}: Skipping variant file`);
        return;
      }

      // Check current image dimensions
      let originalWidth, originalHeight;
      try {
        const dimensions = execSync(`${MAGICK_COMMANDS.identify} -format "%wx%h" "${inputPath}"`, {
          encoding: 'utf8',
        }).trim();
        [originalWidth, originalHeight] = dimensions.split('x').map(Number);

        console.log(`  📏 ${image}: ${originalWidth}x${originalHeight}`);
      } catch (error) {
        console.error(`  ❌ Error getting dimensions for ${image}:`, error.message);
        return;
      }

      // Generate responsive variants in parallel
      const variantPromises = SIZES.map(async (size) => {
        let outputPath, targetWidth, aspectRatio;

        if (size.width === null) {
          // Keep original size but optimize quality
          outputPath = inputPath;
          targetWidth = originalWidth;
        } else {
          // Create variant with specific width
          outputPath = path.join(langDir, `${baseName}${size.suffix}${extension}`);
          targetWidth = size.width;
        }

        // Skip if variant already exists and is not the original
        if (size.width !== null && fs.existsSync(outputPath)) {
          console.log(`  ✅ ${baseName}${size.suffix}: Already exists`);
          return;
        }

        // Skip if target width is larger than original
        if (size.width !== null && size.width > originalWidth) {
          console.log(`  ⏭️  ${baseName}${size.suffix}: Skipping (larger than original)`);
          return;
        }

        // Calculate target height maintaining aspect ratio
        aspectRatio = originalHeight / originalWidth;
        const targetHeight = Math.round(targetWidth * aspectRatio);

        try {
          let cmd;
          if (size.width === null) {
            // Just optimize quality for original
            cmd = `${MAGICK_COMMANDS.convert} "${inputPath}" -quality ${size.quality} -format webp "${outputPath}"`;
          } else {
            // Resize and optimize
            cmd = `${MAGICK_COMMANDS.convert} "${inputPath}" -resize ${targetWidth}x${targetHeight} -quality ${size.quality} -format webp "${outputPath}"`;
          }

          await execAsync(cmd, { stdio: 'inherit' });
          console.log(
            `  ✅ ${baseName}${size.suffix}: ${size.description} (${targetWidth}x${targetHeight})`
          );
        } catch (error) {
          console.error(`  ❌ Error creating ${baseName}${size.suffix}:`, error.message);
        }
      });

      await Promise.all(variantPromises);
    });

    await Promise.all(imagePromises);
  });

  await Promise.all(languagePromises);

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
