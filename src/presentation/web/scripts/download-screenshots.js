#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const GITHUB_BASE_URL = 'https://raw.githubusercontent.com/ahmet-cetinkaya/whph/main/fastlane/metadata/android';
const PUBLIC_DIR = path.join(__dirname, '..', 'public', 'screenshots');

// Supported languages from the WHPH repository
const SUPPORTED_LANGUAGES = [
  'en-EN',
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
  'uk-UA'
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
 * Download screenshots for a specific language
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
    
    // Check if file already exists locally
    if (fs.existsSync(filePath)) {
      console.log(`  ✓ ${fileName} (already exists)`);
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
 * Clean up old screenshots that no longer exist on GitHub
 */
async function cleanupOldScreenshots() {
  console.log('\nCleaning up old screenshots...');
  
  for (const language of SUPPORTED_LANGUAGES) {
    const languageDir = path.join(PUBLIC_DIR, language);
    
    if (!fs.existsSync(languageDir)) continue;
    
    const localFiles = fs.readdirSync(languageDir).filter(f => f.endsWith('.png'));
    
    for (const file of localFiles) {
      const screenshotNumber = file.replace('.png', '');
      const githubUrl = `${GITHUB_BASE_URL}/${language}/images/phoneScreenshots/${file}`;
      
      const exists = await checkUrlExists(githubUrl);
      if (!exists) {
        const filePath = path.join(languageDir, file);
        fs.unlinkSync(filePath);
        console.log(`  🗑️  Removed ${language}/${file} (no longer exists on GitHub)`);
      }
      
      // Add small delay
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

/**
 * Generate metadata file with screenshot information
 */
function generateMetadata() {
  console.log('\nGenerating metadata...');
  
  const metadata = {
    lastUpdated: new Date().toISOString(),
    languages: {}
  };
  
  for (const language of SUPPORTED_LANGUAGES) {
    const languageDir = path.join(PUBLIC_DIR, language);
    
    if (fs.existsSync(languageDir)) {
      const screenshots = fs.readdirSync(languageDir)
        .filter(f => f.endsWith('.png'))
        .map(f => f.replace('.png', ''))
        .map(num => parseInt(num))
        .filter(num => !isNaN(num))
        .sort((a, b) => a - b);
      
      metadata.languages[language] = {
        count: screenshots.length,
        screenshots: screenshots.map(num => `${num}.png`)
      };
    } else {
      metadata.languages[language] = {
        count: 0,
        screenshots: []
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
  
  // Download screenshots for each language
  for (const language of SUPPORTED_LANGUAGES) {
    const count = await downloadLanguageScreenshots(language);
    totalDownloaded += count;
  }
  
  // Clean up old screenshots
  await cleanupOldScreenshots();
  
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