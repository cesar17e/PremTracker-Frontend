import { notFound } from "next/navigation";
import { TeamDetailPage } from "@/components/teams/team-detail-page";

export default async function TeamDetailRoute(
  props: PageProps<"/teams/[teamId]">
) {
  const { teamId } = await props.params;
  const parsedTeamId = Number(teamId);

  if (!Number.isFinite(parsedTeamId) || parsedTeamId <= 0) {
    notFound();
  }

  return <TeamDetailPage teamId={parsedTeamId} />;
}
