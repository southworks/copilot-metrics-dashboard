import { ServerActionResponse } from "@/features/common/server-action-response";
import { SqlQuerySpec } from "@azure/cosmos";
import { format } from "date-fns";
import { cosmosClient } from "./cosmos-db-service";
import { applyTimeFrameLabel } from "./helper";
import { CopilotUsageOutput, Breakdown } from "@/types/copilotUsage";
import { CopilotMetrics } from "@/types/copilotMetrics";

export interface IFilter {
  startDate?: Date;
  endDate?: Date;
}

export const getCopilotMetrics = async (
  filter: IFilter, teamName: string
): Promise<ServerActionResponse<CopilotUsageOutput[]>> => {
  try {
    return getCopilotMetricsHistoryFromDatabase(filter, teamName);
  } catch (e) {
    return {
      status: "ERROR",
      errors: [{ message: "" + e }],
    };
  }
};

const editorsModelsToBreakdown = (item: CopilotMetrics): Breakdown[] => {
  const breakdown: Breakdown[] = [];

  for (const editor of item.copilot_ide_code_completions.editors) {
    for (const model of editor.models) {
      for (const language of model.languages) {
        breakdown.push({
          language: language.name,
          editor: editor.name,
          suggestions_count: language.total_code_suggestions,
          acceptances_count: language.total_code_acceptances,
          lines_suggested: language.total_code_lines_suggested,
          lines_accepted: language.total_code_lines_accepted,
          active_users: model.total_engaged_users,
        });
      }
    }
  }
  return breakdown;
};

const adaptMetricsToUsage = (
  resource: CopilotMetrics[]
): CopilotUsageOutput[] => {
  let adaptedData: CopilotUsageOutput[] = [];
  for (const item of resource) {
    adaptedData.push({
      total_suggestions_count: item.total_suggestions_count,
      total_acceptances_count: item.total_acceptances_count,
      total_lines_suggested: item.total_lines_suggested,
      total_lines_accepted: item.total_lines_accepted,
      total_active_users: item.total_active_users,
      total_chat_acceptances: 0,
      total_chat_turns: item.total_chat_turns,
      total_active_chat_users: item.copilot_ide_chat.total_engaged_users,
      day: item.date,
      breakdown: editorsModelsToBreakdown(item),
      time_frame_display: "",
      time_frame_month: "",
      time_frame_week: "",
    });
  }
  return adaptedData;
};

export const getCopilotMetricsHistoryFromDatabase = async (
  filter: IFilter, teamName: string
): Promise<ServerActionResponse<CopilotUsageOutput[]>> => {
  const client = cosmosClient();
  const database = client.database("platform-engineering");
  const container = database.container("metrics_history");

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

  let querySpec: SqlQuerySpec = {
    query: `SELECT * FROM c WHERE c.date >= @start AND c.date <= @end AND CONTAINS(c.id, @team)`,
    parameters: [
      { name: "@start", value: start },
      { name: "@end", value: end },
      { name: "@team", value: teamName },
    ],
  };

  const { resources } = await container.items
    .query<CopilotMetrics>(querySpec, {
      maxItemCount: maxDays,
    })
    .fetchAll();

  const adaptedMetrics = adaptMetricsToUsage(resources);

  const dataWithTimeFrame = applyTimeFrameLabel(adaptedMetrics);
  return {
    status: "OK",
    response: dataWithTimeFrame,
  };
};
