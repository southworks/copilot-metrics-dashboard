import { PageHeader, PageTitle } from "../page-header/page-header";
import { DateFilter } from "./filter/date-filter";
import { TeamDashboardFilters } from "./filter/team-dashboard-header-filter";

export const TeamHeader = () => {
  return (
    <PageHeader>
      <PageTitle>GitHub Copilot Metrics</PageTitle>
      <div className="flex gap-8 justify-between flex-col md:flex-row">
        <TeamDashboardFilters />
        <div className="flex gap-2">
          <DateFilter />
        </div>
      </div>
    </PageHeader>
  );
};
