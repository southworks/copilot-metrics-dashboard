import { featuresEnvConfig } from "@/services/env-service";


export const getFeatures = () => {
  const features = featuresEnvConfig();
  if (features.status !== "OK") {
    return {
      dashboard: true,
      seats: true
    }
  }
  return features.response;
}


export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-AU", {
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  });
};

export const stringIsNullOrEmpty = (str: string | null | undefined) => {
  return str === null || str === undefined || str === "";
};

export const getNextUrlFromLinkHeader = (linkHeader: string | null): string | null => {
  if (!linkHeader) return null;

  const links = linkHeader.split(',');
  for (const link of links) {
    const match = link.match(/<([^>]+)>;\s*rel="([^"]+)"/);
    if (match && match[2] === 'next') {
      return match[1];
    }
  }
  return null;
}
