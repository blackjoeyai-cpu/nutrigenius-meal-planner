# Next.js & Genkit Starter for Vercel

This is a Next.js starter project configured to use Genkit for AI-powered features and is set up for easy deployment to Vercel.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or later recommended)
- [npm](https://www.npmjs.com/)
- A Google Cloud project with the **Gemini API** and **Firebase** enabled. You can create one for free at the [Google Cloud console](https://console.cloud.google.com/).

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/your-repository.git
    cd your-repository
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

### Environment Variables

To run the application, you need to set up your environment variables. Create a file named `.env.local` in the root of your project and add the following variables:

```
# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

You can find these values in your Firebase project settings.

### Running the Application

1.  **Authenticate with Google Cloud (for local development):**

    To run the Genkit flows locally, you need to be authenticated with Google Cloud. Run the following command and follow the prompts:

    ```bash
    gcloud auth application-default login
    ```

2.  **Development server:**

    ```bash
    npm run dev
    ```

    This will start the Next.js development server. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

3.  **Genkit:**

    This project uses Genkit for AI features. To start the Genkit development server:

    ```bash
    npm run genkit:dev
    ```

    The Genkit UI will be available at [http://localhost:4000](http://localhost:4000) to inspect and run your flows.

## Branching Strategy

This project follows a strict branching strategy to ensure code quality, proper review processes, and controlled releases.

### Workflow Overview

```
feature/* → dev → release → main
```

1. **Feature branches** are created from `dev`
2. All merges require pull requests with code review and CI checks
3. `dev` is merged into `release` through a pull request after testing
4. `release` is merged into `main` through a pull request for production release

### Rules

1. All new branches must be created from `dev`
2. Only `release` branch can be merged into `main` (through PR)
3. Only `dev` branch can be merged into `release` (through PR)
4. All merges must go through pull requests with code review
5. Direct commits to any protected branch (`dev`, `release`, `main`) are prohibited
6. Direct pushes to any protected branch are prohibited

## Release Process

This project uses automated versioning that occurs only when merging from `dev` to `release`. When merging from `release` to `main`, the same version is used.

### Versioning Workflow

1. **Version Creation**: New versions are created only when merging from `dev` to `release`
2. **Version Format**: `v{major}.{minor}.{patch}` (e.g., `v1.2.3`)
3. **Version Bumping**:
   - Automatically determined by commit messages:
     - `feat`: Minor version bump
     - `fix`: Patch version bump
     - Default: Patch version bump
4. **Production Deployment**: When merging from `release` to `main`, the existing version is deployed

### Release Process

1. **Create a Pull Request** from `dev` to `release`
2. **Merge the Pull Request** - This will automatically:
   - Create a new version based on commit messages
   - Update `package.json` with the new version
   - Generate version information in `src/version.json`
   - Create a new Git tag
   - Create a GitHub release

3. **Create a Pull Request** from `release` to `main`
4. **Merge the Pull Request** - This will automatically:
   - Deploy the existing version to production
   - Use the same version that was created during the `dev` to `release` merge

The release process is fully automated through GitHub Actions and requires no manual intervention for version creation or deployment.

### Commit Message Format

For proper versioning, please follow the conventional commit format:

- `feat: Add new feature` (minor version bump)
- `fix: Fix bug` (patch version bump)
- `docs: Update documentation`
- `style: Code formatting changes`
- `refactor: Code refactoring`
- `test: Add or update tests`
- `chore: Maintenance tasks`

### Setup

Run the setup script to install the Git hooks that enforce these rules:

```bash
./scripts/setup-branching-rules.sh
```

## Deployment to Vercel

This project is configured for deployment to [Vercel](https://vercel.com/). The included CI/CD workflow will automatically deploy your application.

### Vercel Environment Variables

For the deployment to succeed and connect to your Google Cloud backend, you must add the following environment variables to your Vercel project settings:

1.  **Google Cloud Authentication:**
    - Create a Google Cloud Service Account with the **Vertex AI User** role in your Google Cloud project.
    - Create a JSON key for this service account and download it.
    - Copy the entire JSON content and add it as a Vercel environment variable named `GOOGLE_APPLICATION_CREDENTIALS_JSON`.

2.  **Vercel Integration:**
    - `VERCEL_TOKEN`: Your Vercel account token.
    - `VERCEL_ORG_ID`: The ID of your Vercel organization.
    - `VERCEL_PROJECT_ID`: The ID of your Vercel project.

3.  **Firebase Client Configuration:**
    - You must also add all the `NEXT_PUBLIC_FIREBASE_*` variables from your `.env.local` file to Vercel's environment variables.

## CI/CD Workflow

The `.github/workflows/ci-cd.yml` file contains the GitHub Actions workflow that automates testing and deployment. It includes jobs for:

- **Validation:** Linting, formatting checks, and conventional commit message validation.
- **Building:** Creating a production build of the Next.js application.
- **Deploying:** Pushing the build to Vercel for preview or production environments.
