import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ChartHeader } from "./chart-header";
import * as Tooltip from "@radix-ui/react-tooltip";
import "../tooltipStyle.css";
import { useState } from "react";

interface StatsCardProps {
  title: string;
  description: string;
  value: string;
  tooltipContent?: string;
}

export default function StatsCard(props: StatsCardProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    // Get the relative position within the card
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <Tooltip.Provider>
      <Tooltip.Root delayDuration={0}>
        <Card className="flex flex-col relative" onMouseMove={handleMouseMove}>
          <Tooltip.Trigger asChild>
            <div>
            <ChartHeader title={props.title} description={props.description} />
            <CardContent className="flex items-center justify-center flex-1 py-0">
              <CardTitle className="text-[2.8rem] flex-1 tracking-tighter font-bold">
                {props.value}
              </CardTitle>
            </CardContent>
            </div>
          </Tooltip.Trigger>
          <Tooltip.Content
            className="TooltipContent"
            style={{
              position: "fixed",
              left: `${position.x - 250}px`, // Offset from cursor
              top: `${position.y - 155}px`, // Offset from cursor
              pointerEvents: "none", // Prevents tooltip from interfering with mouse events
              zIndex: 9999 // Ensures tooltip is on top of other elements
            }}
          >
            <div
              style={{ 
                backgroundColor: "#443d3d", 
                borderRadius: "8px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)" // Optional: adds depth
              }}
              className="px-4 py-2"
            >
              {props.tooltipContent}
            </div>
          </Tooltip.Content>
        </Card>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}