#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync, exec } from 'child_process';
import { promisify } from 'util';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const SCREENSHOTS_DIR = path.join(PUBLIC_DIR, 'app-screenshots');

import Logger from './utils/Logger.js';

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
    Logger.logSuccess('Using ImageMagick v7+ commands');
    return true;
  } catch (error) {
    // Fallback to ImageMagick v6
    try {
      execSync('which convert', { stdio: 'ignore' });
      MAGICK_COMMANDS = {
        identify: 'identify',
        convert: 'convert',
      };
      Logger.logWarning('Using ImageMagick v6 commands (consider upgrading to v7+)');
      return true;
    } catch (fallbackError) {
      Logger.logError('ImageMagick v6 commands not found');
      return false;
    }
  }
}

async function optimizeImages() {
  Logger.logInfo('🖼️  Starting screenshot image optimization...');

  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    Logger.logError('Screenshots directory not found. Run download-screenshots.js first.');
    return;
  }

  const languages = fs.readdirSync(SCREENSHOTS_DIR).filter(item => {
    return fs.statSync(path.join(SCREENSHOTS_DIR, item)).isDirectory();
  });

  Logger.logInfo(`Found ${languages.length} language directories to process.`);

  if (languages.length === 0) {
    Logger.logWarning('No language directories found. Nothing to optimize.');
    return;
  }

  const execAsync = promisify(exec);

  let totalOptimized = 0;

  // Process each language sequentially for better progress tracking, but images in parallel
  for (let langIndex = 0; langIndex < languages.length; langIndex++) {
    const lang = languages[langIndex];
    const langDir = path.join(SCREENSHOTS_DIR, lang);
    const images = fs.readdirSync(langDir).filter(file => file.endsWith('.webp'));

    Logger.logInfo(
      `\nProcessing language ${langIndex + 1}/${languages.length}: ${lang} (${images.length} images)`
    );

    // Process each image in parallel
    const imagePromises = images.map(async (image, imageIndex) => {
      const inputPath = path.join(langDir, image);
      const baseName = path.parse(image).name;
      const extension = path.parse(image).ext;

      // Skip if this is already a variant (contains size suffix)
      if (baseName.includes('-480') || baseName.includes('-720') || baseName.includes('-1080')) {
        const relativeInput = path.relative(process.cwd(), inputPath);
        Logger.logInfo(`  Skipping variant: ${relativeInput}`);
        return 0;
      }

      const relativeInput = path.relative(process.cwd(), inputPath);
      Logger.logInfo(`  Optimizing image ${imageIndex + 1}/${images.length}: ${relativeInput}...`);

      // Check current image dimensions
      let originalWidth, originalHeight;
      try {
        const dimensions = execSync(`${MAGICK_COMMANDS.identify} -format "%wx%h" "${inputPath}"`, {
          encoding: 'utf8',
        }).trim();
        [originalWidth, originalHeight] = dimensions.split('x').map(Number);

        Logger.logInfo(`    Dimensions: ${originalWidth}x${originalHeight}`);
      } catch (error) {
        Logger.logError(`    Failed to get dimensions for ${relativeInput}: ${error.message}`);
        return 0;
      }

      let variantsOptimized = 0;

      // Generate responsive variants in parallel
      const variantPromises = SIZES.map(async size => {
        let outputPath, targetWidth, aspectRatio;

        if (size.width === null) {
          // Optimize original
          outputPath = inputPath;
          targetWidth = originalWidth;
        } else {
          // Create variant
          outputPath = path.join(langDir, `${baseName}${size.suffix}${extension}`);
          targetWidth = size.width;
        }

        const relativeOutput = path.relative(process.cwd(), outputPath);

        // Skip if variant already exists and is not the original
        if (size.width !== null && fs.existsSync(outputPath)) {
          Logger.logSuccess(
            `    ${baseName}${size.suffix} at ${relativeOutput}: Already exists (${size.description})`
          );
          return 1;
        }

        // Skip if target width is larger than original
        if (size.width !== null && size.width > originalWidth) {
          Logger.logWarning(
            `    ${baseName}${size.suffix} at ${relativeOutput}: Skipping (larger than original)`
          );
          return 0;
        }

        // Calculate target height maintaining aspect ratio
        aspectRatio = originalHeight / originalWidth;
        const targetHeight = Math.round(targetWidth * aspectRatio);

        try {
          let cmd;
          if (size.width === null) {
            // Just optimize quality for original (overwrite if needed)
            cmd = `${MAGICK_COMMANDS.convert} "${inputPath}" -quality ${size.quality} "${inputPath}"`;
          } else {
            // Resize and optimize
            cmd = `${MAGICK_COMMANDS.convert} "${inputPath}" -resize ${targetWidth}x${targetHeight}! -quality ${size.quality} -format webp "${outputPath}"`;
          }

          await execAsync(cmd, { stdio: 'inherit' });
          Logger.logSuccess(
            `    ${baseName}${size.suffix} at ${relativeOutput}: Optimized ${size.description} (${targetWidth}x${targetHeight})`
          );
          variantsOptimized++;
          return 1;
        } catch (error) {
          Logger.logError(
            `    Failed to create ${baseName}${size.suffix} at ${relativeOutput}: ${error.message}`
          );
          return 0;
        }
      });

      const results = await Promise.all(variantPromises);
      return results.reduce((sum, count) => sum + count, 0);
    });

    const langResults = await Promise.all(imagePromises);
    const langOptimized = langResults.reduce((sum, count) => sum + count, 0);
    totalOptimized += langOptimized;
    Logger.logSuccess(`Completed ${lang}: ${langOptimized} variants optimized`);
  }

  Logger.logSuccess(
    `\n🎉 Image optimization complete! Total variants optimized: ${totalOptimized}`
  );
}

// Main execution
if (detectImageMagickVersion()) {
  optimizeImages();
} else {
  Logger.logError('ImageMagick not found. Installation instructions:');
  Logger.logInfo('  macOS: brew install imagemagick');
  Logger.logInfo('  Ubuntu: sudo apt-get install imagemagick');
  Logger.logInfo('  Arch: sudo pacman -S imagemagick');
  process.exit(1);
}
