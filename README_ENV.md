# Environment Variables Setup

To ensure sensitive information is not committed to the repository, we use environment variables that are excluded from git tracking.

## Setup Instructions

1. Copy the `.env.example` file to create your own `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Fill in the values in `.env` with your actual credentials:
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `NEXT_PUBLIC_FIREBASE_*`: Your Firebase project configuration
   - `GITHUB_PAT`: Your GitHub Personal Access Token (if needed)

## Security Notes

- Never commit your `.env` file to the repository
- The `.gitignore` file is configured to exclude `.env` files
- Always use the `.env.example` file as a template for required variables
- When adding new environment variables, update `.env.example` but never add actual values to it