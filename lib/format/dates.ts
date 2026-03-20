type DateFormatOptions = Intl.DateTimeFormatOptions & {
  locale?: string;
};

function toDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(value: string, options: DateFormatOptions) {
  const parsed = toDate(value);
  if (!parsed) {
    return value;
  }

  const { locale = "en-US", ...intlOptions } = options;
  return new Intl.DateTimeFormat(locale, intlOptions).format(parsed);
}

export function formatMatchDate(value: string, locale?: string) {
  return formatDate(value, {
    locale,
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatKickoffTime(value: string, locale?: string) {
  return formatDate(value, {
    locale,
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDateTime(value: string, locale?: string) {
  return formatDate(value, {
    locale,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function isIsoDateString(value: string) {
  return toDate(value) !== null;
}
