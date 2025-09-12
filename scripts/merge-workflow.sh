#!/bin/bash

# Script to help with the proper merging workflow
# Ensures merges follow the correct sequence: feature → dev → release → main
# All merges must go through pull requests

echo "Branch Merging Helper"
echo "===================="
echo "This script helps you follow the correct merging sequence."
echo "All merges must go through pull requests."
echo ""
echo "Current workflow options:"
echo "1. Create PR from feature branch to dev"
echo "2. Create PR from dev to release"
echo "3. Create PR from release to main"
echo ""

read -p "Select an option (1-3): " option

case $option in
  1)
    echo "Creating PR from feature branch to dev..."
    echo "Current branch: $(git rev-parse --abbrev-ref HEAD)"
    echo "This will guide you to create a PR from your feature branch to dev."
    read -p "Continue? (y/N): " confirm
    if [[ $confirm == [yY] ]]; then
      current_branch=$(git rev-parse --abbrev-ref HEAD)
      if [[ "$current_branch" == "dev" ]] || [[ "$current_branch" == "release" ]] || [[ "$current_branch" == "main" ]]; then
        echo "ERROR: You're on a protected branch. Please switch to a feature branch."
        exit 1
      fi
      echo "Now create your PR on GitHub to merge ${current_branch} into dev"
      echo "Make sure all checks pass before merging!"
    fi
    ;;
  2)
    echo "Creating PR from dev to release..."
    echo "This will guide you to create a PR from dev to release after testing."
    read -p "Continue? (y/N): " confirm
    if [[ $confirm == [yY] ]]; then
      current_branch=$(git rev-parse --abbrev-ref HEAD)
      if [[ "$current_branch" != "dev" ]]; then
        echo "You're not on the dev branch. Please switch to the dev branch first."
        exit 1
      fi
      echo "Now create your PR on GitHub to merge dev into release"
      echo "Make sure all checks pass before merging!"
    fi
    ;;
  3)
    echo "Creating PR from release to main..."
    echo "This will guide you to create a PR from release to main for production release."
    read -p "Continue? (y/N): " confirm
    if [[ $confirm == [yY] ]]; then
      current_branch=$(git rev-parse --abbrev-ref HEAD)
      if [[ "$current_branch" != "release" ]]; then
        echo "You're not on the release branch. Please switch to the release branch first."
        exit 1
      fi
      echo "Now create your PR on GitHub to merge release into main"
      echo "Make sure all checks pass before merging!"
    fi
    ;;
  *)
    echo "Invalid option. Please run the script again and select 1, 2, or 3."
    ;;
esac