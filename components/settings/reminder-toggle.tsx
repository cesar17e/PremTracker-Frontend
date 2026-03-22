"use client";

type ReminderToggleProps = {
  checked: boolean;
  disabled: boolean;
  pending: boolean;
  helperText: string;
  onChange: (nextValue: boolean) => Promise<unknown>;
};

export function ReminderToggle({
  checked,
  disabled,
  pending,
  helperText,
  onChange,
}: ReminderToggleProps) {
  return (
    <div className="rounded-[1.45rem] border border-base-content/10 bg-base-content/[0.04] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
            Email reminders
          </p>
          <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-base-content">
            Enable fixture reminder emails
          </h3>
          <p className="mt-3 text-sm leading-6 text-base-content/68">{helperText}</p>
        </div>

        <label className="flex items-center gap-3">
          <span className="text-sm font-medium text-base-content/72">
            {pending ? "Updating..." : checked ? "Enabled" : "Disabled"}
          </span>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={checked}
            disabled={disabled || pending}
            onChange={(event) => void onChange(event.target.checked)}
          />
        </label>
      </div>
    </div>
  );
}
