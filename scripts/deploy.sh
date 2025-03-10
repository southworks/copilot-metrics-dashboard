#!/bin/bash
set -e

# User Input
projectId=""
region=""
database=""
ghTokenVaultName=""
ghToken=""
ghEnterprise=""
ghOrganization=""
funcNamePrefix=""
saName=""
dashboardServiceName=""
ghMetricsTeams='["team-copilot","team-copilot-2"]'
dashboardBUs='[{"Business unit 1": ["team-copilot"]}, {"Business unit 2": ["team-copilot", "team-copilot-2"]}]'

gcloud config set project $projectId

# Create db & indexes
gcloud firestore databases create --database=$database --location=$region
gcloud firestore indexes composite create --database=$database --collection-group=metrics_history --field-config=field-path="team_data,order=ascending" --field-config=field-path="date,order=ascending"

# Create secret
printf "$ghToken" | gcloud secrets create $ghTokenVaultName --data-file=-

# Create functions
cd ../src/backgroundGCP/DataIngestionGCP
rm -f env.yaml
touch env.yaml
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
echo "GITHUB_METRICS_TEAMS: '$ghMetricsTeams'" >> env.yaml

funcMetricsIngestionName="${funcNamePrefix}-metricsingestion"
funcSeatsIngestionName="${funcNamePrefix}-seatsingestion"

gcloud functions deploy $funcMetricsIngestionName --runtime dotnet8 --trigger-http --entry-point Microsoft.CopilotDashboard.DataIngestion.Functions.CopilotMetricsIngestion --region "$region" --env-vars-file env.yaml --set-secrets="GITHUB_TOKEN=$ghTokenVaultName:latest" --no-allow-unauthenticated
gcloud functions deploy $funcSeatsIngestionName --runtime dotnet8 --trigger-http --entry-point Microsoft.CopilotDashboard.DataIngestion.Functions.CopilotSeatsIngestion --region "$region" --env-vars-file env.yaml --set-secrets="GITHUB_TOKEN=$ghTokenVaultName:latest" --no-allow-unauthenticated

rm env.yaml

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
gcloud scheduler jobs create http $hourlyMetricsName --schedule="0 * * * *" --uri=$funcMetricsIngestionURL --http-method=GET --description="Invokes Metrics Ingestion API each hour to populate db" --location $region --oidc-service-account-email="$saName@$projectId.iam.gserviceaccount.com" --oidc-token-audience=$funcMetricsIngestionURL
gcloud scheduler jobs create http $hourlySeatsName --schedule="0 * * * *" --uri=$funcSeatsIngestionURL --http-method=GET --description="Invokes Metrics Ingestion API each hour to populate db" --location $region --oidc-service-account-email="$saName@$projectId.iam.gserviceaccount.com" --oidc-token-audience=$funcSeatsIngestionURL

# Create frontend SA
dashboardSa="${dashboardServiceName}-front-sa"
dashboardSaMember="$dashboardSa@$projectId.iam.gserviceaccount.com"

gcloud iam service-accounts create $dashboardSa --display-name "Geitost frontend service account" --description "SA needed to read db and pull images"
sleep 5

gcloud projects add-iam-policy-binding $projectId --member="serviceAccount:$dashboardSaMember" --role="roles/artifactregistry.reader"
gcloud projects add-iam-policy-binding $projectId --member="serviceAccount:$dashboardSaMember" --role="roles/artifactregistry.writer"
gcloud projects add-iam-policy-binding $projectId --member="serviceAccount:$dashboardSaMember" --role="roles/artifactregistry.createOnPushRepoAdmin"
gcloud projects add-iam-policy-binding $projectId --member="serviceAccount:$dashboardSaMember" --role="roles/firebase.viewer"
gcloud projects add-iam-policy-binding $projectId --member="serviceAccount:$dashboardSaMember" --role="roles/logging.logWriter"
gcloud projects add-iam-policy-binding $projectId --member="serviceAccount:$dashboardSaMember" --role="roles/storage.admin"

# Deploy frontend service
cd ../../dashboard
rm -f app.yaml
cat app.base.yaml >> app.yaml
echo "service: $dashboardServiceName" >> app.yaml
echo "" >> app.yaml
echo "env_variables:" >> app.yaml
echo "  NODE_ENV: production" >> app.yaml
echo "  GITHUB_TOKEN: $ghToken" >> app.yaml
echo "  GITHUB_ENTERPRISE: $ghEnterprise" >> app.yaml
echo "  GITHUB_ORGANIZATION: $ghOrganization" >> app.yaml
echo "  GITHUB_API_VERSION: \"2022-11-28\"" >> app.yaml
echo "  GITHUB_API_SCOPE: \"organization\"" >> app.yaml
echo "  FIREBASE_PROJECT_ID: $projectId" >> app.yaml
echo "  DATABASE_ID: $database" >> app.yaml
echo "  NEXT_PUBLIC_BUSINESS_UNITS: '$dashboardBUs'" >> app.yaml

gcloud app deploy --service-account="$dashboardSaMember" -q