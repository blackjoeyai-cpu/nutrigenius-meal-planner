#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get the root directory of the project
const rootDir = path.resolve(__dirname, '..');

try {
  // Get the latest git tag
  let version = '0.0.0'; // Default version if no tags exist
  try {
    version = execSync('git describe --tags --always --dirty', { 
      cwd: rootDir, 
      stdio: ['pipe', 'pipe', 'ignore'] 
    }).toString().trim();
  } catch (error) {
    console.warn('No git tags found, using default version');
  }

  // Get the current commit hash
  const commitHash = execSync('git rev-parse --short HEAD', { 
    cwd: rootDir 
  }).toString().trim();

  // Check if there are uncommitted changes
  const isDirty = execSync('git diff-index --quiet HEAD -- || echo "-dirty"', { 
    cwd: rootDir 
  }).toString().trim();

  // Get the branch name
  const branch = execSync('git rev-parse --abbrev-ref HEAD', { 
    cwd: rootDir 
  }).toString().trim();

  // Create version info object
  const versionInfo = {
    version,
    commitHash,
    branch,
    isDirty: isDirty !== '',
    buildTime: new Date().toISOString()
  };

  // Write version info to a JSON file
  const versionFilePath = path.join(rootDir, 'src', 'version.json');
  fs.writeFileSync(versionFilePath, JSON.stringify(versionInfo, null, 2));

  console.log(`Version info generated: ${version}${isDirty} (${commitHash})`);
} catch (error) {
  console.error('Error generating version info:', error.message);
  process.exit(1);
}