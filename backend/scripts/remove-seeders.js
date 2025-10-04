#!/usr/bin/env node

/**
 * Production Seeder Removal Script
 * Removes all development seeders and test data for production deployment
 */

const fs = require('fs');
const path = require('path');

const SEEDER_PATTERNS = [
  'seed',
  'seeder',
  'mock',
  'dummy',
  'test-data',
  'sample'
];

const DIRECTORIES_TO_CLEAN = [
  'seeders',
  'seeds',
  'data/seeds',
  'data/mock',
  'scripts/seed'
];

function removeSeederFiles() {
  console.log('🧹 Removing development seeders for production...');
  
  const backendDir = path.join(__dirname, '..');
  let removedCount = 0;
  
  // Remove seeder directories
  DIRECTORIES_TO_CLEAN.forEach(dir => {
    const fullPath = path.join(backendDir, dir);
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`✅ Removed directory: ${dir}`);
      removedCount++;
    }
  });
  
  // Remove seeder files
  function scanDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        scanDirectory(itemPath);
      } else if (stat.isFile()) {
        const fileName = item.toLowerCase();
        
        // Check if file matches seeder patterns
        if (SEEDER_PATTERNS.some(pattern => fileName.includes(pattern))) {
          fs.unlinkSync(itemPath);
          console.log(`✅ Removed file: ${path.relative(backendDir, itemPath)}`);
          removedCount++;
        }
      }
    });
  }
  
  scanDirectory(backendDir);
  
  console.log(`\n🎉 Production cleanup complete! Removed ${removedCount} seeder files/directories.`);
}

// Clean package.json scripts
function cleanPackageJson() {
  const packagePath = path.join(__dirname, '..', 'package.json');
  
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Remove seeder scripts
    if (packageJson.scripts) {
      const scriptsToRemove = Object.keys(packageJson.scripts).filter(script => 
        SEEDER_PATTERNS.some(pattern => script.toLowerCase().includes(pattern))
      );
      
      scriptsToRemove.forEach(script => {
        delete packageJson.scripts[script];
        console.log(`✅ Removed script: ${script}`);
      });
      
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
      console.log('✅ Cleaned package.json scripts');
    }
  }
}

// Main execution
if (require.main === module) {
  removeSeederFiles();
  cleanPackageJson();
  
  console.log('\n🚀 Backend is now production-ready!');
  console.log('📝 Next steps:');
  console.log('   1. Set NODE_ENV=production');
  console.log('   2. Configure production database');
  console.log('   3. Set up proper logging');
  console.log('   4. Configure CORS for production domains');
}

module.exports = { removeSeederFiles, cleanPackageJson };