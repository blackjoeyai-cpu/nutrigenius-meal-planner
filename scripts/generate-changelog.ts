#!/usr/bin/env node

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { resolve, join } from 'path';

// Get the root directory of the project
const rootDir = resolve(__dirname, '..');

interface Commit {
  hash: string;
  message: string;
  type: string;
  scope?: string;
  subject: string;
}

function parseCommit(commitLine: string): Commit | null {
  // Parse commit line in format: hash message
  const parts = commitLine.split(' ');
  if (parts.length < 2) return null;

  const hash = parts[0];
  const message = parts.slice(1).join(' ');

  // Extract conventional commit format: type(scope): subject
  const conventionalCommitRegex = /^(\w+)(?:\(([^)]+)\))?:\s*(.*)$/;
  const match = message.match(conventionalCommitRegex);

  if (match) {
    return {
      hash,
      message,
      type: match[1],
      scope: match[2],
      subject: match[3],
    };
  }

  // If not a conventional commit, treat as a generic commit
  return {
    hash,
    message,
    type: 'other',
    subject: message,
  };
}

function categorizeCommits(commits: Commit[]): Record<string, Commit[]> {
  const categorized: Record<string, Commit[]> = {
    feat: [],
    fix: [],
    perf: [],
    docs: [],
    style: [],
    refactor: [],
    test: [],
    build: [],
    ci: [],
    chore: [],
    revert: [],
    other: [],
  };

  for (const commit of commits) {
    const type = commit.type in categorized ? commit.type : 'other';
    categorized[type].push(commit);
  }

  return categorized;
}

function formatChangelog(categorizedCommits: Record<string, Commit[]>): string {
  const categoryTitles: Record<string, string> = {
    feat: '🚀 Features',
    fix: '🐛 Bug Fixes',
    perf: '⚡ Performance Improvements',
    docs: '📚 Documentation',
    style: '💅 Styles',
    refactor: '🔄 Code Refactoring',
    test: '🧪 Tests',
    build: '🏗️ Build System',
    ci: '⚙️ Continuous Integration',
    chore: '🧹 Chores',
    revert: '⏪ Reverts',
    other: '📎 Other Changes',
  };

  let changelog = '';

  for (const [type, commits] of Object.entries(categorizedCommits)) {
    if (commits.length > 0) {
      changelog += `### ${categoryTitles[type]}\n\n`;

      for (const commit of commits) {
        // Format each commit with a link to the commit on GitHub
        const commitLink = `[\`${commit.hash.substring(0, 7)}\`](https://github.com/${process.env.GITHUB_REPOSITORY}/commit/${commit.hash})`;
        changelog += `- ${commit.subject} ${commitLink}\n`;
      }

      changelog += '\n';
    }
  }

  return changelog;
}

try {
  // Get the previous tag or default to HEAD~10 if no tags exist
  let previousTag = 'HEAD~10';
  try {
    const tags = execSync('git tag --sort=-v:refname', {
      cwd: rootDir,
      stdio: ['pipe', 'pipe', 'ignore'],
    })
      .toString()
      .trim()
      .split('\n')
      .filter(tag => tag.trim() !== '');

    if (tags.length > 0) {
      previousTag = tags[0]; // Most recent tag
    }
  } catch {
    console.warn('No git tags found, using default range');
  }

  // Get commits between previous tag and HEAD
  const commitLog = execSync(`git log --oneline ${previousTag}..HEAD`, {
    cwd: rootDir,
  })
    .toString()
    .trim();

  // Initialize changelog content
  let changelog = '# Changelog\n\n';

  if (commitLog) {
    // Parse commits
    const commitLines = commitLog.split('\n');
    const commits: Commit[] = [];

    for (const line of commitLines) {
      const commit = parseCommit(line);
      if (commit) {
        commits.push(commit);
      }
    }

    // Categorize commits
    const categorizedCommits = categorizeCommits(commits);

    // Format changelog
    changelog += formatChangelog(categorizedCommits);
  } else {
    changelog += 'No changes found since last release.\n';
  }

  // Output changelog
  console.log(changelog);

  // Write changelog to a file for use in the release workflow
  const changelogFilePath = join(rootDir, 'TEMP_CHANGELOG.md');
  writeFileSync(changelogFilePath, changelog);
  console.log(`Changelog written to ${changelogFilePath}`);
} catch (error) {
  console.error('Error generating changelog:', (error as Error).message);
  
  // Ensure we always create the file even if there's an error
  const changelogContent = '# Changelog\n\nError occurred while generating changelog. Please check the CI logs for details.';
  const changelogFilePath = join(rootDir, 'TEMP_CHANGELOG.md');
  writeFileSync(changelogFilePath, changelogContent);
  
  console.log(`Created fallback changelog at ${changelogFilePath}`);
}

// Always exit successfully to ensure the workflow continues
process.exit(0);
