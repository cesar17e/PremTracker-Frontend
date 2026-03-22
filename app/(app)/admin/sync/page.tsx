import type { Metadata } from "next";
import { AdminSyncPanel } from "@/components/admin/admin-sync-panel";

export const metadata: Metadata = {
  title: "Admin sync",
  description: "Run the protected EPL sync job for PremTracker.",
};

export default function AdminSyncPage() {
  return <AdminSyncPanel />;
}
