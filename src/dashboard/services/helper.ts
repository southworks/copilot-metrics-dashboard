import { format, startOfWeek } from "date-fns";
import { CopilotUsage, CopilotUsageOutput } from "@/types/copilotUsage";
import { UTCDate } from "@date-fns/utc";

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
    const date = new UTCDate(item.day);
    const weekStart = startOfWeek(date, { weekStartsOn: 0 });

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
