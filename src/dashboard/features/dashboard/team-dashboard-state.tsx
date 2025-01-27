"use client";

import { PropsWithChildren } from "react";
import { Breakdown, CopilotTeamUsageOutput } from "@/types/copilotUsage";
import { formatDate } from "@/utils/helpers";

import { proxy, useSnapshot } from "valtio";

import { groupByTimeFrame } from "@/utils/team-data-mapper";

interface IProps extends PropsWithChildren {
  copilotUsages: CopilotTeamUsageOutput[];
}

interface BusinessUnits {
  [key: string]: string[];
}

export interface DropdownFilterItem {
  value: string;
  isSelected: boolean;
}

export type TimeFrame = "daily" | "weekly" | "monthly";

class DashboardState {
  public filteredData: CopilotTeamUsageOutput[] = [];
  public languages: DropdownFilterItem[] = [];
  public editors: DropdownFilterItem[] = [];
  public teams: DropdownFilterItem[] = [];
  public businessUnits: DropdownFilterItem[] = [];
  public timeFrame: TimeFrame = "weekly";

  private apiData: CopilotTeamUsageOutput[] = [];

  public initData(
    data: CopilotTeamUsageOutput[]
  ): void {
    this.apiData = [...data];
    this.filteredData = [...data];
    this.onTimeFrameChange(this.timeFrame);
    this.languages = this.extractUniqueLanguages();
    this.editors = this.extractUniqueEditors();
    this.teams = this.extractUniqueTeams();
    this.businessUnits = this.extractBusinessUnits();
  }

  public filterTeam(team: string): void {
    const item = this.teams.find((item) => item.value.toLowerCase() === team);
    if (item) {
      item.isSelected = !item.isSelected;
      this.applyFilters();
    }
  }

  public filterBusinessUnit(businessUnit: string): void {
    const item = this.businessUnits.find((item) => item.value.toLowerCase() === businessUnit);
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
    this.businessUnits.forEach((item) => (item.isSelected = false));
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
    const selectedBusinessUnits = this.businessUnits.filter((item) => item.isSelected);

    let data: CopilotTeamUsageOutput[] = [];

    if (selectedBusinessUnits.length !== 0) {
      data = this.aggregateBusinessUnitsDataByTimeFrame(selectedBusinessUnits);
    }
    
    if (selectedTeams.length !== 0) {
      data = this.aggregatedDataByTimeFrame(selectedTeams);
    }

    if (selectedBusinessUnits.length === 0 && selectedTeams.length === 0) {
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

  private getBusinessUnits(): BusinessUnits[] {
    const businessUnitsEnv = process.env.NEXT_PUBLIC_BUSINESS_UNITS;
    if (businessUnitsEnv !== null && businessUnitsEnv !== undefined && businessUnitsEnv.trim().length > 0){
      try {
        return JSON.parse(businessUnitsEnv);
      } catch (error) {
        console.error("Failed to parse NEXT_PUBLIC_BUSINESS_UNITS:", error);
        throw error;
      }
    }else{
      return [];
    }
  }

  private extractBusinessUnits(): DropdownFilterItem[] {
    const teams: DropdownFilterItem[] = [];
    try {
      const businessUnits = this.getBusinessUnits();
      
      businessUnits.forEach((businessUnit) => {
        teams.push({ value: Object.keys(businessUnit)[0], isSelected: false });
      })

      return teams;
    } catch (error) {
      console.error("Failed to extract business units: ", error);
      throw error;
    }
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

  private aggregateBusinessUnitsDataByTimeFrame(
    selectedBusinessUnits: DropdownFilterItem[] = []
  ): CopilotTeamUsageOutput[] {

    const businessUnits = this.getBusinessUnits();
    let selectedTeams: string[] = [];

    if (selectedBusinessUnits.length !== 0) {
      const filteredBusinessUnits = businessUnits.filter((unit) =>
        selectedBusinessUnits.some((selected) => Object.keys(unit)[0] === selected.value)
      );

      filteredBusinessUnits.forEach((unit) => {
        unit[Object.keys(unit)[0]].forEach((team) => {
          selectedTeams.push(team);
        });
      });

      const selectedTeamsDropdownItems: DropdownFilterItem[] = selectedTeams.map((team) => ({
        value: team,
        isSelected: true,
      }));

      return this.aggregatedDataByTimeFrame(selectedTeamsDropdownItems);
    }

    return this.aggregatedDataByTimeFrame();
  }

  private aggregatedDataByTimeFrame(
    selectedTeams: DropdownFilterItem[] = []
  ): CopilotTeamUsageOutput[] {
    let items = JSON.parse(
      JSON.stringify(this.apiData)
    ) as Array<CopilotTeamUsageOutput>;

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
    }, {} as Record<string, CopilotTeamUsageOutput[]>);

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
}: IProps) => {
  dashboardStore.initData(copilotUsages);
  return <>{children}</>;
};