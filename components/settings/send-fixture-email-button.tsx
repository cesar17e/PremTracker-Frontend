"use client";

type SendFixtureEmailButtonProps = {
  disabled: boolean;
  pending: boolean;
  helperText: string;
  onSend: () => Promise<unknown>;
};

export function SendFixtureEmailButton({
  disabled,
  pending,
  helperText,
  onSend,
}: SendFixtureEmailButtonProps) {
  return (
    <div className="rounded-[1.45rem] border border-base-content/10 bg-base-content/[0.04] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
            Email action
          </p>
          <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-base-content">
            Send fixture digest now
          </h3>
          <p className="mt-3 text-sm leading-6 text-base-content/68">{helperText}</p>
        </div>

        <button
          type="button"
          disabled={disabled || pending}
          className="btn btn-primary rounded-full px-5"
          onClick={() => void onSend()}
        >
          {pending ? "Sending..." : "Send digest now"}
        </button>
      </div>
    </div>
  );
}
