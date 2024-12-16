import TeamDashboard, { IProps } from "@/features/dashboard/team-dashboard-page";
import { Suspense } from "react";
import Loading from "./loading";
import { Metadata } from 'next';
 
export const metadata: Metadata = {
  title: "GitHub Copilot Team Dashboard",
  description: "GitHub Copilot Team Dashboard",
};
export const dynamic = "force-dynamic";
export default function Home(props: IProps) {

  let id = "initial-team-dashboard";

  if (props.searchParams.startDate && props.searchParams.endDate) {
    id = `${id}-${props.searchParams.startDate}-${props.searchParams.endDate}`;
  }

  return (
    <Suspense fallback={<Loading />} key={id}>
      <TeamDashboard {...props} />
    </Suspense>
  );
}
