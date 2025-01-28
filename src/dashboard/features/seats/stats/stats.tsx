"use client";
import * as Tooltip from "@radix-ui/react-tooltip";
import "../../dashboard/tooltipStyle.css";
import { useDashboard } from "@/features/seats/seats-state";
import { CopilotSeatsData } from "@/features/common/models";
import StatsCard from "./stats-card";
import { useState } from "react";

interface TotalSeatsData {
  total_seats: number;
  total_active_seats: number;
  total_inactive_seats: number;
}

function totalSeats(filteredData: CopilotSeatsData): TotalSeatsData {
  let total_active_seats = 0;
  let total_inactive_seats = 0;
  filteredData?.seats.map((item) => {
    const lastActivityAt = new Date(item.last_activity_at);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - lastActivityAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (
      (item.pending_cancellation_date &&
        new Date(item.pending_cancellation_date) < currentDate) ||
      diffDays > 31
    ) {
      total_inactive_seats += 1;
    } else {
      total_active_seats += 1;
    }
  });

  return {
    total_seats: total_active_seats + total_inactive_seats,
    total_active_seats: total_active_seats,
    total_inactive_seats: total_inactive_seats,
  };
}

export const Stats = () => {
  const { filteredData } = useDashboard();
  const totalSeatsData = totalSeats(filteredData);

  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    // Get the relative position within the card
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 col-span-4">
      <StatsCard
        title="Total users"
        description="Total assigned seats"
        value={totalSeatsData.total_seats.toString()}
      ></StatsCard>
      <StatsCard
        title="Active users"
        description="Total active users"
        value={totalSeatsData.total_active_seats.toString()}
      ></StatsCard>
      <Tooltip.Provider>
        <Tooltip.Root delayDuration={0}>
          <div onMouseMove={handleMouseMove}>
            <Tooltip.Trigger asChild>
              <div>
                <StatsCard
                  title="Inactive users"
                  description="Total inactive users"
                  value={totalSeatsData.total_inactive_seats.toString()}
                ></StatsCard>
              </div>
            </Tooltip.Trigger>
          </div>
          <Tooltip.Content
            className="TooltipContent"
            style={{
              position: "fixed",
              left: `${position.x - 240}px`, // Offset from cursor
              top: `${position.y - 110}px`, // Offset from cursor
              pointerEvents: "none", // Prevents tooltip from interfering with mouse events
              zIndex: 9999, // Ensures tooltip is on top of other elements
            }}
          >
            <div
              style={{
                backgroundColor: "#443d3d",
                borderRadius: "8px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)", // Optional: adds depth
              }}
              className="px-4 py-2"
            >
              The inactive users are those who have not used Copilot for more than 31 days.
            </div>
          </Tooltip.Content>
        </Tooltip.Root>
      </Tooltip.Provider>
    </div>
  );
};
