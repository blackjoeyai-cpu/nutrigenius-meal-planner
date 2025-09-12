# Using the Branching Workflow

This document explains how to use the branching workflow that has been implemented in this project.

## Workflow Overview

The project follows a strict branching strategy:

```
feature/* → dev → release → main
```

1. **Feature branches** are created from `dev`
2. Feature branches are merged into `dev` after review
3. `dev` is merged into `release` after testing
4. `release` is merged into `main` for production release

## Creating a New Feature

To create a new feature, use the helper script:

```bash
./scripts/create-feature-branch.sh my-feature-name
```

This script will:
1. Switch to the `dev` branch
2. Pull the latest changes from `origin/dev`
3. Create a new branch named `feature/my-feature-name`

## Working on a Feature

1. Make your changes in the feature branch
2. Commit your changes (the pre-commit hook will ensure you're not on a protected branch)
3. Push your branch to GitHub:
   ```bash
   git push origin feature/my-feature-name
   ```
4. Create a Pull Request on GitHub to merge your feature branch into `dev`

## Merging Workflow

Use the merge workflow helper script to guide you through the proper merge sequence:

```bash
./scripts/merge-workflow.sh
```

Select the appropriate option:
1. Merge feature branch into `dev`
2. Merge `dev` into `release`
3. Merge `release` into `main`

## Protected Branches

The following branches are protected and cannot be committed to directly:
- `main` - Production code
- `release` - Release candidate code
- `dev` - Development integration branch

Attempting to commit directly to these branches will be blocked by the pre-commit hook.

## GitHub Actions Enforcement

The GitHub Actions workflow in `.github/workflows/branch-protection.yml` enforces merge rules at the PR level:
- Only `release` can be merged into `main`
- Only `dev` can be merged into `release`
- `main` and `release` cannot be merged into `dev`

## Troubleshooting

### If the pre-commit hook is not working

Run the setup script to reinstall the hooks:

```bash
./scripts/setup-branching-rules.sh
```

### If you accidentally commit to a protected branch locally

1. Reset the commit:
   ```bash
   git reset HEAD~1
   ```
2. Create a proper feature branch:
   ```bash
   ./scripts/create-feature-branch.sh my-feature-name
   ```
3. Add your changes and commit them on the feature branch

### If you need to update your feature branch with the latest changes from `dev`

1. Switch to your feature branch:
   ```bash
   git checkout feature/my-feature-name
   ```
2. Rebase on `dev`:
   ```bash
   git rebase dev
   ```
   or merge `dev`:
   ```bash
   git merge dev
   ```

## Best Practices

1. Always create feature branches from the latest `dev`
2. Keep feature branches small and focused on a single feature
3. Regularly sync your feature branch with `dev` to avoid large merge conflicts
4. Write clear, descriptive commit messages
5. Follow the established PR template when creating pull requests
6. Ensure all tests pass before merging