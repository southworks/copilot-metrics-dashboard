import { ServerActionResponse } from "@/features/common/server-action-response";
import { SqlQuerySpec } from "@azure/cosmos";
import { format, startOfWeek } from "date-fns";
import { cosmosClient } from "./cosmos-db-service";
import { CopilotTeamUsageOutput, Breakdown } from "@/types/copilotUsage";
import { CopilotMetrics } from "@/types/copilotMetrics";

export interface IFilter {
  startDate?: Date;
  endDate?: Date;
}

export const getCopilotMetrics = async (
  filter: IFilter
): Promise<ServerActionResponse<CopilotTeamUsageOutput[]>> => {
  try {
    return getCopilotMetricsHistoryFromDatabase(filter);
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
): CopilotTeamUsageOutput[] => {
  let adaptedData: CopilotTeamUsageOutput[] = [];
  for (const item of resource) {
    const adaptedBreakdown = editorsModelsToBreakdown(item);
    adaptedData.push({
      id: item.id,
      total_suggestions_count: 0,
      total_acceptances_count: 0,
      total_lines_suggested: 0,
      total_lines_accepted: 0,
      total_active_users: item.total_active_users,
      total_chat_acceptances: 0,
      total_chat_turns: 0,
      total_active_chat_users: item.copilot_ide_chat.total_engaged_users,
      total_engaged_users: item.total_engaged_users,
      day: item.date,
      breakdown: adaptedBreakdown,
      time_frame_display: "",
      time_frame_month: "",
      time_frame_week: "",
    });
  }
  return adaptedData;
};

const applyTimeFrameLabel = (
  data: CopilotTeamUsageOutput[]
): CopilotTeamUsageOutput[] => {
  // Sort data by 'day'
  const sortedData = data.sort(
    (a, b) => new Date(a.day).getTime() - new Date(b.day).getTime()
  );

  const dataWithTimeFrame: CopilotTeamUsageOutput[] = [];

  sortedData.forEach((item) => {
    // Convert 'day' to a Date object and find the start of its week
    const date = new Date(item.day);
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });

    // Create a unique week identifier
    const weekIdentifier = format(weekStart, "MMM dd");
    const monthIdentifier = format(date, "MMM yy");

    const output: CopilotTeamUsageOutput = {
      ...item,
      time_frame_week: weekIdentifier,
      time_frame_month: monthIdentifier,
      time_frame_display: weekIdentifier,
    };
    dataWithTimeFrame.push(output);
  });

  return dataWithTimeFrame;
};

export const getCopilotMetricsHistoryFromDatabase = async (
  filter: IFilter
): Promise<ServerActionResponse<CopilotTeamUsageOutput[]>> => {
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
    query: `SELECT * FROM c WHERE c.date >= @start AND c.date <= @end AND c.id LIKE @idPattern`,
    parameters: [
      { name: "@start", value: start },
      { name: "@end", value: end },
      {
        name: "@idPattern",
        value: `%org-${process.env.GITHUB_ORGANIZATION}-%`,
      },
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
