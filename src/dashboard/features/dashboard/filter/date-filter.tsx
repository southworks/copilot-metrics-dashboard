"use client";

import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import * as React from "react";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { UTCDate } from "@date-fns/utc";

export const DateFilter = () => {
  const router = useRouter();

  const today = new UTCDate();
  // last 31 days
  const lastThirtyOneDays = new UTCDate(today);
  lastThirtyOneDays.setUTCDate(today.getUTCDate() - 31);

  const searchParams = useSearchParams();
  const startDateParam = searchParams.get("startDate");
  const initialStartDate = startDateParam ? new UTCDate(startDateParam) : lastThirtyOneDays;
  
  const endDateParam = searchParams.get("endDate");
  const initialEndDate = endDateParam ? new UTCDate(endDateParam) : today;

  const teamDataParam = searchParams.get("teamData");
  
  const [date, setDate] = React.useState<DateRange>({
    from: initialStartDate,
    to: initialEndDate
  });

  const [isOpen, setIsOpen] = React.useState(false);

  const applyFilters = () => {
    if (date.from && date.to) {
      const formatEndDate = format(date?.to, "yyyy-MM-dd");
      const formatStartDate = format(date?.from, "yyyy-MM-dd");

      router.push(`?startDate=${formatStartDate}&endDate=${formatEndDate}`, {
        scroll: false,
      });
      router.refresh();
      setIsOpen(false);
    }
  };

  return (
    <div className={cn("grid gap-2")}>
      <Popover open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[270px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 flex gap-2 flex-col"
          align="start"
        >
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(range) => {
              if (range) {
                setDate(range);
              }
            }}
            numberOfMonths={2}
          />
          <Button onClick={applyFilters} className="self-end m-2">
            Apply
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
};
