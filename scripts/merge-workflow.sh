#!/bin/bash

# Script to help with the proper merging workflow
# Ensures merges follow the correct sequence: feature → dev → release → main

echo "Branch Merging Helper"
echo "===================="
echo "This script helps you follow the correct merging sequence."
echo ""
echo "Current workflow options:"
echo "1. Merge feature branch into dev"
echo "2. Merge dev into release"
echo "3. Merge release into main"
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
    echo "Merging dev into release..."
    echo "This will merge dev into release after testing."
    echo "Please ensure all tests have passed."
    read -p "Continue? (y/N): " confirm
    if [[ $confirm == [yY] ]]; then
      git checkout release
      git pull origin release
      echo "Now create your PR on GitHub to merge dev into release"
    fi
    ;;
  3)
    echo "Merging release into main..."
    echo "This will merge release into main for production release."
    echo "Please ensure all release tests have passed."
    read -p "Continue? (y/N): " confirm
    if [[ $confirm == [yY] ]]; then
      git checkout main
      git pull origin main
      echo "Now create your PR on GitHub to merge release into main"
    fi
    ;;
  *)
    echo "Invalid option. Please run the script again and select 1, 2, or 3."
    ;;
esac