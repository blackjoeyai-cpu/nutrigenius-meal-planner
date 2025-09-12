#!/bin/bash

# Simple script to create a new release tag
# Usage: ./scripts/create-release.sh [major|minor|patch] [custom-tag]

set -e

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "Error: Not in a git repository"
    exit 1
fi

# Get the current version
CURRENT_VERSION=$(git describe --tags --always 2>/dev/null || echo "0.0.0")
echo "Current version: $CURRENT_VERSION"

# Determine the bump type or custom tag
if [ $# -eq 0 ]; then
    echo "Usage: $0 [major|minor|patch] [custom-tag]"
    echo "Example: $0 minor"
    echo "Example: $0 custom v2.0.0-beta"
    exit 1
fi

if [ "$1" == "custom" ]; then
    if [ -z "$2" ]; then
        echo "Error: Custom tag required"
        exit 1
    fi
    NEW_VERSION="$2"
else
    # Validate bump type
    if [[ ! "$1" =~ ^(major|minor|patch)$ ]]; then
        echo "Error: Invalid bump type. Use major, minor, or patch"
        exit 1
    fi
    
    # Calculate new version using npm
    NEW_VERSION=$(npx semver "$CURRENT_VERSION" -i "$1")
fi

echo "New version: $NEW_VERSION"

# Confirm before proceeding
read -p "Create tag $NEW_VERSION? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted"
    exit 0
fi

# Create and push the new tag
git tag -a "$NEW_VERSION" -m "Release $NEW_VERSION"
git push origin "$NEW_VERSION"

echo "Tag $NEW_VERSION created and pushed!"