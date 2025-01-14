import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

const client = new SecretManagerServiceClient();

export async function getSecret(name: string) {
  // you can get more sophistacted here with different environments but that wasn't needed for my case
  const real_name = `projects/${process.env.PROJECT_ID}/secrets/${name}/versions/latest`;
  const [secret] = await client.accessSecretVersion({ name: real_name });
  if (secret.payload && secret.payload.data) {
    return secret.payload.data.toString();
  }
  throw new Error("Secret payload or data is null or undefined");
}
