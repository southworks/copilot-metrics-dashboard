This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploying a Webapp on Google Cloud Platform (App Engine)

This guide provides step-by-step instructions for deploying a web application to Google Cloud App Engine using a Docker image.

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
  GITHUB_ENTERPRISE: 'southworks'
  GITHUB_ORGANIZATION: 'southworks'
  GITHUB_TOKEN: ''
  GITHUB_API_VERSION: '2022-11-28'
  GITHUB_API_SCOPE: 'organization'
  FIREBASE_API_KEY: ''
  FIREBASE_AUTH_DOMAIN: ''
  FIREBASE_PROJECT_ID: ''
  FIREBASE_STORAGE_BUCKET: ''
  FIREBASE_MESSAGING_SENDER_ID: ''
  FIREBASE_APP_ID: ''
```
2. Set Up Your GCP Project, create a GCP project, ensure you have an active Google Cloud Platform project with billing enabled.

    * Enable required APIs: App Engine API, Cloud Build API

    * Install and configure the Google Cloud CLI: Run "gcloud init" to configure the CLI with your account and project.

3. Configure App Engine in the Google Cloud Console

    * Choose a region: Go to the App Engine page in the Google Cloud Console and select a region for your App Engine instances.

4. Deploy the Application

    * Prepare your project directory: Ensure that both the Dockerfile and app.yaml are located in the root directory of your web application (at the same level as the package.json).

    * Deploy the app: Run the following command in the root directory of your project: "gcloud app deploy" This command will deploy your application to App Engine using the configuration specified in app.yaml and your Dockerfile.

## How to obtain Firestore credentials

1. Go to the Firebase Console: Open your web browser and navigate to [Firebase Console](https://console.firebase.google.com/).
1. Create a New Project: If you don't have a project yet, click on "Add project" and follow the prompts to create a new Firebase project.
1. Navigate to Project Settings: Once your project is created, click on the gear icon next to "Project Overview" in the left sidebar and select "Project settings".
1. Get the API Key: In the "General" tab, scroll down to the "Your apps" section. If you haven't added an app yet, click on the "Add app" button and follow the prompts to register your app (e.g., Web, iOS, Android). After registering your app, you will see the Firebase SDK configuration, which includes the API key.
1. Copy the API Key: The API key will be listed in the configuration snippet. It looks something like this:
```json
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};
```
6. Add the values to the .env file.

## Configuring settings when running the frontend in a container

For configuring the frontend settings there are two alternatives:

1. Create an .env file and include it in the Docker image. This means that the .env file must be created before the image is built.
1. Add the settings as environment variables of the Container App or Google container.
