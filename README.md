# GitHub Copilot Metrics - Dashboard

1. [Introduction](#introduction)
2. [Deploy to Azure](#deploy-to-azure)

# Introduction

The GitHub Copilot Metrics Dashboard is a solution accelerator designed to visualize metrics from GitHub Copilot using the [GitHub Copilot Metrics API](https://docs.github.com/en/rest/copilot/copilot-usage?apiVersion=2022-11-28) and [GitHub Copilot User Management API](https://docs.github.com/en/rest/copilot/copilot-user-management?apiVersion=2022-11-28).

## Dashboard

![GitHub Copilot Metrics - Dashboard](/docs/dashboard.jpeg "GitHub Copilot Metrics - Dashboard")

The dashboard showcases a range of features:

**Filters:**
Ability to filter metrics by date range, languages, code editors and visualise data by time frame (daily, weekly, monthly).

**Acceptance Average:** Percentage of suggestions accepted by users for given date range and group by time range (daily, weekly, monthly).

**Active Users:** Number of active users for the last cycle.

**Adoption Rate:** Number of active users who are using GitHub Copilot in relation to the total number of licensed users.

**Seat Information:** Number of active, inactive, and total users.

**Language:** Breakdown of languages which can be used to filter the data.

**Code Editors:** Breakdown of code editors which can be used to filter the data.

## Seats

Seats feature shows the list of user having a Copilot licence assigned.
This feature is can be enabled or disabled by setting the `ENABLE_SEATS_FEATURE` environment variable to `true` or `false` respectively (default value is `true`).

> Assigned seats ingestion is enabled by default, is possbile to disable by setting the `ENABLE_SEATS_INGESTION` environment variable to `false`

# Deploy to Azure

The solution accelerator is a web application that uses Azure App Service, Azure Functions, Azure Cosmos DB, Azure Storage and Azure Key Vault. The deployment template will automatically populate the required environment variables in Azure Key Vault and configure the application settings in Azure App Service and Azure Functions.
![GitHub Copilot Metrics - Architecture ](/docs/CopilotDashboard.png "GitHub Copilot Metrics - Architecture")

The following steps will automatically provision Azure resources and deploy the solution accelerator to Azure App Service and Azure Functions using the Azure Developer CLI.

> [!IMPORTANT]
> 🚨🚨🚨 You must setup [authentication](https://learn.microsoft.com/en-us/azure/app-service/overview-authentication-authorization) using the built-in authentication and authorization capabilities of Azure App Service.

#### Prerequisites

You will be prompted to provide the following information:

```
- GitHub Enterprise name
- GitHub Organization name
- GitHub Token
- GitHub API Scope
- Use Metrics API (beta - will use the GA Metrics API) )
- Team Names (if you choose to use the new metrics API)
```

> More details here for the [GA Metrics API](https://github.blog/changelog/2024-10-30-github-copilot-metrics-api-ga-release-now-available/)

> Team Names must be a valid JSON array, e.g. ``["team-1", "team-2]``

GitHub API Scope define the GITHUB_API_SCOPE environment variable that can be "enterprise" or "organization". It is used to define at which level the GitHub APIs will gather data. If not specified, the default value is "organization".

1. Download the [Azure Developer CLI](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/overview)
2. If you have not cloned this repo, run `azd init -t microsoft/copilot-metrics-dashboard`. If you have cloned this repo, just run 'azd init' from the repo root directory.
3. Run `azd up` to provision and deploy the application

```pwsh
azd init -t microsoft/copilot-metrics-dashboard
azd up

# if you are wanting to see logs run with debug flag
azd up --debug
```

# Deploy to Google Cloud Platform

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
    - GITHUB_METRICS_TEAMS: ["{gh-team-name}", "{gh-team-2-name}"]**
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

# Contributing

This project welcomes contributions and suggestions. Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

# Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft
trademarks or logos is subject to and must follow
[Microsoft&#39;s Trademark &amp; Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.
