# What does deploy.sh do

## Create Firestore DB
1. Create db

```bash
gcloud firestore databases create --database={db_name} --location={region}
```
region: __us-central1__

2. Create index

```bash
gcloud firestore indexes composite create --database={db_name} --collection-group=metrics_history --field-config=field-path="team_data,order=ascending" --field-config=field-path="date,order=ascending" --field-config=field-path="name,order=ascending"
```

## Create GH secret
### Windows
```bash
$secret = "s3cr3t"
$secret | Set-Content -NoNewline -Path secret.txt
gcloud secrets create {gh-secret} --data-file=secret.txt
rm secret.txt
```
### Linux
```bash
printf "s3cr3t" | gcloud secrets create {gh-secret} --data-file=-
```

## Create functions
### Create env.yaml
The `env.yaml` file is created with the script but if you need to add teams you can create it and add them as follows:
```yaml
GITHUB_METRICS_TEAMS: <teams>
```
*GITHUB_METRICS_TEAMS: '["team-copilot", "team-copilot-2"]'*

### CopilotMetricsIngestion
```bash
gcloud functions deploy {metrics_ingestion_name} --runtime dotnet8 --trigger-http --entry-point Microsoft.CopilotDashboard.DataIngestion.Functions.CopilotMetricsIngestion --region {region} --env-vars-file env.yaml --set-secrets="GITHUB_TOKEN={gh-secret}:latest" --set-env-vars="PROJECT_ID={projectId},DATABASE_ID={db_name},GITHUB_ENTERPRISE={ghEnterprise},GITHUB_ORGANIZATION={ghOrganization}"
```

region: __us-central1__

### CopilotSeatsIngestion
```bash
gcloud functions deploy {seats_ingestion_name} --runtime dotnet8 --trigger-http --entry-point Microsoft.CopilotDashboard.DataIngestion.Functions.CopilotSeatsIngestion --region {region} --env-vars-file env.yaml --set-secrets="GITHUB_TOKEN={gh-secret}:latest" --set-env-vars="PROJECT_ID={projectId},DATABASE_ID={db_name},GITHUB_ENTERPRISE={ghEnterprise},GITHUB_ORGANIZATION={ghOrganization}"
```


region: __us-central1__

## Create service account
```bash
gcloud iam service-accounts create {sa-name} --display-name "Geitost invoker service account" --description "SA for schedulers to invoke functions securely"
```

```bash
gcloud projects add-iam-policy-binding {projectId} --member "serviceAccount:{sa-name}@{projectId}.iam.gserviceaccount.com" --role "roles/run.invoker"
```

## Create scheduler
### CopilotMetricsIngestion
```bash
gcloud scheduler jobs create http {hourly_metrics_ingestion} --schedule="0 * * * *" --uri={metrics_ingestion_uri} --http-method=GET --description="Invokes Metrics Ingestion API each hour to populate db" --location {location} --oidc-service-account-email="{sa-name}@{project_id}.iam.gserviceaccount.com" --oidc-token-audience={metrics_ingestion_uri}
```
location: __us-central1__

### CopilotSeatsIngestion
```bash
gcloud scheduler jobs create http {hourly_seats_ingestion} --schedule="0 * * * *" --uri={seats_ingestion_uri} --http-method=GET --description="Invokes Seats Ingestion API each hour to populate db" --location {location} --oidc-service-account-email="{sa-name}@{project_id}.iam.gserviceaccount.com" --oidc-token-audience={seats_ingestion_uri}
```
location: __us-central1__

## Create frontend service account
```bash
dashboardServiceName="dashboard"
dashboardSa="${dashboardServiceName}-front-sa"
dashboardSaMember="$dashboardSa@$projectId.iam.gserviceaccount.com"

gcloud iam service-accounts create $dashboardSa --display-name "Geitost frontend service account" --description "SA needed to read db and pull images"
```

## Binding roles
```bash
gcloud projects add-iam-policy-binding $projectId --member="serviceAccount:$dashboardSaMember" --role="roles/artifactregistry.reader"
gcloud projects add-iam-policy-binding $projectId --member="serviceAccount:$dashboardSaMember" --role="roles/artifactregistry.writer"
gcloud projects add-iam-policy-binding $projectId --member="serviceAccount:$dashboardSaMember" --role="roles/artifactregistry.createOnPushRepoAdmin"
gcloud projects add-iam-policy-binding $projectId --member="serviceAccount:$dashboardSaMember" --role="roles/firebase.viewer"
gcloud projects add-iam-policy-binding $projectId --member="serviceAccount:$dashboardSaMember" --role="roles/logging.logWriter"
gcloud projects add-iam-policy-binding $projectId --member="serviceAccount:$dashboardSaMember" --role="roles/storage.admin"
```

## Deploy front
Inside `src/dashboard`
```bash
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
```