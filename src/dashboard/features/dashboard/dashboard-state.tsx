"use client";

import { PropsWithChildren } from "react";
import { Breakdown, CopilotUsageOutput } from "@/types/copilotUsage";
import { formatDate } from "@/utils/helpers";

import { proxy, useSnapshot } from "valtio";

import { groupByTimeFrame } from "@/utils/data-mapper";
import { SeatManagement } from "../common/models";

interface IProps extends PropsWithChildren {
  copilotUsages: CopilotUsageOutput[];
  seatManagement: SeatManagement;
}

export interface DropdownFilterItem {
  value: string;
  isSelected: boolean;
}

export type TimeFrame = "daily" | "weekly" | "monthly";

class DashboardState {
  public filteredData: CopilotUsageOutput[] = [];
  public languages: DropdownFilterItem[] = [];
  public editors: DropdownFilterItem[] = [];
  public teams: DropdownFilterItem[] = [];
  public timeFrame: TimeFrame = "weekly";

  public seatManagement: SeatManagement = {} as SeatManagement;

  private apiData: CopilotUsageOutput[] = [];

  public initData(
    data: CopilotUsageOutput[],
    seatManagement: SeatManagement
  ): void {
    this.apiData = [...data];
    this.filteredData = [...data];
    this.onTimeFrameChange(this.timeFrame);
    this.languages = this.extractUniqueLanguages();
    this.editors = this.extractUniqueEditors();
    this.teams = this.extractUniqueTeams();
    this.seatManagement = seatManagement;
  }

  public filterTeam(team: string): void {
    const item = this.teams.find((item) => item.value.toLowerCase() === team);
    if (item) {
      item.isSelected = !item.isSelected;
      this.applyFilters();
    }
  }

  public filterLanguage(language: string): void {
    const item = this.languages.find((l) => l.value === language);
    if (item) {
      item.isSelected = !item.isSelected;
      this.applyFilters();
    }
  }

  public filterEditor(editor: string): void {
    const item = this.editors.find((l) => l.value === editor);
    if (item) {
      item.isSelected = !item.isSelected;
      this.applyFilters();
    }
  }

  public resetAllFilters(): void {
    this.languages.forEach((item) => (item.isSelected = false));
    this.editors.forEach((item) => (item.isSelected = false));
    this.teams.forEach((item) => (item.isSelected = false));
    this.applyFilters();
  }

  public onTimeFrameChange(timeFrame: TimeFrame): void {
    this.timeFrame = timeFrame;
    this.applyFilters();
  }

  private applyFilters(): void {
    const selectedLanguages = this.languages.filter((item) => item.isSelected);
    const selectedEditors = this.editors.filter((item) => item.isSelected);
    const selectedTeams = this.teams.filter((item) => item.isSelected);

    let data: CopilotUsageOutput[] = [];

    if (selectedTeams.length !== 0) {
      data = this.aggregatedDataByTimeFrame(selectedTeams);
    } else {
      data = this.aggregatedDataByTimeFrame();
    }

    if (selectedLanguages.length !== 0) {
      data.forEach((item) => {
        const filtered = item.breakdown.filter((breakdown: Breakdown) =>
          selectedLanguages.some(
            (selectedLanguage) => selectedLanguage.value === breakdown.language
          )
        );
        item.breakdown = filtered;
      });
    }

    if (selectedEditors.length !== 0) {
      data.forEach((item) => {
        const filtered = item.breakdown.filter((breakdown: Breakdown) =>
          selectedEditors.some((editor) => editor.value === breakdown.editor)
        );
        item.breakdown = filtered;
      });
    }

    const filtered = data.filter((item) => item.breakdown.length > 0);
    this.filteredData = filtered;
  }

  private extractUniqueLanguages(): DropdownFilterItem[] {
    const languages: DropdownFilterItem[] = [];

    this.apiData.forEach((item) => {
      item.breakdown.forEach((breakdown) => {
        const index = languages.findIndex(
          (language) => language.value === breakdown.language
        );

        if (index === -1) {
          languages.push({ value: breakdown.language, isSelected: false });
        }
      });
    });

    return languages;
  }

  private extractUniqueEditors(): DropdownFilterItem[] {
    const editors: DropdownFilterItem[] = [];
    this.apiData.forEach((item) => {
      item.breakdown.forEach((breakdown) => {
        const index = editors.findIndex(
          (editor) => editor.value === breakdown.editor
        );

        if (index === -1) {
          editors.push({ value: breakdown.editor, isSelected: false });
        }
      });
    });

    return editors;
  }

  private extractUniqueTeams(): DropdownFilterItem[] {
    const teams: DropdownFilterItem[] = [];
    this.apiData.forEach((item) => {
      const idParts = item.id.split("-");
      const teamName = idParts.slice(5).join("-"); // Extract the team name part
      const index = teams.findIndex((team) => team.value === teamName);

      if (index === -1) {
        teams.push({ value: teamName, isSelected: false });
      }
    });

    return teams;
  }

  private aggregatedDataByTimeFrame(
    selectedTeams: DropdownFilterItem[] = []
  ): CopilotUsageOutput[] {
    let items = JSON.parse(
      JSON.stringify(this.apiData)
    ) as Array<CopilotUsageOutput>;

    if (selectedTeams.length !== 0) {
      items = items.filter((item) => {
        const teamName = item.id.split("-").slice(5).join("-");
        return selectedTeams.some((team) => team.value === teamName);
      });
    }

    if (this.timeFrame === "daily") {
      items.forEach((item) => {
        item.time_frame_display = formatDate(item.day);
      });
      return items;
    }

    const groupedByTimeFrame = items.reduce((acc, item) => {
      const timeFrameLabel =
        this.timeFrame === "weekly"
          ? item.time_frame_week
          : item.time_frame_month;

      if (!acc[timeFrameLabel]) {
        acc[timeFrameLabel] = [];
      }

      acc[timeFrameLabel].push(item);

      return acc;
    }, {} as Record<string, CopilotUsageOutput[]>);

    return groupByTimeFrame(groupedByTimeFrame);
  }
}

export const dashboardStore = proxy(new DashboardState());

export const useDashboard = () => {
  return useSnapshot(dashboardStore, { sync: true }) as DashboardState;
};

export const DataProvider = ({
  children,
  copilotUsages,
  seatManagement,
}: IProps) => {
  dashboardStore.initData(copilotUsages, seatManagement);
  return <>{children}</>;
};
