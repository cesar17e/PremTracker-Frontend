import type { Metadata } from "next";
import { TeamsWorkspace } from "@/components/teams/teams-workspace";

export const metadata: Metadata = {
  title: "Teams",
  description: "Browse Premier League clubs and open team analytics in PremTracker.",
};

export default function TeamsPage() {
  return <TeamsWorkspace />;
}
