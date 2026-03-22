import { StatusAlert } from "@/components/ui/status-alert";

type RateLimitNoticeProps = {
  title?: string;
  description?: string;
};

export function RateLimitNotice({
  title = "Action temporarily unavailable",
  description = "This action hit a backend limit. Please wait and try again later.",
}: RateLimitNoticeProps) {
  return <StatusAlert variant="warning" title={title} description={description} />;
}
