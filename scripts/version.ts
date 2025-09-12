#!/usr/bin/env node

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { resolve, join } from 'path';

// Get the root directory of the project
const rootDir = resolve(__dirname, '..');

try {
  // Initialize default values
  let version = '0.0.0'; // Default version if no tags exist
  let commitHash = 'unknown';
  let branch = 'unknown';
  let isDirty = false;

  // Check if we're in a git repository
  try {
    execSync('git rev-parse --git-dir', { cwd: rootDir, stdio: 'ignore' });
    
    // We're in a git repository, so get the actual git info
    try {
      version = execSync('git describe --tags --always --dirty', {
        cwd: rootDir,
        stdio: ['pipe', 'pipe', 'ignore'],
      })
        .toString()
        .trim();
    } catch {
      console.warn('No git tags found, using default version');
    }

    // Get the current commit hash
    try {
      commitHash = execSync('git rev-parse --short HEAD', {
        cwd: rootDir,
      })
        .toString()
        .trim();
    } catch {
      console.warn('Could not get commit hash, using default');
    }

    // Check if there are uncommitted changes
    try {
      const dirtyOutput = execSync('git diff-index --quiet HEAD -- || echo "-dirty"', {
        cwd: rootDir,
      })
        .toString()
        .trim();
      isDirty = dirtyOutput !== '';
    } catch {
      console.warn('Could not check for uncommitted changes, assuming clean');
    }

    // Get the branch name
    try {
      branch = execSync('git rev-parse --abbrev-ref HEAD', {
        cwd: rootDir,
      })
        .toString()
        .trim();
    } catch {
      console.warn('Could not get branch name, using default');
    }
  } catch {
    // Not in a git repository, use default values
    console.warn('Not in a git repository, using default version info');
    version = process.env.npm_package_version || '0.0.0';
    commitHash = process.env.VERCEL_GIT_COMMIT_SHA ? process.env.VERCEL_GIT_COMMIT_SHA.substring(0, 7) : 'unknown';
    branch = process.env.VERCEL_GIT_COMMIT_REF || 'unknown';
    isDirty = false;
  }

  // Create version info object
  const versionInfo = {
    version,
    commitHash,
    branch,
    isDirty,
    buildTime: new Date().toISOString(),
  };

  // Write version info to a JSON file
  const versionFilePath = join(rootDir, 'src', 'version.json');
  writeFileSync(versionFilePath, JSON.stringify(versionInfo, null, 2) + '\n');

  console.log(`Version info generated: ${version}${isDirty ? '-dirty' : ''} (${commitHash})`);
} catch (error) {
  console.error('Error generating version info:', (error as Error).message);
  
  // Even if we fail, write a default version file to prevent build failure
  try {
    const versionInfo = {
      version: process.env.npm_package_version || '0.0.0',
      commitHash: 'unknown',
      branch: 'unknown',
      isDirty: false,
      buildTime: new Date().toISOString(),
    };
    
    const versionFilePath = join(rootDir, 'src', 'version.json');
    writeFileSync(versionFilePath, JSON.stringify(versionInfo, null, 2) + '\n');
    
    console.log('Generated default version info due to error');
  } catch (writeError) {
    console.error('Failed to write default version info:', (writeError as Error).message);
    process.exit(1);
  }
}
