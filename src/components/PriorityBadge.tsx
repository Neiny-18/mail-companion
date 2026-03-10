import type { Priority } from "@/data/mockEmails";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";

const priorityKeyMap: Record<Priority, TranslationKey> = {
  urgent: "priority.urgent",
  important: "priority.important",
  normal: "priority.normal",
  ignore: "priority.ignore",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const { t } = useLanguage();
  const label = t(priorityKeyMap[priority]);

  if (priority === "urgent") {
    return <span className="font-mono text-xs font-bold text-destructive uppercase tracking-wide">{label}</span>;
  }
  if (priority === "important") {
    return <span className="font-mono text-xs font-bold underline uppercase tracking-wide">{label}</span>;
  }
  if (priority === "normal") {
    return <span className="font-mono text-xs text-muted-foreground uppercase tracking-wide">{label}</span>;
  }
  return <span className="font-mono text-xs text-muted-foreground/50 uppercase tracking-wide">{label}</span>;
}
