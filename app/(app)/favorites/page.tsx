import { EmptyState } from "@/components/ui/empty-state";

export default function FavoritesPage() {
  return (
    <div className="w-full max-w-3xl space-y-5">
      <section className="rounded-[1.7rem] border border-base-content/10 bg-base-content/[0.04] p-5 sm:p-6">
        <p className="section-kicker">Favorites</p>
        <h1 className="mt-3 text-[1.85rem] font-semibold tracking-[-0.03em] text-base-content">
          Saved clubs are the next user feature
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-base-content/70">
          This screen now lives inside the protected shell, so saved-team actions can plug into the
          working session flow without more auth work.
        </p>
      </section>

      <EmptyState
        eyebrow="Coming next"
        title="Favorites come right after core team browsing"
        description="Your account session is ready, but saved clubs are still waiting on the next product phase. The route and authenticated shell are in place now."
      />
    </div>
  );
}
