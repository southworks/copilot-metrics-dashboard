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

# How to create the GitHub PAT (Personal access token)
    1. Go to the following link: https://github.com/settings/personal-access-tokens (Fine-grained tokens)
    2. Click on "Generate new token" button
    3. Set token name to "GH Copilot Dashboard"
    4. Resource owner should be the desired organization
    5. Set expiration as desired
    6. Description should be "PAT token for GitHub Copilot Microsoft Metrics Dashboard"
    7. "Repository access" should be set to "Public Repositories (read-only)"
    8. On the "Permissions" area add the "Read-only" permission for the organization and the same for GitHub Copilot Business.

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
  FIREBASE_PROJECT_ID: ''
  DATABASE_ID: ''
```
2. Set Up Your GCP Project, create a GCP project, ensure you have an active Google Cloud Platform project with billing enabled.

    * Enable required APIs: App Engine API, Cloud Build API

    * Install and configure the Google Cloud CLI: Run "gcloud init" to configure the CLI with your account and project.

3. Configure App Engine in the Google Cloud Console

    * Choose a region: Go to the App Engine page in the Google Cloud Console and select a region for your App Engine instances.

4. Configure Firebase auth to authenticate the client SDK in the WebApp
    * The WebApp Next.Js server authenticates with firestore through an anonymous sign in, to enable this you should go to "https://console.firebase.google.com/u/2/project/{project}/authentication/providers" and enable the anonymous provider

5. Deploy the Application

    * Prepare your project directory: Ensure that both the Dockerfile and app.yaml are located in the root directory of your web application (at the same level as the package.json).

    * Add to the App Engine Service account the following roles: Artifact Registry Create-on-Push Repository Administrator, Artifact Registry Reader/Writer, Logs Writer, Firebase Viewer and Storage Admin

    * Deploy the app: Run the following command in the root directory of your project: "gcloud app deploy" This command will deploy your application to App Engine using the configuration specified in app.yaml and your Dockerfile.

6. Enable IAP for authentication
    * In the Google Cloud Console (web portal) it's necessary to enable the Identity-Aware Proxy for the project and then enable it for the App Engine, the first time IAP is going to ask to configure the OAuth consent page, with this done we can control what users are able to pass the auth process with no need for code changes, to authorize an user you should add a principal to the App Engine from the IAP console page, the principal is the user mail and the necessary role is "IAP-secured Web App User".

## Deploy to Google Cloud Platform

The deployment in GCP requires Firestore database, Cloud Run Functions and App Engine services.

## Configuring Firestore

1. While in the Google Cloud console, search for Firestore service.
1. Go to create database.
1. Create the database and copy the id since it will be used for configuring other services.
1. In the left panel go to Indexes.
1. In the Composite tab, click create index.
1. In the form that will appear, set the following. 
    1. Collection: 'metrics_history'
    1. Add field: 'team_data', ascending.
    1. Add field: 'date', ascending
    1. Add field: '\__name\_\_' ascending
    1. Query scope: collection
1. Click create

## Configuring Cloud Run Functions

Before following the steps, clone this repository.
Currently there are four C# functions:
- Microsoft.CopilotDashboard.DataIngestion.Functions.CopilotDataIngestion
- Microsoft.CopilotDashboard.DataIngestion.Functions.CopilotMetricsIngestion
- Microsoft.CopilotDashboard.DataIngestion.Functions.CopilotSeatsIngestion
- Microsoft.CopilotDashboard.DataIngestion.Functions.GetCopilotSeatsByDate

And there will be one Google Cloud Run Function instance per C# function.
1. While in the Google Cloud console, search for Cloud Run Functions.
1. Go to create function.
1. Add a name for the function and make sur the trigger type is HTTPS.
1. Under runtime variables, add the following:
    - GITHUB_API_SCOPE: organization
    - HISTORY_FIRESTORE_COLLECTION_NAME:history
    - USE_METRICS_API: true
    - METRICS_HISTORY_FIRESTORE_COLLECTION_NAME: metrics_history
    - GITHUB_TOKEN: {github_token}*
    - ENABLE_SEATS_INGESTION: true
    - GITHUB_ENTERPRISE: {enterprise_name}
    - GITHUB_ORGANIZATION: {organization_name}
    - SEATS_HISTORY_FIRESTORE_COLLECTION_NAME: seats_history
    - PROJECT_ID: {google_project_id} 
    - DATABASE_ID: {firestore_database_id}
    - GITHUB_API_VERSION: 2022-11-28
    - API_KEY: {api_key}*
    - USE_LOCAL_SETTINGS: false
    - GITHUB_METRICS_TEAMS: "[\"{gh-team-name}\", \"{gh-team-2-name}\"]"**
1. Click next to go to the Code section.
1. Under Runtime selection .NET 8.
1. Under Entry Point add the name of the function to deploy. It can be copied from the list above.
1. Under Source code select ZIP upload.
1. In you local environment, create a zip file with the code of the project DataIngestionGCP
1. In Destination bucket choose a bucket to store the zip file.
1. Select the zip file in your local environment.
1. Click deploy

For the rest of the functions, follow these steps:
1. Click copy at the top of the function dashboard. This will navigate to the create function wizard with all fields pre-configured with the same values as the previously deployed functio.
1. Change the name to the one that will be deployed, for example CopilotMetricsIngestion.
1. Click next in at the bottom of the configuration step.
1. Under Entry Point change the name of the function to the one that will be deployed. It can be copied from the list above.
1. Click deploy.

*For the GitHub token and API Key, a secret can be added in the secret manager and referenced in the security and image repo tab. The API key value is arbitrary and can be a GUID for example.

**This setting is optional. Set this if you want to have data separated by teams in the Metrics Dashboard site.

### Configuring schedule jobs

The CopilotDataIngestion, CopilotMetricsIngestion and CopilotSeatsIngestion functions run on a schedule, to configure the schedule job, follow these steps:

1. Go to Google Cloud Console: Open your web browser and navigate to the Google Cloud Console.
1. Select Your Project: Ensure you have selected the correct Google Cloud project where your Cloud Run function is deployed.
1. Enable Cloud Scheduler API: If you haven't already, enable the Cloud Scheduler API for your project:
1. Go to the [Cloud Scheduler API page](https://console.cloud.google.com/apis/library/cloudscheduler.googleapis.com).
1. Click "Enable".
1. Navigate to Cloud Scheduler: In the left sidebar, navigate to "Cloud Scheduler" under the "Tools" section.

Create a New Job:

Click on the "Create job" button.

**Configure the Job**:
- Name: Enter a name for your job.
- Description: Optionally, enter a description for your job.
- Frequency: Enter the cron expression for every hour: 0 * * * *.
- Timezone: Select the appropriate timezone for your schedule.

**Configure the Target**:
- Target Type: Select "HTTP".
- URL: Enter the URL of the Cloud Run function. It should look - something like https://<region>-<project-id>.cloudfunctions.net/- <function-name>. It can be copied from the function dashboard.
- HTTP Method: select GET.

**Add Authentication**:

- Auth Header: Select "Add OIDC token".
- Service Account: Select the service account that has the necessary permissions to invoke the Cloud Run function.

**Create the Job**:
Click the "Create" button to save and create your scheduled job.

**Example Configuration**
- Name: CopilotMetricsIngestion-job
- Description: Runs every hour to trigger CopilotMetricsIngestion function
- Frequency: 0 * * * *
- Timezone: UTC
- Target Type: HTTP
- URL: https://<region>-<project-id>.cloudfunctions.net/- <function-name>
- HTTP Method: GET
- Auth Header: Add OIDC token
- Service Account: your-service-account@your-project-id.iam.gserviceaccount.com

## Configuring settings when running the frontend in a container

For configuring the frontend settings there are two alternatives:

1. Create an .env file and include it in the Docker image. This means that the .env file must be created before the image is built.
2. Add the settings as environment variables of the Container App or Google container.
