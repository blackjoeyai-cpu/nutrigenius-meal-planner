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
