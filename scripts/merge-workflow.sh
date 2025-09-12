#!/bin/bash

# Script to help with the proper merging workflow
# Ensures merges follow the correct sequence: feature → dev → release → main

echo "Branch Merging Helper"
echo "===================="
echo "This script helps you follow the correct merging sequence."
echo ""
echo "Current workflow options:"
echo "1. Merge feature branch into dev"
echo "2. Create PR from dev to release"
echo "3. Create PR from release to main"
echo ""

read -p "Select an option (1-3): " option

case $option in
  1)
    echo "Merging feature branch into dev..."
    echo "Current branch: $(git rev-parse --abbrev-ref HEAD)"
    echo "This will merge your feature branch into dev."
    echo "Please ensure you've created a PR and it has been approved."
    read -p "Continue? (y/N): " confirm
    if [[ $confirm == [yY] ]]; then
      git checkout dev
      git pull origin dev
      echo "Now create your PR on GitHub to merge your feature branch into dev"
    fi
    ;;
  2)
    echo "Creating PR from dev to release..."
    echo "This will guide you to create a PR from dev to release after testing."
    echo "Please ensure all tests have passed and you're on the dev branch."
    read -p "Continue? (y/N): " confirm
    if [[ $confirm == [yY] ]]; then
      current_branch=$(git rev-parse --abbrev-ref HEAD)
      if [[ "$current_branch" != "dev" ]]; then
        echo "You're not on the dev branch. Checking out dev..."
        git checkout dev
        git pull origin dev
      fi
      echo "Now create your PR on GitHub to merge dev into release"
      echo "Make sure all checks pass before merging!"
    fi
    ;;
  3)
    echo "Creating PR from release to main..."
    echo "This will guide you to create a PR from release to main for production release."
    echo "Please ensure all release tests have passed and you're on the release branch."
    read -p "Continue? (y/N): " confirm
    if [[ $confirm == [yY] ]]; then
      current_branch=$(git rev-parse --abbrev-ref HEAD)
      if [[ "$current_branch" != "release" ]]; then
        echo "You're not on the release branch. Checking out release..."
        git checkout release
        git pull origin release
      fi
      echo "Now create your PR on GitHub to merge release into main"
      echo "Make sure all checks pass before merging!"
    fi
    ;;
  *)
    echo "Invalid option. Please run the script again and select 1, 2, or 3."
    ;;
esac