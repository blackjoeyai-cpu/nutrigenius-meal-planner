# GitHub Branch Protection Setup

This document explains how to set up branch protection rules in GitHub to enforce the branching strategy.

## Required Branch Protection Rules

To fully enforce the branching strategy, you need to set up branch protection rules in your GitHub repository settings.

### 1. Protect the `main` branch

1. Go to your repository's **Settings**
2. Click on **Branches** in the left sidebar
3. Click **Add rule** next to "Branch protection rules"
4. In the "Branch name pattern" field, enter `main`
5. Enable the following options:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
     - Add the "validate-branch-source" check from the branch-protection workflow
   - ✅ Require branches to be up to date before merging
   - ✅ Require linear history
   - ✅ Include administrators (recommended)
6. Click **Create**

### 2. Protect the `release` branch

1. Click **Add rule** again
2. In the "Branch name pattern" field, enter `release`
3. Enable the following options:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
     - Add the "validate-branch-source" check from the branch-protection workflow
   - ✅ Require branches to be up to date before merging
   - ✅ Require linear history
   - ✅ Include administrators (recommended)
4. Click **Create**

### 3. Protect the `dev` branch

1. Click **Add rule** again
2. In the "Branch name pattern" field, enter `dev`
3. Enable the following options:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
     - Add the "validate-branch-source" check from the branch-protection workflow
   - ✅ Require branches to be up to date before merging
   - ✅ Require linear history
   - ✅ Include administrators (recommended)
4. Click **Create**

## Verification

After setting up these protection rules, the GitHub Actions workflow will automatically enforce the branching strategy:

1. Only PRs from `release` to `main` will be allowed
2. Only PRs from `dev` to `release` will be allowed
3. PRs to `dev` cannot come from `main` or `release`

## Additional Recommendations

1. **Require signed commits**: For better security, consider requiring signed commits
2. **Dismiss stale pull request approvals**: Automatically dismiss approvals when new commits are pushed
3. **Require conversation resolution**: Require all conversations to be resolved before merging

These settings ensure that your branching strategy is enforced both by GitHub Actions workflows and by GitHub's native branch protection features.