"use server";

import{ SecretManagerServiceClient } from "@google-cloud/secret-manager";

export async function getSecret() {
  "use server";
  const client = new SecretManagerServiceClient();
  
  const [version] = await client.accessSecretVersion({
    name: `projects/${process.env.FIREBASE_PROJECT_ID}/secrets/${process.env.GITHUB_TOKEN}/versions/latest`,
  });

  const payload = version?.payload?.data?.toString();
  return payload;
}