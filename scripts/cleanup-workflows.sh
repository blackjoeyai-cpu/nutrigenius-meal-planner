#!/bin/bash

# Remove old workflow files
rm -f .github/workflows/branch-protection-pr-target.yml
rm -f .github/workflows/branch-protection.yml
rm -f .github/workflows/ci-cd-pr-target.yml
rm -f .github/workflows/ci-cd.yml
rm -f .github/workflows/codeql-pr-target.yml
rm -f .github/workflows/codeql.yml
rm -f .github/workflows/dependabot-auto-approve.yml
rm -f .github/workflows/release-new.yml
rm -f .github/workflows/versioning.yml

echo "Old workflow files have been removed. Only optimized workflows remain:"
ls -la .github/workflows/