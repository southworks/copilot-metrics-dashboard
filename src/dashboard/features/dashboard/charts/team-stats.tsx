"use client";
import { useDashboard } from "../team-dashboard-state";
import {
  computeActiveUserAverage,
  computeCumulativeAcceptanceAverage,
  computeEngagedUserAverage,
} from "./team-common";
import StatsCard from "./stats-card";

export const Stats = () => {
  const { filteredData } = useDashboard();
  const acceptanceAverage = computeCumulativeAcceptanceAverage(filteredData);
  const averageActiveUsers = computeActiveUserAverage(filteredData);
  const averageEngagedUsers = computeEngagedUserAverage(filteredData);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 col-span-4">
      <StatsCard
        title="Acceptance average"
        description="Inline code acceptance average"
        value={acceptanceAverage.toFixed(2) + "%"}
        tooltipContent="The acceptance average is calculated as the cumulative ratio of total lines accepted to total lines suggested, multiplied by 100."
      ></StatsCard>
      <StatsCard
        title="Active users"
        description="Average active users"
        value={averageActiveUsers.toFixed(0) + ""}
        tooltipContent="The average number of active users is calculated by averaging the total active users over the selected time frame."
      ></StatsCard>
      <StatsCard
        title="Engaged users"
        description="Average engaged users."
        value={averageEngagedUsers.toFixed(0) + ""}
        tooltipContent="Engaged users are calculated by averaging the total number of engaged users across all data points. An engaged user is someone who has actively interacted with the system during the specified time frame."
      ></StatsCard>
    </div>
  );
};
