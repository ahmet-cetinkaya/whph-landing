#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const LOCALES_DIR = path.join(__dirname, '..', 'src', 'locales');
const SRC_DIR = path.join(__dirname, '..', 'src');

// File extensions to search for translation usage
const CODE_EXTENSIONS = ['.astro', '.ts', '.js', '.jsx', '.tsx', '.vue', '.svelte'];

/**
 * Recursively get all translation keys from a nested object
 */
function getTranslationKeys(obj, prefix = '') {
  const keys = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursive call for nested objects
      keys.push(...getTranslationKeys(value, fullKey));
    } else {
      // This is a translation value
      keys.push(fullKey);
    }
  }

  return keys;
}

/**
 * Load all translation keys from a locale file
 */
function loadTranslationKeys(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const translations = JSON.parse(content);
    return getTranslationKeys(translations);
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error.message);
    return [];
  }
}

/**
 * Get all files with specified extensions recursively
 */
function getCodeFiles(dir, extensions) {
  const files = [];

  function walk(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip node_modules and other irrelevant directories
        if (!['node_modules', '.git', 'dist', '.astro'].includes(item)) {
          walk(fullPath);
        }
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

/**
 * Find translation usage patterns in code
 */
function findTranslationUsage(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const usedKeys = new Set();

    // Patterns to match t('key'), t("key"), t(`key`)
    const staticPatterns = [
      /t\(\s*['"`]([^'"`]+)['"`]\s*[,)]/g,
      /t\(\s*['"`]([^'"`]+)['"`]\s*,\s*\{[^}]*\}\s*\)/g,
      // Also match t("key", { params })
      /t\(\s*["']([^"']+)["']\s*,\s*\{[^}]*\}\s*\)/g,
      // Match t( "key" ) with extra spaces
      /t\(\s*["']([^"']+)["']\s*\)/g,
    ];

    // Find static translation keys
    staticPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        usedKeys.add(match[1]);
      }
    });

    // Find dynamic translation patterns and resolve them
    const dynamicKeys = findDynamicTranslationUsage(content, filePath);
    dynamicKeys.forEach(key => usedKeys.add(key));

    return Array.from(usedKeys);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return [];
  }
}

/**
 * Find dynamic translation usage patterns like t(`prefix.${variable}.suffix`)
 */
function findDynamicTranslationUsage(content, filePath) {
  const dynamicKeys = new Set();

  // Pattern to match t(`template${variable}template`)
  const templateLiteralPattern = /t\(\s*`([^`]*\$\{[^}]+\}[^`]*)`\s*[,)]/g;

  let match;
  while ((match = templateLiteralPattern.exec(content)) !== null) {
    const template = match[1];

    // Resolve the template by finding variable arrays/values in the same file
    const resolvedKeys = resolveDynamicTemplate(template, content, filePath);
    resolvedKeys.forEach(key => dynamicKeys.add(key));
  }

  return Array.from(dynamicKeys);
}

/**
 * Resolve dynamic translation templates by analyzing the code context
 */
