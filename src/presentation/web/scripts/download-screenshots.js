#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

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
  console.log(`Created directory: ${PUBLIC_DIR}`);
}

/**
 * Check if a URL returns a valid response
 */
async function checkUrlExists(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Download a file from URL to local path
 */
async function downloadFile(url, filePath) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));
    return true;
  } catch (error) {
    console.error(`Failed to download ${url}:`, error.message);
    return false;
  }
}

/**
 * Download screenshots for a specific language and convert to WebP
 */
async function downloadLanguageScreenshots(language) {
  console.log(`\nDownloading screenshots for ${language}...`);

  const languageDir = path.join(PUBLIC_DIR, language);
  if (!fs.existsSync(languageDir)) {
    fs.mkdirSync(languageDir, { recursive: true });
  }

  let downloadedCount = 0;
  let screenshotIndex = 1;
  const maxScreenshots = 20; // Maximum number to check

  while (screenshotIndex <= maxScreenshots) {
    const screenshotUrl = `${GITHUB_BASE_URL}/${language}/images/phoneScreenshots/${screenshotIndex}.png`;
    const fileName = `${screenshotIndex}.png`;
    const filePath = path.join(languageDir, fileName);
    const webpPath = path.join(languageDir, `${screenshotIndex}.webp`);

    // Check if file already exists locally
    if (fs.existsSync(webpPath)) {
      console.log(`  ✓ ${screenshotIndex}.webp (already exists)`);
      downloadedCount++;
      screenshotIndex++;
      continue;
    }

    // Check if URL exists
    const urlExists = await checkUrlExists(screenshotUrl);
    if (!urlExists) {
      console.log(`  ✗ ${fileName} (not found on GitHub)`);
      break; // Stop checking further screenshots for this language
    }

    // Download the file
    const success = await downloadFile(screenshotUrl, filePath);
    if (success) {
      console.log(`  ✓ ${fileName} (downloaded)`);
      downloadedCount++;
      // PNG'den WebP'ye dönüştür
      try {
        await sharp(filePath).webp({ quality: 85 }).toFile(webpPath);
        console.log(`    → Converted to WebP: ${screenshotIndex}.webp`);
        // PNG dosyasını sil
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error(`    → WebP conversion failed: ${fileName}`, err.message);
      }
    } else {
      console.log(`  ✗ ${fileName} (download failed)`);
    }

    screenshotIndex++;

    // Add small delay to be respectful to GitHub
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log(`  Downloaded ${downloadedCount} screenshots for ${language}`);
  return downloadedCount;
}

/**
 * Remove everything in the public/app-screenshots directory before downloading
 */
function removeAllScreenshots() {
  if (fs.existsSync(PUBLIC_DIR)) {
    fs.readdirSync(PUBLIC_DIR).forEach(file => {
      const curPath = path.join(PUBLIC_DIR, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        fs.rmSync(curPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(curPath);
      }
    });
    console.log(`Cleaned all files and folders in: ${PUBLIC_DIR}`);
  }
}

/**
 * Generate metadata file with screenshot information
 */
function generateMetadata() {
  console.log('\nGenerating metadata...');

  const metadata = {
    lastUpdated: new Date().toISOString(),
    languages: {},
  };

  for (const language of SUPPORTED_LANGUAGES) {
    const languageDir = path.join(PUBLIC_DIR, language);

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
    } else {
      metadata.languages[language] = {
        count: 0,
        screenshots: [],
      };
    }
  }

  const metadataPath = path.join(PUBLIC_DIR, 'metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(`Generated metadata: ${metadataPath}`);

  return metadata;
}

/**
 * Main function
 */
async function main() {
  console.log('🖼️  WHPH Screenshot Downloader');
  console.log('=====================================');

  let totalDownloaded = 0;

  // Remove everything in the public/app-screenshots directory before downloading
  removeAllScreenshots();

  // Download screenshots for each language
  for (const language of SUPPORTED_LANGUAGES) {
    const count = await downloadLanguageScreenshots(language);
    totalDownloaded += count;
  }

  // Generate metadata
  const metadata = generateMetadata();

  // Summary
  console.log('\n📊 Summary:');
  console.log(`Total screenshots downloaded: ${totalDownloaded}`);
  console.log('Screenshots per language:');

  for (const [lang, data] of Object.entries(metadata.languages)) {
    console.log(`  ${lang}: ${data.count} screenshots`);
  }

  console.log('\n✅ Screenshot download completed!');
  console.log(`Screenshots saved to: ${PUBLIC_DIR}`);
}

// Run the script
main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
