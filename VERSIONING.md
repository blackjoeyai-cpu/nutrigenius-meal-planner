# Application Versioning

This project uses git-based versioning to automatically generate version information based on git tags and commit history.

## How it works

1. The version is generated from the latest git tag using `git describe`
2. If no tags exist, it falls back to commit hash
3. Version information is stored in `src/version.json`
4. The version is automatically updated:
   - Before each commit (via git pre-commit hook)
   - During development server startup
   - During build process
   - Automatically via GitHub Actions

## Version Information

The generated version includes:

- `version`: The current version (from git tags or commit hash)
- `commitHash`: The current commit hash
- `branch`: The current git branch
- `isDirty`: Whether there are uncommitted changes
- `buildTime`: When the version was generated

## Using in Components

Import and use the `VersionDisplay` component:

```tsx
import VersionDisplay from '@/components/version-display';

export default function MyComponent() {
  return <VersionDisplay className="text-sm" />;
}
```

## Manual Usage

To manually generate version information:

```bash
npm run version
```

## Tagging for Releases

To create a new version tag manually:

```bash
git tag -a v1.2.3 -m "Release version 1.2.3"
git push origin v1.2.3
```

The version generation will automatically use the latest tag in subsequent builds.

## GitHub Actions Versioning

This project also includes GitHub Actions workflows for automated version management:

1. **Version Management Workflow** (`versioning.yml`):
   - Automatically creates new version tags based on conventional commits
   - Generates semantic version bumps (major, minor, patch) based on commit types
   - Creates GitHub releases with version information
   - Updates pull requests with version information

2. **Automatic Version Bumping**:
   - `feat` commits trigger minor version bumps
   - `fix` commits trigger patch version bumps
   - Other commits default to patch bumps

3. **Release Process**:
   - When code is pushed to `main` or `release/*` branches, the workflow:
     - Determines the next version based on commit history
     - Creates a new git tag with the version
     - Updates `package.json` with the new version
     - Creates a GitHub release with version details
