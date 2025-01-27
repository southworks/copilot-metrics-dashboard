import { format, startOfWeek } from "date-fns";
import { CopilotUsage, CopilotUsageOutput } from "@/types/copilotUsage";

export const applyTimeFrameLabel = (
  data: CopilotUsage[]
): CopilotUsageOutput[] => {
  // Sort data by 'day'
  const sortedData = data.sort(
    (a, b) => new Date(a.day).getTime() - new Date(b.day).getTime()
  );

  const dataWithTimeFrame: CopilotUsageOutput[] = [];

  sortedData.forEach((item) => {
    // Convert 'day' to a Date object in UTC and find the start of its week
    const date = new Date(Date.UTC(
      new Date(item.day).getUTCFullYear(),
      new Date(item.day).getUTCMonth(),
      new Date(item.day).getUTCDate()
    ));
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });

    // Create a unique week identifier
    const weekIdentifier = format(weekStart, "MMM dd");
    const monthIdentifier = format(date, "MMM yy");

    const output: CopilotUsageOutput = {
      ...item,
      time_frame_week: weekIdentifier,
      time_frame_month: monthIdentifier,
      time_frame_display: weekIdentifier,
    };
    dataWithTimeFrame.push(output);
  });

  return dataWithTimeFrame;
};
