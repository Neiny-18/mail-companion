import { getDailySummary, mockEmails } from "@/data/mockEmails";
import { PriorityBadge } from "@/components/PriorityBadge";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { urgent, important, total, date } = getDailySummary();
  const ignored = mockEmails.filter((e) => e.priority === "ignore").length;
  const normal = mockEmails.filter((e) => e.priority === "normal").length;

  // Recent urgent/important emails
  const topEmails = mockEmails
    .filter((e) => e.priority === "urgent" || e.priority === "important")
    .slice(0, 5);

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-1">
          Daily Summary
        </p>
        <h1 className="font-sans text-lg font-semibold">{date}</h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard label="Urgent" value={urgent} variant="urgent" />
        <StatCard label="Important" value={important} variant="important" />
        <StatCard label="Normal" value={normal} variant="normal" />
        <StatCard label="Ignored" value={ignored} variant="ignore" />
      </div>

      {/* Daily brief */}
      <div className="border border-border p-4 mb-8">
        <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-2">
          Today's Brief
        </p>
        <div className="font-mono text-xs leading-relaxed space-y-1 text-muted-foreground">
          <p>• Interview at TechCorp scheduled for March 12, 10:00 AM PST.</p>
          <p>• CS 401 final project due tonight at 11:59 PM.</p>
          <p>• GitHub password change detected — verify if authorized.</p>
          <p>• Flight to Tokyo confirmed for March 25.</p>
          <p>• Midterm exams begin March 17.</p>
        </div>
      </div>

      {/* Top priority emails */}
      <div className="border border-border">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground">
            Needs Attention
          </p>
          <Link
            to="/emails"
            className="font-mono text-xs underline text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
          </Link>
        </div>
        {topEmails.map((email) => (
          <div
            key={email.id}
            className="px-4 py-3 border-b border-border last:border-b-0 grid gap-x-4"
            style={{ gridTemplateColumns: "1fr 80px" }}
          >
            <div className="min-w-0">
              <p className="font-mono text-sm truncate">{email.subject}</p>
              <p className="font-mono text-xs text-muted-foreground truncate">
                {email.sender}
              </p>
              <p className="font-mono text-xs text-muted-foreground/70 mt-0.5">
                {email.summary}
              </p>
            </div>
            <div className="text-right">
              <PriorityBadge priority={email.priority} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant: "urgent" | "important" | "normal" | "ignore";
}) {
  return (
    <div className="border border-border p-4">
      <p className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
        {label}
      </p>
      <p
        className={`font-mono text-2xl font-bold ${
          variant === "urgent"
            ? "text-destructive"
            : variant === "important"
            ? "underline"
            : "text-muted-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
