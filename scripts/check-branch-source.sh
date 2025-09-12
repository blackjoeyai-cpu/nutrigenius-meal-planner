#!/bin/bash

# Check if current branch is dev, release, or main
current_branch=$(git rev-parse --abbrev-ref HEAD)

# If we're on dev, release, or main, prevent direct commits
if [[ "$current_branch" == "dev" ]] || [[ "$current_branch" == "release" ]] || [[ "$current_branch" == "main" ]]; then
    echo "ERROR: Direct commits to '$current_branch' are not allowed."
    echo "Please create a feature branch from 'dev' and merge through the proper workflow:"
    echo "1. Create feature branch from 'dev'"
    echo "2. Merge feature branch into 'dev'"
    echo "3. Merge 'dev' into 'release'"
    echo "4. Merge 'release' into 'main'"
    exit 1
fi

# Check if feature branch was created from dev
if [[ "$current_branch" != "dev" ]] && [[ "$current_branch" != "release" ]] && [[ "$current_branch" != "main" ]]; then
    # Get the merge base with dev
    merge_base=$(git merge-base dev HEAD 2>/dev/null)
    
    if [ -z "$merge_base" ]; then
        echo "WARNING: Could not verify if branch was created from 'dev'"
        echo "Please ensure your feature branch was created from 'dev'"
    else
        # Check if the merge base is the same as dev's HEAD
        dev_head=$(git rev-parse dev 2>/dev/null)
        
        if [ "$merge_base" != "$dev_head" ] && [ -n "$dev_head" ]; then
            echo "WARNING: This branch may not have been created from the latest 'dev'"
            echo "Consider rebasing on 'dev' to ensure you have the latest changes"
        fi
    fi
fi
