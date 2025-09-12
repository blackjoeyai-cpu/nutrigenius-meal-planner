#!/bin/bash

# Setup script for branching workflow rules
# This script sets up Git hooks to enforce branching rules

HOOKS_DIR=".git/hooks"
SCRIPTS_DIR="scripts"

# Create scripts directory if it doesn't exist
mkdir -p "$SCRIPTS_DIR"

# Create a pre-commit hook to check branch naming
cat > "$SCRIPTS_DIR/check-branch-source.sh" << 'EOF'
#!/bin/bash

# Check if current branch is release, main, or dev
current_branch=$(git rev-parse --abbrev-ref HEAD)

# If we're on release, main, or dev, prevent direct commits
if [[ "$current_branch" == "release" ]] || [[ "$current_branch" == "main" ]] || [[ "$current_branch" == "dev" ]]; then
    echo "ERROR: Direct commits to '$current_branch' are not allowed."
    echo "Please create a feature branch and merge through a pull request:"
    echo "1. Create feature branch from 'dev'"
    echo "2. Create PR to merge feature branch into 'dev'"
    echo "3. Create PR from 'dev' to 'release'"
    echo "4. Create PR from 'release' to 'main'"
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
EOF

# Make the script executable
chmod +x "$SCRIPTS_DIR/check-branch-source.sh"

# Create pre-commit hook
cat > "$HOOKS_DIR/pre-commit" << 'EOF'
#!/bin/bash

# Run branch source check
./scripts/check-branch-source.sh
EOF

# Make the hook executable
chmod +x "$HOOKS_DIR/pre-commit"

# Create pre-push hook to prevent direct pushes to protected branches
cat > "$HOOKS_DIR/pre-push" << 'EOF'
#!/bin/bash

# Prevent direct pushes to protected branches
protected_branches="main release dev"
current_branch=$(git rev-parse --abbrev-ref HEAD)

for protected in $protected_branches; do
    if [[ "$current_branch" == "$protected" ]]; then
        echo "ERROR: Direct pushes to '$protected' branch are not allowed."
        echo "All changes must go through pull requests with required checks."
        exit 1
    fi
done
EOF

# Make the pre-push hook executable
chmod +x "$HOOKS_DIR/pre-push"

echo "Branching rules setup complete!"
echo ""
echo "Workflow rules:"
echo "1. All feature branches must be created from 'dev'"
echo "2. All merges must go through pull requests"
echo "3. Create PR from 'dev' to 'release' after testing"
echo "4. Create PR from 'release' to 'main' for production"
echo ""
echo "Direct commits and pushes to all protected branches are now prevented."