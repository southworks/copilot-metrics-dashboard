"use client";
import { Card, CardContent } from "@/components/ui/card";

import { ScrollArea } from "@/components/ui/scroll-area";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Pie, PieChart } from "recharts";
import { useDashboard } from "../dashboard-state";
import { ChartHeader } from "./chart-header";
import { computeLanguageData } from "./common";
import * as Tooltip from "@radix-ui/react-tooltip";
import "../tooltipStyle.css";
import { useState } from "react";

export interface PieChartData {
  id: string;
  name: string;
  value: number;
  fill: string;
}

export const Language = () => {
  const { filteredData } = useDashboard();
  const data = computeLanguageData(filteredData);

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
    <Tooltip.Provider>
      <Tooltip.Root delayDuration={0}>
        <Card
          className="col-span-4 md:col-span-2"
          onMouseMove={handleMouseMove}
        >
          <Tooltip.Trigger asChild>
            <div>
              <ChartHeader
                title="Language"
                description="Percentage of active users per language"
              />
            </div>
          </Tooltip.Trigger>
          <CardContent>
            <div className="w-full h-full flex flex-col gap-4 ">
              <div className="">
                <ChartContainer
                  config={chartConfig}
                  className="mx-auto aspect-square max-h-[250px]"
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      paddingAngle={1}
                      data={data}
                      dataKey="value"
                      nameKey="name"
                      cornerRadius={5}
                      innerRadius={40}
                    />
                  </PieChart>
                </ChartContainer>
              </div>
              <div className="flex flex-col gap-4 text-sm flex-wrap">
                <ListItems items={data} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Tooltip.Content
          className="TooltipContent"
          style={{
            position: "fixed",
            left: `${position.x - 450}px`, // Offset from cursor
            top: `${position.y - 155}px`, // Offset from cursor
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
            The percentages for each language are calculated by aggregating the number of
            active users for each language across all data points. The
            percentage for each language is then computed as the ratio of active
            users for that language to the total number of active users,
            multiplied by 100.
          </div>
        </Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};

const chartConfig = {} satisfies ChartConfig;

export function ListItems(props: { items: PieChartData[] }) {
  const { items } = props;

  return (
    <ScrollArea className="h-72 rounded-md">
      <div className="gap-1 flex flex-col">
        {items.map((item) => (
          <div
            className="px-4 py-2 text-sm flex items-center border-b border-muted"
            key={item.name}
          >
            <span className="flex-1">{item.name}</span>
            <span className="p-1 px-2 border bg-primary-foreground rounded-full text-xs">
              {item.value} %
            </span>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
