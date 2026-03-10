import { useState } from "react";
import type { Email } from "@/data/mockEmails";
import { PriorityBadge } from "./PriorityBadge";
import { OrderDetail } from "./OrderDetail";

export function EmailRow({ email }: { email: Email }) {
  const [expanded, setExpanded] = useState(false);
  const [hovering, setHovering] = useState(false);
  const isExpandable = !!email.orderData;

  const time = new Date(email.timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <div
      className="border-b border-border"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div
        className={`px-6 py-3 grid gap-x-4 items-start ${
          isExpandable ? "cursor-pointer" : ""
        }`}
        style={{ gridTemplateColumns: "56px 1fr 80px" }}
        onClick={() => isExpandable && setExpanded(!expanded)}
      >
        {/* Time */}
        <span className="font-mono text-xs text-muted-foreground pt-0.5">
          {time}
        </span>

        {/* Content */}
        <div className="min-w-0">
          <div className="flex items-baseline gap-3 mb-0.5">
            <span className="font-mono text-sm font-medium truncate">
              {email.subject}
            </span>
          </div>
          <p className="font-mono text-xs text-muted-foreground truncate">
            {email.sender}
          </p>
          <p className="font-mono text-xs text-muted-foreground/70 mt-1 leading-relaxed">
            {email.summary}
          </p>

          {/* Hover actions */}
          {hovering && (
            <div className="flex gap-4 mt-2">
              <button className="font-mono text-xs underline text-muted-foreground hover:text-foreground transition-colors">
                Translate
              </button>
              <button className="font-mono text-xs underline text-muted-foreground hover:text-foreground transition-colors">
                Summarize
              </button>
              <button className="font-mono text-xs underline text-muted-foreground hover:text-foreground transition-colors">
                Draft Reply
              </button>
            </div>
          )}
        </div>

        {/* Priority */}
        <div className="text-right pt-0.5">
          <PriorityBadge priority={email.priority} />
        </div>
      </div>

      {/* Expandable order detail */}
      {expanded && email.orderData && (
        <OrderDetail data={email.orderData} />
      )}
    </div>
  );
}
