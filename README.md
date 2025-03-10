# GitHub Copilot Metrics - Dashboard

1. [Introduction](#introduction)
2. [Deploy to Azure](#deploy-to-azure)
3. [Deploy to Google Cloud Platform](#deploy-to-google-cloud-platform)

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

## GA Metrics API
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
## Pre-requisites
1. Existing GCP Project with billing linked
    - If you have the project link the billing (ensure you have enough permission) See [Enable billing for a project](https://cloud.google.com/billing/docs/how-to/modify-project) guide for more info.
2. You'll need to enable the following API Services in GCP Console (For info on how to enable them see [Enabling an API](https://cloud.google.com/endpoints/docs/openapi/enable-api#enabling_an_api))
    - Cloud Loggin API
    - Cloud Monitoring API
    - Cloud Scheduler API
    - Cloud Functions API
    - Artifact Registry API
    - Secret Manager API
    - Compute Engine API
    - Cloud Firestore API
    - Cloud Run Admin API
    - Cloud Build API
    - Identity and Access Management (IAM) API
3. Create App Engine follow the next guid [Create App Engine Project](https://cloud.google.com/appengine/docs/standard/nodejs/building-app/creating-project)
> ![IMPORTANT]
>
> After you create your App Engine app, you cannot change the region.

## Google Cloud CLI
You must have `gcloud` CLI follow the official [Google CLI Install Docs](https://cloud.google.com/sdk/docs/install#linux)

> ![TIP]
>
> If you're using linux
> Once you've downloaded the `.tar.gz` file
> Ensure it is in your home folder `~/`
> extract it with `tar -xvf` official docs don't add `-v` flag but it is useful
> then follow the steps as it

## Complete env
In [deploy.sh](scripts/deploy.sh) update the variables with your values:
```bash
projectId=""
region=""
database=""
ghTokenVaultName=""
ghToken=""
ghEnterprise=""
ghOrganization=""
funcNamePrefix=""
saName=""
ghMetricsTeams='["team-copilot","team-copilot-2"]'
```
*ghMetricsTeam must exists otherwise it will fail during runtime see [GA Metrics API](#ga-metrics-api)*

## Deploy
```bash
gcloud auth login
./scripts/deploy.sh
```

*See [What does deploy.sh do](scripts/README.md) for more details about each step*

## Deploy dashboard to App Engine

To deploy the frontend dashboard, follow [these steps](/src/dashboard/README.md#deploying-the-dashboard-on-google-cloud-platform-app-engine).

# How to create a GitHub PAT (Personal access token)
1. Go to the following link: https://github.com/settings/personal-access-tokens (Fine-grained tokens)
2. Click on "Generate new token" button
3. Set token name to "GH Copilot Dashboard"
4. Resource owner should be the desired organization
5. Set expiration as desired
6. Description should be "PAT token for GitHub Copilot Microsoft Metrics Dashboard"
7. "Repository access" should be set to "Public Repositories (read-only)"
8. On the "Permissions" area add the "Read-only" permission for Administration and the same for GitHub Copilot Business.

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
