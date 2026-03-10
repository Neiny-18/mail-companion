import { useState } from "react";
import type { Email } from "@/data/mockEmails";
import { PriorityBadge } from "./PriorityBadge";
import { OrderDetail } from "./OrderDetail";
import { useLanguage } from "@/i18n/LanguageContext";

export function EmailRow({ email }: { email: Email }) {
  const [expanded, setExpanded] = useState(false);
  const [hovering, setHovering] = useState(false);
  const isExpandable = !!email.orderData;
  const { t } = useLanguage();

  const time = new Date(email.timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <div className="border-b border-border" onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
      <div
        className={`px-6 py-3 grid gap-x-4 items-start ${isExpandable ? "cursor-pointer" : ""}`}
        style={{ gridTemplateColumns: "56px 1fr 80px" }}
        onClick={() => isExpandable && setExpanded(!expanded)}
      >
        <span className="font-mono text-xs text-muted-foreground pt-0.5">{time}</span>
        <div className="min-w-0">
          <div className="flex items-baseline gap-3 mb-0.5">
            <span className="font-mono text-sm font-medium truncate">{email.subject}</span>
          </div>
          <p className="font-mono text-xs text-muted-foreground truncate">{email.sender}</p>
          <p className="font-mono text-xs text-muted-foreground/70 mt-1 leading-relaxed">{email.summary}</p>
          {hovering && (
            <div className="flex gap-4 mt-2">
              <button className="font-mono text-xs underline text-muted-foreground hover:text-foreground transition-colors">{t("action.translate")}</button>
              <button className="font-mono text-xs underline text-muted-foreground hover:text-foreground transition-colors">{t("action.summarize")}</button>
              <button className="font-mono text-xs underline text-muted-foreground hover:text-foreground transition-colors">{t("action.draftReply")}</button>
            </div>
          )}
        </div>
        <div className="text-right pt-0.5"><PriorityBadge priority={email.priority} /></div>
      </div>
      {expanded && email.orderData && <OrderDetail data={email.orderData} />}
    </div>
  );
}
