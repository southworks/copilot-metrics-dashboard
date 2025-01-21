This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

# Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

# Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

# Deploying the Dashboard on Google Cloud Platform (App Engine)

This guide provides step-by-step instructions for deploying the dashboard to Google Cloud App Engine using a Docker image.

1. Create the app.yaml 

    * The app.yaml file is required for configuring the App Engine deployment. This file specifies the type of App Engine instance to use and provides settings for runtime, scaling, resources, and environment variables. When deploying a Docker image, set the runtime to custom and the environment to flex.

Below is an example app.yaml configuration:
```
runtime: custom
env: flex
automatic_scaling:
  cpu_utilization:
    target_utilization: 0.85
  min_num_instances: 1
  max_num_instances: 10
  max_idle_instances: 1
  cool_down_period_sec: 180
resources:
  cpu: 1
  memory_gb: 1
  disk_size_gb: 10
env_variables:
  NODE_ENV: 'production'
  GITHUB_ENTERPRISE: 'your-enterprise-name'
  GITHUB_ORGANIZATION: 'your-organization-name'
  GITHUB_TOKEN: ''
  GITHUB_API_VERSION: '2022-11-28'
  GITHUB_API_SCOPE: 'organization'
  FIREBASE_PROJECT_ID: ''
  DATABASE_ID: ''
```
2. Set Up Your GCP Project, create a GCP project, ensure you have an active Google Cloud Platform project with billing enabled.

    * Enable Cloud Build API:
      * Go to the [Google Cloud Console](https://console.cloud.google.com/)
      * In the top navigation bar, click on the project dropdown and select the project where you want to enable the API.
      * In the left-hand navigation menu, go to APIs & Services > Library.
      * In the API Library, use the search bar to search for "Cloud Build API".
      * Click on the "Cloud Build API" from the search results.
      * Click the "Enable" button to enable the API for your project.

    * Install and configure the Google Cloud CLI: 
      * Go to the [Google Cloud SDK download page](https://cloud.google.com/sdk/docs/install)
      * Download the installer and run it.
      * To initialize the SDK, open a command prompt window and run 'gcloud init'
      * Follow the prompts to authenticate and configure the SDK.

3. Configure App Engine in the Google Cloud Console

    * Choose a region: Go to the App Engine page in the Google Cloud Console and select a region for your App Engine instances.

4. Configure Firebase auth to authenticate the client SDK in the WebApp
    * The WebApp Next.Js server authenticates with firestore through an anonymous sign in, to enable this you should go to "https://console.firebase.google.com/u/2/project/{project}/authentication/providers" and enable the anonymous provider

5. Deploy the Application

    * Prepare your project directory: Ensure that both the Dockerfile and app.yaml are located in the root directory of your web application (at the same level as the package.json).

    * Add to the App Engine Service account the following roles: Artifact Registry Create-on-Push Repository Administrator, Artifact Registry Reader/Writer, Logs Writer, Firebase Viewer and Storage Admin:
    * Go to the [Google Cloud Console](https://console.cloud.google.com/).
    * In the top navigation bar, click on the project dropdown and select the project where your App Engine service is located.
    * In the left-hand navigation menu, go to IAM & Admin > IAM. Or search IAM in the top search bar.
    * In the IAM page, find the service account associated with your App Engine. It typically has the format YOUR_PROJECT_ID@appspot.gserviceaccount.com.
    * Click the pencil icon (Edit) next to the service account to edit its permissions.
    * In the "Edit permissions" panel, click on Add another role.
    * Use the search bar to find and add the following roles one by one:
      * Artifact Registry Create-on-Push Repository Administrator
      * Artifact Registry Reader
      * Artifact Registry Writer
      * Logs Writer
      * Firebase Viewer
      * Storage Admin
    * After adding all the required roles, click Save to apply the changes.

    * Deploy the app: Run the following command in the src/dashboard directory where the app.yaml file is located: "gcloud app deploy" This command will deploy your application to App Engine using the configuration specified in app.yaml and your Dockerfile.

6. Enable IAP for authentication
    * In the Google Cloud Console (web portal) it's necessary to enable the Identity-Aware Proxy for the project and then enable it for the App Engine, the first time IAP is going to ask to configure the OAuth consent page, with this done it allows control for what users are able to pass the auth process with no need for code changes, to authorize a user you should add a principal to the App Engine from the IAP console page, the principal is the user mail and the necessary role is "IAP-secured Web App User".
    * To enable Identity-Aware Proxy:
      * Go to the [Google Cloud Console](https://console.cloud.google.com/) and search for Identity-Aware Proxy in the top search bar or in the left-hand navigation menu, go to Security > Identity-Aware Proxy.
      * If IAP is not already enabled, you will see a prompt to enable it. Click on Enable IAP.
      * In the IAP page, you will see a list of resources. Find your App Engine application in the list.
      * Click on the IAP toggle switch next to your App Engine application to enable IAP for it.

# Configuring settings when running the frontend in a container

For configuring the frontend settings there are two alternatives:

1. Create an .env file and include it in the Docker image. This means that the .env file must be created before the image is built.
2. Add the settings as environment variables of the Container App or Google container.
