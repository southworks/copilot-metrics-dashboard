import { ErrorPage } from "../common/error-page";
import { AcceptanceRate } from "./charts/team-acceptance-rate";
import { ActiveUsers } from "./charts/team-active-users";
import { Editor } from "./charts/team-editor";
import { Language } from "./charts/team-language";
import { Stats } from "./charts/team-stats";
import { TotalCodeLineSuggestionsAndAcceptances } from "./charts/team-total-code-line-suggestions-and-acceptances";
import { TotalSuggestionsAndAcceptances } from "./charts/team-total-suggestions-and-acceptances";
import { DataProvider } from "./team-dashboard-state";
import { TimeFrameToggle } from "./filter/team-time-frame-toggle";
import { TeamHeader } from "./team-header";
import {
  getCopilotMetrics,
  IFilter as MetricsFilter,
} from "@/services/team-copilot-metrics-service";

export interface IProps {
  searchParams: MetricsFilter;
}

export default async function TeamDashboard(props: IProps) {
  const allData = await getCopilotMetrics(props.searchParams, true);

  if (allData.status !== "OK") {
    return <ErrorPage error={allData.errors[0].message} />;
  }

  return (
    <DataProvider
      copilotUsages={allData.response}
    >
      <main className="flex flex-1 flex-col gap-4 md:gap-8 pb-8">
        <TeamHeader />
        <div className="mx-auto w-full max-w-6xl container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Stats/>
            <div className="flex justify-end col-span-4">
              <TimeFrameToggle />
            </div>
            <AcceptanceRate />
            <TotalCodeLineSuggestionsAndAcceptances />
            <TotalSuggestionsAndAcceptances />
            <Language />
            <Editor />
            <ActiveUsers />
          </div>
        </div>
      </main>
    </DataProvider>
  );
}
