#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import Logger from './utils/Logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const GITHUB_BASE_URL =
  'https://raw.githubusercontent.com/ahmet-cetinkaya/whph/main/fastlane/metadata/android';
const PUBLIC_DIR = path.join(__dirname, '..', 'public', 'app-screenshots');

// Supported languages from the WHPH repository
const SUPPORTED_LANGUAGES = [
  'en-GB',
  'tr-TR',
  'es-ES',
  'fr-FR',
  'de-DE',
  'it-IT',
  'ja-JP',
  'ko-KR',
  'ru-RU',
  'zh-CN',
  'pl-PL',
  'uk-UA',
  'cs-CZ',
  'da-DK',
  'el-GR',
  'fi-FI',
  'nl-NL',
  'ro-RO',
  'sl-SI',
  'sv-SE',
];

// Create screenshots directory if it doesn't exist
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  Logger.logSuccess(`Created directory: ${PUBLIC_DIR}`);
}

/**
 * Check if a URL returns a valid response
 */
async function checkUrlExists(url) {
  try {
    const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(10000) });
    return response.ok;
  } catch (error) {
    Logger.logWarning(`URL check failed for ${url}: ${error.message}`);
    return false;
  }
}

/**
 * Download a file from URL to local path
 */
async function downloadFile(url, filePath, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const relativePath = path.relative(process.cwd(), filePath);
      Logger.logInfo(`Attempting to download ${relativePath} (attempt ${attempt}/${retries})...`);
      const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(buffer));
      Logger.logSuccess(`Downloaded ${relativePath} successfully`);
      return true;
    } catch (error) {
      Logger.logError(`Failed to download ${path.basename(filePath)} due to ${error.message}.`);
      if (attempt < retries) {
        Logger.logWarning(`Retrying download for ${path.basename(filePath)}...`);
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      } else {
        Logger.logError(`All retry attempts failed for ${path.basename(filePath)}. Skipping.`);
        return false;
      }
    }
  }
}

/**
 * Download screenshots for a specific language and convert to WebP
 */
async function downloadLanguageScreenshots(language) {
  Logger.logInfo(`Starting screenshot download for ${language} (up to 20 images)...`);

  const languageDir = path.join(PUBLIC_DIR, language);
  if (!fs.existsSync(languageDir)) {
    fs.mkdirSync(languageDir, { recursive: true });
    Logger.logSuccess(`Created directory: ${languageDir}`);
  }

  let downloadedCount = 0;
  const maxScreenshots = 20;
  const downloadPromises = [];

  for (let screenshotIndex = 1; screenshotIndex <= maxScreenshots; screenshotIndex++) {
    const screenshotUrl = `${GITHUB_BASE_URL}/${language}/images/phoneScreenshots/${screenshotIndex}.png`;
    const fileName = `${screenshotIndex}.png`;
    const filePath = path.join(languageDir, fileName);
    const webpPath = path.join(languageDir, `${screenshotIndex}.webp`);

    Logger.logInfo(`Processing screenshot ${screenshotIndex}/${maxScreenshots} for ${language}...`);

    // Check if file already exists locally
    if (fs.existsSync(webpPath)) {
      const relativePath = path.relative(process.cwd(), webpPath);
      Logger.logSuccess(`Screenshot ${screenshotIndex}/${maxScreenshots} at ${relativePath}: already exists`);
      downloadedCount++;
      continue;
    }

    // Create a promise for this screenshot
    const downloadPromise = (async () => {
      // Check if URL exists
      const urlExists = await checkUrlExists(screenshotUrl);
      if (!urlExists) {
        Logger.logWarning(`Screenshot ${screenshotIndex}/${maxScreenshots}: not found on GitHub`);
        return false;
      }

      // Download the file
      const success = await downloadFile(screenshotUrl, filePath);
      if (success) {
        // Convert PNG to WebP
        try {
          const relativePath = path.relative(process.cwd(), webpPath);
          Logger.logInfo(`Converting ${fileName} to WebP at ${relativePath}...`);
          await sharp(filePath).webp({ quality: 85 }).toFile(webpPath);
          Logger.logSuccess(`Converted screenshot ${screenshotIndex}/${maxScreenshots} to WebP at ${relativePath}`);
          // Delete PNG file
          fs.unlinkSync(filePath);
          return true;
        } catch (err) {
          Logger.logError(`WebP conversion failed for screenshot ${screenshotIndex}/${maxScreenshots}: ${err.message}`);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          return false;
        }
      } else {
        Logger.logError(`Download failed for screenshot ${screenshotIndex}/${maxScreenshots}`);
        return false;
      }
    })();

    downloadPromises.push(downloadPromise);
  }

  // Wait for all downloads to complete
  const results = await Promise.all(downloadPromises);
  const newDownloads = results.filter(Boolean).length;
  downloadedCount += newDownloads;

  Logger.logSuccess(`Completed ${language}: ${newDownloads} new screenshots downloaded (total: ${downloadedCount})`);

  return downloadedCount;
}