function resolveDynamicTemplate(template, content, filePath) {
  const resolvedKeys = [];

  // Extract the variable name from ${variableName}
  const variableMatch = template.match(/\$\{(\w+)\}/);
  if (!variableMatch) return resolvedKeys;

  const variableName = variableMatch[1];

  // Look for array declarations or object property definitions
  const arrayPatterns = [
    // Array literal: const variableName = ['value1', 'value2']
    new RegExp(`const\\s+${variableName}\\s*=\\s*\\[([^\\]]+)\\]`, 'g'),
    // Variable assignment: variableName = ['value1', 'value2']
    new RegExp(`${variableName}\\s*=\\s*\\[([^\\]]+)\\]`, 'g'),
  ];

  for (const pattern of arrayPatterns) {
    let arrayMatch;
    while ((arrayMatch = pattern.exec(content)) !== null) {
      const arrayContent = arrayMatch[1];

      // Extract string values from the array
      const stringPattern = /['"`]([^'"`]+)['"`]/g;
      let stringMatch;
      while ((stringMatch = stringPattern.exec(arrayContent)) !== null) {
        const value = stringMatch[1];

        // Replace ${variableName} with the actual value
        const resolvedKey = template.replace(`\${${variableName}}`, value);
        resolvedKeys.push(resolvedKey);
      }
    }
  }

  // Handle object property iterations like Object.keys(someObject)
  const objectKeyPatterns = [
    // Object.keys(objectName).map(...) or similar
    new RegExp(`Object\\.keys\\s*\\(\\s*(\\w+)\\s*\\)`, 'g'),
    // for...in loops: for (const key in objectName)
    new RegExp(`for\\s*\\(\\s*(?:const|let|var)\\s+\\w+\\s+in\\s+(\\w+)\\s*\\)`, 'g'),
  ];

  for (const pattern of objectKeyPatterns) {
    let objectMatch;
    while ((objectMatch = pattern.exec(content)) !== null) {
      const objectName = objectMatch[1];

      // Look for object definition in the same file
      const objectDefPattern = new RegExp(
        `(?:const|let|var)\\s+${objectName}\\s*=\\s*\\{([^}]+)\\}`,
        'g'
      );
      let objectDefMatch;
      while ((objectDefMatch = objectDefPattern.exec(content)) !== null) {
        const objectContent = objectDefMatch[1];

        // Extract property names
        const propertyPattern = /['"`]?(\w+)['"`]?\s*:/g;
        let propertyMatch;
        while ((propertyMatch = propertyPattern.exec(objectContent)) !== null) {
          const propertyName = propertyMatch[1];
          const resolvedKey = template.replace(`\${${variableName}}`, propertyName);
          resolvedKeys.push(resolvedKey);
        }
      }
    }
  }

  // Special case: Handle common FAQ pattern where array is defined inline
  if (template.includes('faq.questions.') && template.includes('${')) {
    // Look for faqQuestions array in FAQ components
    const faqPattern = /(?:faqQuestions|questions)\s*=\s*\[([^\]]+)\]/g;
    let faqMatch;
    while ((faqMatch = faqPattern.exec(content)) !== null) {
      const arrayContent = faqMatch[1];

      // Extract string values
      const stringPattern = /['"`]([^'"`]+)['"`]/g;
      let stringMatch;
      while ((stringMatch = stringPattern.exec(arrayContent)) !== null) {
        const value = stringMatch[1];
        const resolvedKey = template.replace(`\${${variableName}}`, value);
        resolvedKeys.push(resolvedKey);
      }
    }
  }

  // Special handling for known commonly used dynamic patterns
  const commonPatterns = [
    // screenshots.altText and screenshots.description with number parameter
    { pattern: 'screenshots.altText', usesParam: true },
    { pattern: 'screenshots.description', usesParam: true },
    { pattern: 'screenshots.title', usesParam: false },
    // donate section
    { pattern: 'donate.title', usesParam: false },
    { pattern: 'donate.description', usesParam: false },
    { pattern: 'donate.supportMessage', usesParam: false },
    { pattern: 'donate.button', usesParam: false },
  ];

  // Check if this template matches any common patterns
  commonPatterns.forEach(({ pattern, usesParam }) => {
    if (template.includes(pattern) || template === pattern) {
      resolvedKeys.push(pattern);
    }
  });

  return resolvedKeys;
}

/**
 * Main analysis function
 */
function analyzeTranslations(verbose = false) {
  console.log('🔍 Analyzing translation usage...\n');

  // 1. Get all translation keys from English (reference)
  const englishTranslationPath = path.join(LOCALES_DIR, 'en', 'common.json');
  if (!fs.existsSync(englishTranslationPath)) {
    console.error('❌ English translation file not found:', englishTranslationPath);
    return;
  }

  const allTranslationKeys = loadTranslationKeys(englishTranslationPath);
  console.log(`📋 Found ${allTranslationKeys.length} translation keys in English locale`);

  // 2. Find all code files
  const codeFiles = getCodeFiles(SRC_DIR, CODE_EXTENSIONS);
  console.log(`📁 Scanning ${codeFiles.length} code files for translation usage`);

  // 3. Find used translation keys
  const usedKeys = new Set();
  const staticKeys = new Set();
  const dynamicKeys = new Set();

  codeFiles.forEach(filePath => {
    const keysInFile = findTranslationUsage(filePath);

    // Also track static vs dynamic separately for debugging
    const content = fs.readFileSync(filePath, 'utf-8');
    const staticPatterns = [
      /t\(\s*['"`]([^'"`]+)['"`]\s*[,)]/g,
      /t\(\s*['"`]([^'"`]+)['"`]\s*,\s*\{[^}]*\}\s*\)/g,
    ];

    staticPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        staticKeys.add(match[1]);
      }
    });

    const dynamicKeysInFile = findDynamicTranslationUsage(content, filePath);
    dynamicKeysInFile.forEach(key => dynamicKeys.add(key));

    keysInFile.forEach(key => usedKeys.add(key));

    if (verbose && keysInFile.length > 0) {
      console.log(`   📄 ${path.relative(process.cwd(), filePath)}: ${keysInFile.length} keys`);
      if (dynamicKeysInFile.length > 0) {
        console.log(`      🔄 Dynamic keys: ${dynamicKeysInFile.join(', ')}`);
      }
    }
  });

  console.log(`✅ Found ${usedKeys.size} used translation keys`);
  console.log(`   📌 Static keys: ${staticKeys.size}`);
  console.log(`   🔄 Dynamic keys: ${dynamicKeys.size}\n`);

  // 4. Find unused keys
  const unusedKeys = allTranslationKeys.filter(key => !usedKeys.has(key));

  // 5. Generate report
  if (unusedKeys.length === 0) {
    console.log('🎉 All translation keys are being used!');
    return;
  }

  console.log('🗑️  UNUSED TRANSLATION KEYS:');
  console.log('================================\n');

  // Group unused keys by section
  const keysBySection = {};
  unusedKeys.forEach(key => {
    const section = key.split('.')[0];
    if (!keysBySection[section]) {
      keysBySection[section] = [];
    }
    keysBySection[section].push(key);
  });

  // Display grouped results
  Object.entries(keysBySection).forEach(([section, keys]) => {
    console.log(`📂 ${section.toUpperCase()} (${keys.length} unused keys):`);
    keys.forEach(key => {
      console.log(`   • ${key}`);
    });
    console.log('');
  });

  // 6. Generate removal suggestions
  console.log('💡 REMOVAL SUGGESTIONS:');
  console.log('=======================\n');

  const localeFiles = fs
    .readdirSync(LOCALES_DIR)
    .filter(item => fs.statSync(path.join(LOCALES_DIR, item)).isDirectory())
    .map(locale => path.join(LOCALES_DIR, locale, 'common.json'));

  console.log(
    `These ${unusedKeys.length} keys can be safely removed from all ${localeFiles.length} locale files:`
  );
  console.log('(Run with --remove flag to automatically remove them)\n');

  unusedKeys.forEach(key => {
    console.log(`   "${key}"`);
  });

  // 7. Summary
  console.log('\n📊 SUMMARY:');
  console.log('============');
  console.log(`Total translation keys: ${allTranslationKeys.length}`);
  console.log(`Used keys: ${usedKeys.size}`);
  console.log(`Unused keys: ${unusedKeys.length}`);
  console.log(`Usage rate: ${((usedKeys.size / allTranslationKeys.length) * 100).toFixed(1)}%`);

  return {
    totalKeys: allTranslationKeys.length,
    usedKeys: Array.from(usedKeys),
    unusedKeys: unusedKeys,
    localeFiles: localeFiles,
  };
}

/**
 * Remove empty objects recursively
 */
function removeEmptyObjects(obj) {
  Object.keys(obj).forEach(key => {
    const value = obj[key];

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively clean nested objects
      removeEmptyObjects(value);

      // Check if object is now empty and remove it
      if (Object.keys(value).length === 0) {
        delete obj[key];
      }
    }
  });
}

/**
 * Remove unused keys from all locale files
 */
function removeUnusedKeys(unusedKeys, localeFiles, dryRun = false) {
  const actionText = dryRun ? 'Would remove' : 'Removing';
  console.log(`\n🗑️  ${actionText} unused translation keys and empty objects...\n`);

  let totalModified = 0;
  let totalKeysRemoved = 0;

  localeFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const translations = JSON.parse(content);
      let modified = false;
      let keysRemovedInFile = 0;

      // Remove unused keys
      unusedKeys.forEach(keyPath => {
        const keys = keyPath.split('.');
        let current = translations;

        // Navigate to parent object
        for (let i = 0; i < keys.length - 1; i++) {
          if (current[keys[i]]) {
            current = current[keys[i]];
          } else {
            return; // Key doesn't exist
          }
        }

        // Remove the key
        const lastKey = keys[keys.length - 1];
        if (current[lastKey] !== undefined) {
          if (!dryRun) {
            delete current[lastKey];
          }
          modified = true;
          keysRemovedInFile++;
        }
      });

      // Remove empty objects
      if (!dryRun) {
        const originalString = JSON.stringify(translations);
        removeEmptyObjects(translations);
        const cleanedString = JSON.stringify(translations);

        if (originalString !== cleanedString) {
          modified = true;
        }
      }

      if (modified) {
        if (!dryRun) {
          // Write back to file with proper formatting
          fs.writeFileSync(filePath, JSON.stringify(translations, null, 2) + '\n');
        }
        const relativePath = path.relative(process.cwd(), filePath);
        const prefix = dryRun ? '🔍 Would update' : '✅ Updated';
        console.log(`${prefix}: ${relativePath} (${keysRemovedInFile} keys)`);
        totalModified++;
        totalKeysRemoved += keysRemovedInFile;
      } else {
        const relativePath = path.relative(process.cwd(), filePath);
        const prefix = dryRun ? '⏩ No changes needed' : '⏩ No changes';
        console.log(`${prefix}: ${relativePath}`);
      }
    } catch (error) {
      console.error(`❌ Error ${dryRun ? 'analyzing' : 'updating'} ${filePath}:`, error.message);
    }
  });

  if (dryRun) {
    console.log(`\n📊 DRY RUN SUMMARY:`);
    console.log(`Files that would be modified: ${totalModified}`);
    console.log(`Total keys that would be removed: ${totalKeysRemoved}`);
    console.log(`\n💡 Run without --dry-run to actually remove the keys.`);
  } else {
    console.log(
      `\n✅ Successfully removed ${totalKeysRemoved} unused keys from ${totalModified} files!`
    );
  }
}

/**
 * Clean empty objects from all locale files
 */
function cleanEmptyObjects(localeFiles, dryRun = false) {
  const actionText = dryRun ? 'Would clean' : 'Cleaning';
  console.log(`\n🧹 ${actionText} empty objects from translation files...\n`);

  let totalModified = 0;
  let totalEmptyObjectsRemoved = 0;

  localeFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const translations = JSON.parse(content);

      // Count empty objects before cleaning
      const emptyObjectsCount = countEmptyObjects(translations);

      if (!dryRun) {
        // Remove empty objects
        const originalString = JSON.stringify(translations);
        removeEmptyObjects(translations);
        const cleanedString = JSON.stringify(translations);

        if (originalString !== cleanedString) {
          // Write back to file with proper formatting
          fs.writeFileSync(filePath, JSON.stringify(translations, null, 2) + '\n');
          const relativePath = path.relative(process.cwd(), filePath);
          console.log(`✅ Cleaned: ${relativePath} (${emptyObjectsCount} empty objects)`);
          totalModified++;
          totalEmptyObjectsRemoved += emptyObjectsCount;
        } else {
          console.log(`⏩ No empty objects: ${path.relative(process.cwd(), filePath)}`);
        }
      } else {
        // Dry run mode
        const relativePath = path.relative(process.cwd(), filePath);
        if (emptyObjectsCount > 0) {
          console.log(`🔍 Would clean: ${relativePath} (${emptyObjectsCount} empty objects)`);
          totalModified++;
          totalEmptyObjectsRemoved += emptyObjectsCount;
        } else {
          console.log(`⏩ No empty objects: ${relativePath}`);
        }
      }
    } catch (error) {
      console.error(`❌ Error ${dryRun ? 'analyzing' : 'cleaning'} ${filePath}:`, error.message);
    }
  });

  if (dryRun) {
    console.log(`\n📊 DRY RUN SUMMARY:`);
    console.log(`Files that would be modified: ${totalModified}`);
    console.log(`Total empty objects that would be removed: ${totalEmptyObjectsRemoved}`);
    console.log(`\n💡 Run without --dry-run to actually clean the files.`);
  } else {
    console.log(
      `\n✅ Successfully removed ${totalEmptyObjectsRemoved} empty objects from ${totalModified} files!`
    );
  }
}

/**
 * Count empty objects recursively
 */
function countEmptyObjects(obj) {
  let count = 0;

  Object.keys(obj).forEach(key => {
    const value = obj[key];

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Check if this object is empty
      if (Object.keys(value).length === 0) {
        count++;
      } else {
        // Recursively count empty objects in nested objects
        count += countEmptyObjects(value);
      }
    }
  });

  return count;
}

/**
 * Display help information
 */
function displayHelp() {
  console.log('🌍 WHPH Translation Analyzer');
  console.log('=============================\n');

  console.log('USAGE:');
  console.log('  node scripts/find-unused-translations.js [OPTIONS]\n');

  console.log('OPTIONS:');
  console.log('  -h, --help                Show this help message');
  console.log('  -v, --verbose             Show detailed analysis output');
  console.log('  -r, --remove              Remove unused translation keys');
  console.log('  -c, --clean-empty         Clean only empty objects from translation files');
  console.log(
    '  --add-missing             Add missing keys to all locale files (using English as template)'
  );
  console.log('  --dry-run                 Show what would be changed without modifying files');
  console.log('  --all                     Analyze, remove unused keys, and clean empty objects\n');

  console.log('EXAMPLES:');
  console.log('  node scripts/find-unused-translations.js');
  console.log('    → Analyze translation usage and show unused keys');
  console.log('');
  console.log('  node scripts/find-unused-translations.js --verbose');
  console.log('    → Show detailed analysis with per-file breakdown');
  console.log('');
  console.log('  node scripts/find-unused-translations.js --dry-run --remove');
  console.log('    → Preview what keys would be removed without actually removing them');
  console.log('');
  console.log('  node scripts/find-unused-translations.js --remove');
  console.log('    → Remove unused keys and clean empty objects');
  console.log('');
  console.log('  node scripts/find-unused-translations.js --clean-empty');
  console.log('    → Only clean empty objects from translation files');
  console.log('');
  console.log('  node scripts/find-unused-translations.js --add-missing');
  console.log('    → Add missing translation keys to all locale files');
  console.log('');
  console.log('  node scripts/find-unused-translations.js --all');
  console.log('    → Full cleanup: analyze, remove unused keys, and clean empty objects\n');

  console.log('FEATURES:');
  console.log('  ✅ Detects static translation keys: t("key.name")');
  console.log('  ✅ Detects dynamic translation keys: t(`prefix.${variable}.suffix`)');
  console.log('  ✅ Handles nested object structures');
  console.log('  ✅ Safely removes unused keys and empty objects');
  console.log('  ✅ Dry-run mode for safe preview');
  console.log('  ✅ Works across all locale files simultaneously\n');
}

/**
 * Get all locale files
 */
function getLocaleFiles() {
  return fs
    .readdirSync(LOCALES_DIR)
    .filter(item => fs.statSync(path.join(LOCALES_DIR, item)).isDirectory())
    .map(locale => path.join(LOCALES_DIR, locale, 'common.json'))
    .filter(filePath => fs.existsSync(filePath));
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const showHelp = args.includes('--help') || args.includes('-h');
  const shouldRemove = args.includes('--remove') || args.includes('-r');
  const shouldCleanEmpty = args.includes('--clean-empty') || args.includes('-c');
  const shouldAddMissing = args.includes('--add-missing');
  const verbose = args.includes('--verbose') || args.includes('-v');
  const dryRun = args.includes('--dry-run');
  const doAll = args.includes('--all');

  if (showHelp) {
    displayHelp();
    return;
  }

  console.log('🌍 WHPH Translation Analyzer');
  console.log('=============================\n');

  const localeFiles = getLocaleFiles();

  // Handle different operation modes
  if (shouldCleanEmpty && !doAll && !shouldRemove && !shouldAddMissing) {
    // Only clean empty objects
    cleanEmptyObjects(localeFiles, dryRun);
    return;
  }

  if (shouldAddMissing && !doAll && !shouldRemove && !shouldCleanEmpty) {
    // Only add missing keys
    addMissingKeys(dryRun);
    return;
  }

  // Always start with analysis
  const analysis = analyzeTranslations(verbose);

  if (!analysis) {
    process.exit(1);
  }

  // Handle removal operations
  if (shouldRemove || doAll) {
    if (analysis.unusedKeys.length > 0) {
      removeUnusedKeys(analysis.unusedKeys, analysis.localeFiles, dryRun);
    } else {
      console.log('\n🎉 No unused keys to remove!');
    }

    // Clean empty objects after removing keys (or if --all is specified)
    if (doAll) {
      cleanEmptyObjects(localeFiles, dryRun);
    }
  } else if (analysis.unusedKeys.length > 0) {
    // Show suggestions if not removing
    console.log('\n💡 NEXT STEPS:');
    console.log('================');
    console.log('To preview changes:');
    console.log('   node scripts/find-unused-translations.js --remove --dry-run');
    console.log('');
    console.log('To remove unused keys:');
    console.log('   node scripts/find-unused-translations.js --remove');
    console.log('');
    console.log('To do full cleanup:');
    console.log('   node scripts/find-unused-translations.js --all');
  } else {
    console.log('\n🎉 All translation keys are being used!');
    console.log('\n💡 You can still clean empty objects with:');
    console.log('   node scripts/find-unused-translations.js --clean-empty');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

/**
 * Add missing keys to all locale files based on English reference
 */
function addMissingKeys(dryRun = false) {
  console.log(`\n🔧 ${dryRun ? 'Would add' : 'Adding'} missing translation keys...\n`);

  const englishPath = path.join(LOCALES_DIR, 'en', 'common.json');
  const englishTranslations = JSON.parse(fs.readFileSync(englishPath, 'utf-8'));
  const englishKeys = getTranslationKeys(englishTranslations);

  const localeFiles = getLocaleFiles().filter(f => !f.includes('/en/'));
  let totalKeysAdded = 0;
  let totalFilesModified = 0;

  localeFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const translations = JSON.parse(content);
      const existingKeys = getTranslationKeys(translations);

      const missingKeys = englishKeys.filter(key => !existingKeys.includes(key));

      if (missingKeys.length > 0) {
        if (!dryRun) {
          // Add missing keys with English values as placeholders
          missingKeys.forEach(keyPath => {
            const keys = keyPath.split('.');
            let currentEn = englishTranslations;
            let currentTarget = translations;

            // Navigate to get English value
            for (let i = 0; i < keys.length - 1; i++) {
              currentEn = currentEn[keys[i]];

              // Create nested structure if doesn't exist
              if (!currentTarget[keys[i]]) {
                currentTarget[keys[i]] = {};
              }
              currentTarget = currentTarget[keys[i]];
            }

            // Set the value with English as placeholder
            const lastKey = keys[keys.length - 1];
            currentTarget[lastKey] = currentEn[lastKey];
          });

          // Write back to file
          fs.writeFileSync(filePath, JSON.stringify(translations, null, 2) + '\n');
        }

        const relativePath = path.relative(process.cwd(), filePath);
        const prefix = dryRun ? '🔍 Would update' : '✅ Updated';
        console.log(`${prefix}: ${relativePath} (${missingKeys.length} keys added)`);
        totalKeysAdded += missingKeys.length;
        totalFilesModified++;
      } else {
        const relativePath = path.relative(process.cwd(), filePath);
        console.log(`⏩ No missing keys: ${relativePath}`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  });

  if (dryRun) {
    console.log(`\n📊 DRY RUN SUMMARY:`);
    console.log(`Files that would be modified: ${totalFilesModified}`);
    console.log(`Total keys that would be added: ${totalKeysAdded}`);
  } else {
    console.log(
      `\n✅ Successfully added ${totalKeysAdded} missing keys to ${totalFilesModified} files!`
    );
  }
}

export { analyzeTranslations, removeUnusedKeys, addMissingKeys };
