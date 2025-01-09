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

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

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