/**
 * Remove everything in the public/app-screenshots directory before downloading
 */
function removeAllScreenshots() {
  if (fs.existsSync(PUBLIC_DIR)) {
    const items = fs.readdirSync(PUBLIC_DIR);
    items.forEach(file => {
      const curPath = path.join(PUBLIC_DIR, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        fs.rmSync(curPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(curPath);
      }
    });
    Logger.logInfo(`Cleaned all existing screenshots from: ${PUBLIC_DIR}`);
  } else {
    Logger.logWarning(`Screenshots directory does not exist: ${PUBLIC_DIR}`);
  }
}

/**
 * Generate metadata file with screenshot information
 */
function generateMetadata() {
  Logger.logInfo('Generating screenshot metadata...');

  const metadata = {
    lastUpdated: new Date().toISOString(),
    languages: {},
  };

  let processedLanguages = 0;
  for (const language of SUPPORTED_LANGUAGES) {
    const languageDir = path.join(PUBLIC_DIR, language);
    Logger.logInfo(`Scanning metadata for ${language}...`);

    if (fs.existsSync(languageDir)) {
      const screenshots = fs
        .readdirSync(languageDir)
        .filter(f => f.endsWith('.webp'))
        .map(f => f.replace('.webp', ''))
        .map(num => parseInt(num))
        .filter(num => !isNaN(num))
        .sort((a, b) => a - b);

      metadata.languages[language] = {
        count: screenshots.length,
        screenshots: screenshots.map(num => `${num}.webp`),
      };
      processedLanguages++;
    } else {
      metadata.languages[language] = {
        count: 0,
        screenshots: [],
      };
    }
  }

  const metadataPath = path.join(PUBLIC_DIR, 'metadata.json');
  try {
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    Logger.logSuccess(`Generated metadata file: ${metadataPath} (${processedLanguages}/${SUPPORTED_LANGUAGES.length} languages with screenshots)`);
  } catch (err) {
    Logger.logError(`Failed to write metadata: ${err.message}`);
  }

  return metadata;
}

/**
 * Main function
 */
async function main() {
  Logger.logInfo('🖼️  Starting WHPH Screenshot Downloader');
  Logger.logInfo('=====================================');

  let totalDownloaded = 0;

  // Remove everything in the public/app-screenshots directory before downloading
  removeAllScreenshots();

  Logger.logInfo(`Downloading screenshots for ${SUPPORTED_LANGUAGES.length} languages in parallel...`);

  // Download screenshots for each language in parallel
  const downloadPromises = SUPPORTED_LANGUAGES.map(async (language) => {
    return await downloadLanguageScreenshots(language);
  });

  const results = await Promise.all(downloadPromises);
  totalDownloaded = results.reduce((sum, count) => sum + count, 0);

  // Generate metadata
  const metadata = generateMetadata();

  // Summary
  Logger.logSuccess(`\n📊 Download Summary:`);
  Logger.logSuccess(`Total new screenshots downloaded: ${totalDownloaded}`);
  Logger.logInfo('Screenshots available per language:');
  for (const [lang, data] of Object.entries(metadata.languages)) {
    Logger.logInfo(`  ${lang}: ${data.count} screenshots`);
  }

  Logger.logSuccess(`✅ Screenshot download completed successfully!`);
  Logger.logSuccess(`All screenshots saved to: ${PUBLIC_DIR}`);
}

// Run the script
main().catch(error => {
  Logger.logError(`❌ Script execution failed: ${error.message}`);
  Logger.logError(`Full error: ${error.stack}`);
  process.exit(1);
});
