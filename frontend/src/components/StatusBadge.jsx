import { Badge } from "@/components/ui/badge";

const MAP = {
  succeeded: "success", captured: "success", paid: "success", sent: "success", active: "success",
  delivered: "success", approved: "success",
  processing: "info", requires_capture: "info", authorized: "info", pending: "info",
  queued: "info", trialing: "info", shipped: "info", requires_payment_method: "info",
  failed: "danger", canceled: "danger", refunded: "danger", suspended: "danger", past_due: "danger",
  partially_refunded: "warning", paused: "warning",
};

const STYLES = {
  success: "bg-[hsl(var(--success))]/12 text-[hsl(var(--success))] border-[hsl(var(--success))]/25",
  info: "bg-primary/10 text-primary border-primary/25",
  danger: "bg-destructive/10 text-destructive border-destructive/25",
  warning: "bg-[hsl(var(--warning))]/12 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/25",
  neutral: "bg-muted text-muted-foreground border-border",
};

export const StatusBadge = ({ status, testId }) => {
  const tone = MAP[status] || "neutral";
  return (
    <Badge
      data-testid={testId}
      variant="outline"
      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${STYLES[tone]}`}
    >
      {String(status || "—").replace(/_/g, " ")}
    </Badge>
  );
};
