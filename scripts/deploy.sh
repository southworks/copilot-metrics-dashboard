#!/bin/bash
set -e

# User Input
projectId=""
region=""
timezone=""
database=""
secretName=""
ghToken=""
ghEnterprise=""
ghOrganization=""
funcMetricsIngestionName=""
funcSeatsIngestionName=""
saName=""

# Generated
funcMetricsIngestionURL=""
funcSeatsIngestionURL=""

read -p "Project ID: " projectId
read -p "Region: " region
read -p "Timezone: " timezone
read -p "Database name: " database
read -p "Secret name: " secretName
read -sp "GH Token: " ghToken
echo
read -p "GH Enterprise name: " ghEnterprise
read -p "GH Organization name: " ghOrganization
read -p "Metrics Ingestion display name: " funcMetricsIngestionName
read -p "Seats Ingestion display name: " funcSeatsIngestionName
read -p "Service account name: " saName

gcloud config set project $projectId

# Create db & indexes
gcloud firestore databases create --database=$database --location=$region
gcloud firestore indexes composite create --database=$database --collection-group=metrics_history --field-config=field-path="team_data,order=ascending" --field-config=field-path="date,order=ascending"

# Create secret
printf "$ghToken" | gcloud secrets create $secretName --data-file=-

# Create functions
cd ../src/backgroundGCP/DataIngestionGCP

echo "" >> env.yaml
echo "PROJECT_ID: $projectId" >> env.yaml
echo "DATABASE_ID: $database" >> env.yaml
echo "GITHUB_ENTERPRISE: $ghEnterprise" >> env.yaml
echo "GITHUB_ORGANIZATION: $ghOrganization" >> env.yaml
echo "METRICS_HISTORY_FIRESTORE_COLLECTION_NAME: \"metrics_history\"" >> env.yaml
echo "SEATS_HISTORY_FIRESTORE_COLLECTION_NAME: \"seats_history\"" >> env.yaml
echo "LOG_EXECUTION_ID: \"true\"" >> env.yaml
echo "USE_LOCAL_SETTINGS: \"false\"" >> env.yaml
echo "GITHUB_API_SCOPE: \"organization\"" >> env.yaml
echo "ENABLE_SEATS_INGESTION: \"true\"" >> env.yaml
echo "GITHUB_API_VERSION: \"2022-11-28\"" >> env.yaml

gcloud functions deploy $funcMetricsIngestionName --runtime dotnet8 --trigger-http --entry-point Microsoft.CopilotDashboard.DataIngestion.Functions.CopilotMetricsIngestion --region "$region" --env-vars-file env.yaml --set-secrets="GITHUB_TOKEN=$secretName:latest"
gcloud functions deploy $funcSeatsIngestionName --runtime dotnet8 --trigger-http --entry-point Microsoft.CopilotDashboard.DataIngestion.Functions.CopilotSeatsIngestion --region "$region" --env-vars-file env.yaml --set-secrets="GITHUB_TOKEN=$secretName:latest"

# Get auto-generated urls
funcMetricsIngestionURL=$(gcloud functions describe $funcMetricsIngestionName --region $region --project $projectId --format="value(url)")
funcSeatsIngestionURL=$(gcloud functions describe $funcSeatsIngestionName --region $region --project $projectId --format="value(url)")

# Create Service account
gcloud iam service-accounts create $saName --display-name "Geitost invoker service account" --description "SA for schedulers to invoke functions securely"
sleep 5
gcloud projects add-iam-policy-binding $projectId --member "serviceAccount:$saName@$projectId.iam.gserviceaccount.com" --role "roles/run.invoker"

# Create schedulers
hourlyMetricsName="hourly-$funcMetricsIngestionName"
hourlySeatsName="hourly-$funcSeatsIngestionName"
gcloud scheduler jobs create http $hourlyMetricsName --schedule="0 * * * *" --uri=$funcMetricsIngestionURL --http-method=GET --time-zone=$timezone --description="Invokes Metrics Ingestion API each hour to populate db" --location $region --oidc-service-account-email="$saName@$projectId.iam.gserviceaccount.com" --oidc-token-audience=$funcMetricsIngestionURL
gcloud scheduler jobs create http $hourlySeatsName --schedule="0 * * * *" --uri=$funcSeatsIngestionURL --http-method=GET --time-zone=$timezone --description="Invokes Metrics Ingestion API each hour to populate db" --location $region --oidc-service-account-email="$saName@$projectId.iam.gserviceaccount.com" --oidc-token-audience=$funcSeatsIngestionURL