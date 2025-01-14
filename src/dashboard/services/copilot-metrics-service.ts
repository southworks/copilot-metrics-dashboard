import {
  formatResponseError,
  unknownResponseError,
} from "@/features/common/response-error";
import { ServerActionResponse } from "@/features/common/server-action-response";
import { format } from "date-fns";
import { firestoreClient, firestoreConfiguration } from "./firestore-service";
import { ensureGitHubEnvConfig } from "./env-service";
import { applyTimeFrameLabel } from "./helper";
import { sampleData } from "./sample-data";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { CopilotUsageOutput } from "@/types/copilotUsage";

export interface IFilter {
  startDate?: Date;
  endDate?: Date;
}

export const getCopilotMetrics = async (
  filter: IFilter
): Promise<ServerActionResponse<CopilotUsageOutput[]>> => {
  try {
    const isCosmosConfig = firestoreConfiguration();
    switch(process.env.GITHUB_API_SCOPE) {
      // If we have the required environment variables, we can use the enterprise API endpoint
      case "enterprise":
        // If we have the required environment variables, we can use the database
        if (isCosmosConfig) {
          return getCopilotMetricsForEnterpriseFromDatabase(filter);
        }
        return getCopilotMetricsForEnterpriseFromApi();
      break;
      // As default option, we can use the organization API endpoint
      default:
        // If we have the required environment variables, we can use the database
        if (isCosmosConfig) {
          return getCopilotMetricsForOrgsFromDatabase(filter);
        }
        return getCopilotMetricsForOrgsFromApi();
      break;
    }
  } catch (e) {
    return {
      status: "ERROR",
      errors: [{ message: "" + e }],
    };
  }
};

export const getCopilotMetricsForOrgsFromApi = async (): Promise<
  ServerActionResponse<CopilotUsageOutput[]>
> => {
  const env = await ensureGitHubEnvConfig();

  if (env.status !== "OK") {
    return env;
  }

  const { organization, token, version } = env.response;

  try {
    const response = await fetch(
      `https://api.github.com/orgs/${organization}/copilot/usage`,
      {
        cache: "no-store",
        headers: {
          Accept: `application/vnd.github+json`,
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": version,
        },
      }
    );

    if (!response.ok) {
      return formatResponseError(organization, response);
    }

    const data = await response.json();
    const dataWithTimeFrame = applyTimeFrameLabel(data);
    return {
      status: "OK",
      response: dataWithTimeFrame,
    };
  } catch (e) {
    return unknownResponseError(e);
  }
};

export const getCopilotMetricsForEnterpriseFromApi = async (): Promise<
  ServerActionResponse<CopilotUsageOutput[]>
> => {
  const env = await ensureGitHubEnvConfig();

  if (env.status !== "OK") {
    return env;
  }

  const { enterprise, token, version } = env.response;

  try {
    const response = await fetch(
      `https://api.github.com/enterprises/${enterprise}/copilot/usage`,
      {
        cache: "no-store",
        headers: {
          Accept: `application/vnd.github+json`,
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": version,
        },
      }
    );

    if (!response.ok) {
      return formatResponseError(enterprise, response);
    }

    const data = await response.json();
    const dataWithTimeFrame = applyTimeFrameLabel(data);
    return {
      status: "OK",
      response: dataWithTimeFrame,
    };
  } catch (e) {
    return unknownResponseError(e);
  }
};

export const getCopilotMetricsForOrgsFromDatabase = async (
  filter: IFilter
): Promise<ServerActionResponse<CopilotUsageOutput[]>> => {
  const db = firestoreClient();
  const historyCollection = collection(db, "history");

  let start = "";
  let end = "";
  const maxDays = 365 * 2; // maximum 2 years of data
  const maximumDays = 31;

  if (filter.startDate && filter.endDate) {
    start = format(filter.startDate, "yyyy-MM-dd");
    end = format(filter.endDate, "yyyy-MM-dd");
  } else {
    // set the start date to today and the end date to 31 days ago
    const todayDate = new Date();
    const startDate = new Date(todayDate);
    startDate.setDate(todayDate.getDate() - maximumDays);

    start = format(startDate, "yyyy-MM-dd");
    end = format(todayDate, "yyyy-MM-dd");
  }

  const q = query(
    historyCollection,
    where("day", ">=", start),
    where("day", "<=", end)
  );

  const querySnapshot = await getDocs(q);
  const resources: CopilotUsageOutput[] = [];
  querySnapshot.forEach((doc) => {
    resources.push(doc.data() as CopilotUsageOutput);
  });

  const dataWithTimeFrame = applyTimeFrameLabel(resources);
  return {
    status: "OK",
    response: dataWithTimeFrame,
  };
};

export const getCopilotMetricsForEnterpriseFromDatabase = async (
  filter: IFilter
): Promise<ServerActionResponse<CopilotUsageOutput[]>> => {
  const db = firestoreClient();
  const historyCollection = collection(db, "history");

  let start = "";
  let end = "";
  const maxDays = 365 * 2; // maximum 2 years of data
  const maximumDays = 31;

  if (filter.startDate && filter.endDate) {
    start = format(filter.startDate, "yyyy-MM-dd");
    end = format(filter.endDate, "yyyy-MM-dd");
  } else {
    const todayDate = new Date();
    const startDate = new Date(todayDate);
    startDate.setDate(todayDate.getDate() - maximumDays);

    start = format(startDate, "yyyy-MM-dd");
    end = format(todayDate, "yyyy-MM-dd");
  }

  const q = query(
    historyCollection,
    where("day", ">=", start),
    where("day", "<=", end)
  );

  const querySnapshot = await getDocs(q);
  const resources: CopilotUsageOutput[] = [];
  querySnapshot.forEach((doc) => {
    resources.push(doc.data() as CopilotUsageOutput);
  });

  const dataWithTimeFrame = applyTimeFrameLabel(resources);
  return {
    status: "OK",
    response: dataWithTimeFrame,
  };
};

export const _getCopilotMetrics = (): Promise<CopilotUsageOutput[]> => {
  const promise = new Promise<CopilotUsageOutput[]>((resolve) => {
    setTimeout(() => {
      const weekly = applyTimeFrameLabel(sampleData);
      resolve(weekly);
    }, 1000);
  });

  return promise;
};
