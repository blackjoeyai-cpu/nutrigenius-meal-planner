# Branching Strategy

This project follows a strict branching strategy to ensure code quality and proper release management.

## Workflow Overview

```
feature/* → dev → release → main
```

1. **Feature branches** are created from `dev`
2. Feature branches are merged into `dev` after review
3. `dev` is merged into `release` after testing
4. `release` is merged into `main` for production release

## Branch Descriptions

- **main**: Production-ready code
- **release**: Release candidate code (stabilization branch)
- **dev**: Development branch (integration of features)
- **feature/\***: Individual feature branches

## Rules

1. All new branches must be created from `dev`
2. Only `release` branch can be merged into `main`
3. Only `dev` branch can be merged into `release`
4. Feature branches can only be merged into `dev`
5. Direct commits to `main`, `release`, and `dev` are prohibited

## Setup

Run the setup script to install the Git hooks that enforce these rules:

```bash
./scripts/setup-branching-rules.sh
```

## GitHub Actions

The repository uses GitHub Actions to enforce merging rules:

- PRs to `main` are only allowed from `release`
- PRs to `release` are only allowed from `dev`
- PRs to `dev` cannot come from `main` or `release`

## Creating a New Feature

1. Ensure you're on the latest `dev`:

   ```bash
   git checkout dev
   git pull origin dev
   ```

2. Create a new feature branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. After implementing your feature, push and create a PR to `dev`

## Merging Workflow

1. Feature branch → dev (after code review)
2. dev → release (after integration testing)
3. release → main (after release testing)
