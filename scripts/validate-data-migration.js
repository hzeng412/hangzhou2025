#!/usr/bin/env node

/**
 * Data Migration Validation Script
 * 
 * This script validates that all data from the original separate language files
 * has been correctly migrated to the unified multilingual structure.
 * 
 * Requirements covered: 6.1, 6.2, 6.3, 6.4
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File paths for remaining original files (for reference)
const ORIGINAL_FILES = {
  speakers: {
    en: path.join(__dirname, '../src/json/Speakers.json')
  },
  faq: {
    en: path.join(__dirname, '../src/json/FAQ.json')
  },
  sponsors: {
    en: path.join(__dirname, '../src/json/Sponsors.json')
  },
  workshops: {
    en: path.join(__dirname, '../src/json/Workshops.json')
  }
};

const UNIFIED_FILES = {
  speakers: path.join(__dirname, '../src/i18n/data/speakers.json'),
  faq: path.join(__dirname, '../src/i18n/data/faq.json'),
  sponsors: path.join(__dirname, '../src/i18n/data/sponsors.json'),
  workshops: path.join(__dirname, '../src/i18n/data/workshops.json')
};

class ValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

class DataValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.stats = {
      speakers: { unified: 0 },
      faq: { unified: 0 },
      sponsors: { unified: 0 },
      workshops: { unified: 0 }
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '✓',
      warn: '⚠',
      error: '✗'
    }[type];
    
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  addError(message, details = {}) {
    this.errors.push({ message, details });
    this.log(message, 'error');
  }

  addWarning(message, details = {}) {
    this.warnings.push({ message, details });
    this.log(message, 'warn');
  }

  loadJsonFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new ValidationError(`File not found: ${filePath}`);
      }
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      throw new ValidationError(`Failed to load ${filePath}: ${error.message}`);
    }
  }

  validateSpeakers() {
    this.log('Validating speakers data structure...');
    
    try {
      const unified = this.loadJsonFile(UNIFIED_FILES.speakers);
      this.stats.speakers.unified = unified.speakers?.length || 0;

      // Validate unified structure exists
      if (!unified.speakers || !Array.isArray(unified.speakers)) {
        this.addError('Unified speakers data is missing or invalid');
        return;
      }

      // Validate each speaker has required multilingual structure
      for (const speaker of unified.speakers) {
        if (!speaker.id) {
          this.addError('Speaker missing required id field');
          continue;
        }

        // Check for multilingual fields
        const requiredMultilingualFields = ['name', 'bio', 'role', 'org'];
        for (const field of requiredMultilingualFields) {
          if (speaker[field]) {
            if (typeof speaker[field] !== 'object') {
              this.addError(`Speaker ${speaker.id}: ${field} should be multilingual object`);
            } else {
              if (!speaker[field].en) {
                this.addError(`Speaker ${speaker.id}: Missing English ${field}`);
              }
              // Chinese is optional but should be valid if present
              if (speaker[field].zh && typeof speaker[field].zh !== 'string') {
                this.addError(`Speaker ${speaker.id}: Invalid Chinese ${field}`);
              }
            }
          }
        }

        // Validate non-translatable fields
        const nonTranslatableFields = ['image', 'tag', 'status', 'draft'];
        for (const field of nonTranslatableFields) {
          if (speaker[field] !== undefined && typeof speaker[field] === 'object' && speaker[field] !== null) {
            this.addWarning(`Speaker ${speaker.id}: ${field} appears to be multilingual but should be simple value`);
          }
        }
      }

      // Validate categories structure
      if (unified.categories && Array.isArray(unified.categories)) {
        for (const category of unified.categories) {
          if (category.name && typeof category.name === 'object') {
            if (!category.name.en) {
              this.addError('Category missing English name');
            }
          }
        }
      }

      this.log(`Speakers validation completed: ${this.stats.speakers.unified} speakers processed`);
      
    } catch (error) {
      this.addError(`Speakers validation failed: ${error.message}`);
    }
  }

  validateSpeakerData(originalSpeaker, unifiedSpeaker, lang, speakerId) {
    const requiredFields = ['name', 'bio', 'role', 'org', 'roleOrg'];
    
    for (const field of requiredFields) {
      if (originalSpeaker[field] && originalSpeaker[field] !== 'undefined') {
        if (!unifiedSpeaker[field] || !unifiedSpeaker[field][lang]) {
          this.addError(`Missing ${lang} ${field} for speaker ${speakerId}`);
        } else if (unifiedSpeaker[field][lang] !== originalSpeaker[field]) {
          this.addError(`${lang} ${field} mismatch for speaker ${speakerId}`, {
            expected: originalSpeaker[field],
            actual: unifiedSpeaker[field][lang]
          });
        }
      }
    }

    // Validate non-translatable fields
    const nonTranslatableFields = ['image', 'tag', 'status', 'draft', 'socialLinks'];
    for (const field of nonTranslatableFields) {
      if (originalSpeaker[field] !== undefined && 
          JSON.stringify(originalSpeaker[field]) !== JSON.stringify(unifiedSpeaker[field])) {
        this.addError(`${field} mismatch for speaker ${speakerId}`, {
          expected: originalSpeaker[field],
          actual: unifiedSpeaker[field]
        });
      }
    }
  }

  validateFAQ() {
    this.log('Validating FAQ data structure...');
    
    try {
      const unified = this.loadJsonFile(UNIFIED_FILES.faq);
      this.stats.faq.unified = unified.faqs?.length || 0;

      // Validate unified structure exists
      if (!unified.faqs || !Array.isArray(unified.faqs)) {
        this.addError('Unified FAQ data is missing or invalid');
        return;
      }

      // Validate each FAQ has required multilingual structure
      for (let i = 0; i < unified.faqs.length; i++) {
        const faq = unified.faqs[i];
        
        // Check for multilingual fields
        const requiredMultilingualFields = ['category', 'question', 'answer'];
        for (const field of requiredMultilingualFields) {
          if (faq[field]) {
            if (typeof faq[field] !== 'object') {
              this.addError(`FAQ ${i}: ${field} should be multilingual object`);
            } else {
              if (!faq[field].en) {
                this.addError(`FAQ ${i}: Missing English ${field}`);
              }
              // Chinese is optional but should be valid if present
              if (faq[field].zh && typeof faq[field].zh !== 'string') {
                this.addError(`FAQ ${i}: Invalid Chinese ${field}`);
              }
            }
          }
        }
      }

      this.log(`FAQ validation completed: ${this.stats.faq.unified} FAQs processed`);
      
    } catch (error) {
      this.addError(`FAQ validation failed: ${error.message}`);
    }
  }

  validateFAQData(originalFAQ, unifiedFAQ, lang, index) {
    const requiredFields = ['category', 'question', 'answer'];
    
    for (const field of requiredFields) {
      if (originalFAQ[field]) {
        if (!unifiedFAQ[field] || !unifiedFAQ[field][lang]) {
          this.addError(`Missing ${lang} ${field} for FAQ at index ${index}`);
        } else if (unifiedFAQ[field][lang] !== originalFAQ[field]) {
          this.addError(`${lang} ${field} mismatch for FAQ at index ${index}`, {
            expected: originalFAQ[field],
            actual: unifiedFAQ[field][lang]
          });
        }
      }
    }
  }

  validateSponsors() {
    this.log('Validating sponsors data structure...');
    
    try {
      const unified = this.loadJsonFile(UNIFIED_FILES.sponsors);
      this.stats.sponsors.unified = unified.partners?.length || 0;

      // Validate unified structure exists
      if (!unified.partners || !Array.isArray(unified.partners)) {
        this.addError('Unified sponsors data is missing or invalid');
        return;
      }

      // Validate each sponsor has correct structure
      for (let i = 0; i < unified.partners.length; i++) {
        const sponsor = unified.partners[i];
        
        // Validate required fields
        if (!sponsor.image) {
          this.addError(`Sponsor ${i}: Missing image field`);
        }

        // Category might be multilingual or simple string
        if (sponsor.category) {
          if (typeof sponsor.category === 'object') {
            if (!sponsor.category.en) {
              this.addError(`Sponsor ${i}: Missing English category`);
            }
          }
        }

        // Non-translatable fields should be simple values
        const nonTranslatableFields = ['image', 'link'];
        for (const field of nonTranslatableFields) {
          if (sponsor[field] !== undefined && typeof sponsor[field] === 'object' && sponsor[field] !== null) {
            this.addWarning(`Sponsor ${i}: ${field} appears to be multilingual but should be simple value`);
          }
        }
      }

      this.log(`Sponsors validation completed: ${this.stats.sponsors.unified} sponsors processed`);
      
    } catch (error) {
      this.addError(`Sponsors validation failed: ${error.message}`);
    }
  }

  validateSponsorData(originalSponsor, unifiedSponsor, lang, index) {
    // For sponsors, category might be translatable, image should be the same
    if (originalSponsor.category && unifiedSponsor.category) {
      if (typeof unifiedSponsor.category === 'object') {
        if (!unifiedSponsor.category[lang] || unifiedSponsor.category[lang] !== originalSponsor.category) {
          this.addError(`${lang} category mismatch for sponsor at index ${index}`, {
            expected: originalSponsor.category,
            actual: unifiedSponsor.category[lang]
          });
        }
      } else if (unifiedSponsor.category !== originalSponsor.category) {
        this.addError(`Category mismatch for sponsor at index ${index}`, {
          expected: originalSponsor.category,
          actual: unifiedSponsor.category
        });
      }
    }

    // Image should be identical
    if (originalSponsor.image !== unifiedSponsor.image) {
      this.addError(`Image mismatch for sponsor at index ${index}`, {
        expected: originalSponsor.image,
        actual: unifiedSponsor.image
      });
    }

    // Link should be identical if present
    if (originalSponsor.link !== unifiedSponsor.link) {
      this.addError(`Link mismatch for sponsor at index ${index}`, {
        expected: originalSponsor.link,
        actual: unifiedSponsor.link
      });
    }
  }

  validateWorkshops() {
    this.log('Validating workshops data structure...');
    
    try {
      const unified = this.loadJsonFile(UNIFIED_FILES.workshops);
      this.stats.workshops.unified = unified.speakers?.length || 0;

      // Validate unified structure exists
      if (!unified.speakers || !Array.isArray(unified.speakers)) {
        this.addError('Unified workshops data is missing or invalid');
        return;
      }

      // Validate each workshop speaker has required multilingual structure
      for (const speaker of unified.speakers) {
        if (!speaker.id) {
          this.addError('Workshop speaker missing required id field');
          continue;
        }

        // Check for multilingual fields (similar to regular speakers)
        const requiredMultilingualFields = ['name', 'bio', 'role', 'org'];
        for (const field of requiredMultilingualFields) {
          if (speaker[field]) {
            if (typeof speaker[field] !== 'object') {
              this.addError(`Workshop speaker ${speaker.id}: ${field} should be multilingual object`);
            } else {
              if (!speaker[field].en) {
                this.addError(`Workshop speaker ${speaker.id}: Missing English ${field}`);
              }
            }
          }
        }
      }

      this.log(`Workshops validation completed: ${this.stats.workshops.unified} workshop speakers processed`);
      
    } catch (error) {
      this.addError(`Workshops validation failed: ${error.message}`);
    }
  }

  validateCategories(enCategories, zhCategories, unifiedCategories, dataType) {
    if (!enCategories || !unifiedCategories) return;

    if (enCategories.length !== unifiedCategories.length) {
      this.addError(`${dataType} categories count mismatch: Expected ${enCategories.length}, got ${unifiedCategories.length}`);
      return;
    }

    for (let i = 0; i < enCategories.length; i++) {
      const enCat = enCategories[i];
      const zhCat = zhCategories?.[i];
      const unifiedCat = unifiedCategories[i];

      if (!unifiedCat) {
        this.addError(`Missing ${dataType} category at index ${i}`);
        continue;
      }

      // Validate English category
      if (enCat.name && (!unifiedCat.name?.en || unifiedCat.name.en !== enCat.name)) {
        this.addError(`English category name mismatch for ${dataType} at index ${i}`, {
          expected: enCat.name,
          actual: unifiedCat.name?.en
        });
      }

      // Validate Chinese category if exists
      if (zhCat?.name && (!unifiedCat.name?.zh || unifiedCat.name.zh !== zhCat.name)) {
        this.addError(`Chinese category name mismatch for ${dataType} at index ${i}`, {
          expected: zhCat.name,
          actual: unifiedCat.name?.zh
        });
      }

      // Validate ID if present
      if (enCat.id && unifiedCat.id !== enCat.id) {
        this.addError(`Category ID mismatch for ${dataType} at index ${i}`, {
          expected: enCat.id,
          actual: unifiedCat.id
        });
      }
    }
  }

  generateReport() {
    this.log('\n=== DATA MIGRATION VALIDATION REPORT ===');
    
    // Statistics
    this.log('\nStatistics:');
    for (const [dataType, stats] of Object.entries(this.stats)) {
      this.log(`${dataType.toUpperCase()}:`);
      this.log(`  Unified: ${stats.unified}`);
      this.log(`  Status: ${stats.unified > 0 ? '✓ PASS' : '✗ FAIL'}`);
    }

    // Summary
    this.log(`\nSummary:`);
    this.log(`  Errors: ${this.errors.length}`);
    this.log(`  Warnings: ${this.warnings.length}`);
    this.log(`  Overall Status: ${this.errors.length === 0 ? '✓ PASS' : '✗ FAIL'}`);

    // Detailed errors
    if (this.errors.length > 0) {
      this.log('\nErrors:');
      this.errors.forEach((error, index) => {
        this.log(`  ${index + 1}. ${error.message}`);
        if (error.details && Object.keys(error.details).length > 0) {
          this.log(`     Details: ${JSON.stringify(error.details, null, 2)}`);
        }
      });
    }

    // Detailed warnings
    if (this.warnings.length > 0) {
      this.log('\nWarnings:');
      this.warnings.forEach((warning, index) => {
        this.log(`  ${index + 1}. ${warning.message}`);
        if (warning.details && Object.keys(warning.details).length > 0) {
          this.log(`     Details: ${JSON.stringify(warning.details, null, 2)}`);
        }
      });
    }

    return {
      success: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      stats: this.stats
    };
  }

  async validate() {
    this.log('Starting data migration validation...');
    
    try {
      this.validateSpeakers();
      this.validateFAQ();
      this.validateSponsors();
      this.validateWorkshops();
      
      return this.generateReport();
    } catch (error) {
      this.addError(`Validation process failed: ${error.message}`);
      return this.generateReport();
    }
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new DataValidator();
  
  validator.validate().then(result => {
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('Validation script failed:', error);
    process.exit(1);
  });
}

export { DataValidator };