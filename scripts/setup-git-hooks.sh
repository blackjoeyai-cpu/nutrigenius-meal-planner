#!/bin/bash

# Create the pre-commit hook
HOOKS_DIR="$(git rev-parse --git-path hooks)"
PRE_COMMIT_HOOK="$HOOKS_DIR/pre-commit"

# Create the hooks directory if it doesn't exist
mkdir -p "$HOOKS_DIR"

# Write the pre-commit hook
cat > "$PRE_COMMIT_HOOK" << 'EOF'
#!/bin/bash

# Generate version info before each commit
echo "Generating version info..."
node scripts/version.js

# Add the version file to the commit
git add src/version.json
EOF

# Make the hook executable
chmod +x "$PRE_COMMIT_HOOK"

echo "Git pre-commit hook installed successfully!"
echo "Version info will now be automatically generated before each commit."