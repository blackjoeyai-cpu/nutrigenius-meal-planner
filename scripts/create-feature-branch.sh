#!/bin/bash

# Script to create feature branches following the project's branching strategy

# Check if a branch name was provided
if [ $# -eq 0 ]; then
    echo "Usage: ./scripts/create-feature-branch.sh <feature-name>"
    echo "Example: ./scripts/create-feature-branch.sh user-authentication"
    exit 1
fi

FEATURE_NAME=$1

# Switch to dev branch and pull latest changes
echo "Switching to dev branch and pulling latest changes..."
git checkout dev
git pull origin dev

# Create new feature branch
echo "Creating feature branch: feature/$FEATURE_NAME"
git checkout -b feature/$FEATURE_NAME

echo "Feature branch 'feature/$FEATURE_NAME' created successfully from dev!"
echo "Remember to push your branch when ready:"
echo "  git push origin feature/$FEATURE_NAME"