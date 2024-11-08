import {
  formatResponseError,
  unknownResponseError,
} from "@/features/common/response-error";
import { ServerActionResponse } from "@/features/common/server-action-response";
import { ensureGitHubEnvConfig } from "./env-service";
import {
  CopilotSeatsData,
  CopilotSeatManagementData,
} from "@/features/common/models";
import { cosmosClient } from "./cosmos-db-service";
import { format } from "date-fns";
import { SqlQuerySpec } from "@azure/cosmos";
import { stringIsNullOrEmpty } from "../utils/helpers";

export interface IFilter {
  date?: Date;
  enterprise: string;
  organization: string;
  team: string;
}

export const getCopilotSeats = async (
  filter: IFilter
): Promise<ServerActionResponse<CopilotSeatsData>> => {
  const env = ensureGitHubEnvConfig();

  if (env.status !== "OK") {
    return env;
  }

  const { enterprise, organization, token, version } = env.response;

  try {
    switch (process.env.GITHUB_API_SCOPE) {
      case "enterprise":
        if (stringIsNullOrEmpty(filter.enterprise) ) {
          filter.enterprise = enterprise;
        }
        break;
      default:
        if (stringIsNullOrEmpty(filter.organization)) {
          filter.organization = organization;
        }
        break;
    }
    return getCopilotSeatsFromDatabase(filter);
  } catch (e) {
    return unknownResponseError(e);
  }
};

const getCopilotSeatsFromDatabase = async (
  filter: IFilter
): Promise<ServerActionResponse<CopilotSeatsData>> => {
  const client = cosmosClient();
  const database = client.database("platform-engineering");
  const container = database.container("seats_history");

  let date = "";
  const maxDays = 365 * 2; // maximum 2 years of data

  if (filter.date) {
    date = format(filter.date, "yyyy-MM-dd");
  } else {
    const today = new Date();
    date = format(today, "yyyy-MM-dd");
  }

  let querySpec: SqlQuerySpec = {
    query: `SELECT * FROM c WHERE c.date = @date`,
    parameters: [{ name: "@date", value: date }],
  };
  if (filter.enterprise) {
    querySpec.query += ` AND c.enterprise = @enterprise`;
    querySpec.parameters?.push({
      name: "@enterprise",
      value: filter.enterprise,
    });
  }
  if (filter.organization) {
    querySpec.query += ` AND c.organization = @organization`;
    querySpec.parameters?.push({
      name: "@organization",
      value: filter.organization,
    });
  }
  if (filter.team) {
    querySpec.query += ` AND c.team = @team`;
    querySpec.parameters?.push({ name: "@team", value: filter.team });
  }

  const { resources } = await container.items
    .query<CopilotSeatsData>(querySpec, {
      maxItemCount: maxDays,
    })
    .fetchAll();

  return {
    status: "OK",
    response: resources[0],
  };
};


export const getCopilotSeatsManagement = async (
  filter: IFilter
): Promise<ServerActionResponse<CopilotSeatManagementData>> => {
  const env = ensureGitHubEnvConfig();

  if (env.status !== "OK") {
    return env;
  }

  const { enterprise, organization, token, version } = env.response;

  try {
    switch (process.env.GITHUB_API_SCOPE) {
      case "enterprise":
        if (stringIsNullOrEmpty(filter.enterprise)) {
          filter.enterprise = enterprise;
        }
        break;
      default:
        if (stringIsNullOrEmpty(filter.organization)) {
          filter.organization = organization;
        }
        break;
    }
    return getCopilotSeatsManagementFromAPI(filter);
  } catch (e) {
    return unknownResponseError(e);
  }
};

const getCopilotSeatsManagementFromAPI = async (
  filter: IFilter
): Promise<ServerActionResponse<CopilotSeatManagementData>> => {
  const env = ensureGitHubEnvConfig();

  if (env.status !== "OK") {
    return env;
  }

  const { enterprise, organization, token, version } = env.response;

  try {
    switch (process.env.GITHUB_API_SCOPE) {
      case "enterprise":
        const enterpriseResponse = await fetch(
          `https://api.github.com/enterprises/${enterprise}/copilot/billing/seats`,
          {
            cache: "no-store",
            headers: {
              Accept: `application/vnd.github+json`,
              Authorization: `Bearer ${token}`,
              "X-GitHub-Api-Version": version,
            },
          }
        );

        if (!enterpriseResponse.ok) {
          return formatResponseError(enterprise, enterpriseResponse);
        }
        const today = new Date();
        const enterpriseData = await enterpriseResponse.json();
        const enterpriseSeats = enterpriseData as CopilotSeatsData;
        enterpriseSeats.enterprise = enterprise;
        enterpriseSeats.last_update = format(today, "yyyy-MM-ddTHH:mm:ss");
        enterpriseSeats.date = format(today, "yyyy-MM-dd");
        enterpriseSeats.id = `${enterpriseSeats.date}-${enterprise}`;

        // Copilot seats are considered active if they have been active in the last 30 days
        const activeSeats = enterpriseSeats.seats.filter((seat) => {
          const lastActivityDate = new Date(seat.last_activity_at);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return lastActivityDate >= thirtyDaysAgo;
        });
        const seatManagementData: CopilotSeatManagementData = {
          enterprise: enterpriseSeats.enterprise,
          organization: enterpriseSeats.organization,
          date: enterpriseSeats.date,
          id: enterpriseSeats.id,
          last_update: enterpriseSeats.last_update,
          total_seats: enterpriseSeats.total_seats,
          seats: {
            seat_breakdown: {
              total: enterpriseSeats.seats.length,
              active_this_cycle: activeSeats.length,
              inactive_this_cycle:
                enterpriseSeats.seats.length - activeSeats.length,
              added_this_cycle: 0,
              pending_invitation: 0,
              pending_cancellation: 0,
            },
            seat_management_setting: "",
            public_code_suggestions: "",
            ide_chat: "",
            platform_chat: "",
            cli: "",
            plan_type: "",
          },
        };

        return {
          status: "OK",
          response: seatManagementData as CopilotSeatManagementData,
        };
        break;

      default:
        const response = await fetch(
          `https://api.github.com/orgs/${organization}/copilot/billing`,
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

        const seats = await response.json();
        const _today = new Date();
        const data: CopilotSeatManagementData = {
          id: `${format(_today, "yyyy-MM-dd")}-${organization}`,
          date: format(_today, "yyyy-MM-dd"),
          last_update: format(_today, "yyyy-MM-ddTHH:mm:ss"),
          total_seats: seats.total_seats,
          seats: seats as CopilotSeatManagementData["seats"],
          enterprise: enterprise,
          organization: organization,
        };
        return {
          status: "OK",
          response: data as CopilotSeatManagementData,
        };
        break;
    }
  } catch (e) {
    return unknownResponseError(e);
  }
};
