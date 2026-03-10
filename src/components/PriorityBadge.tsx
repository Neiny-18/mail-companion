import type { Priority } from "@/data/mockEmails";

export function PriorityBadge({ priority }: { priority: Priority }) {
  if (priority === "urgent") {
    return (
      <span className="font-mono text-xs font-bold text-destructive uppercase tracking-wide">
        Urgent
      </span>
    );
  }
  if (priority === "important") {
    return (
      <span className="font-mono text-xs font-bold underline uppercase tracking-wide">
        Important
      </span>
    );
  }
  if (priority === "normal") {
    return (
      <span className="font-mono text-xs text-muted-foreground uppercase tracking-wide">
        Normal
      </span>
    );
  }
  // ignore
  return (
    <span className="font-mono text-xs text-muted-foreground/50 uppercase tracking-wide">
      Ignore
    </span>
  );
}
