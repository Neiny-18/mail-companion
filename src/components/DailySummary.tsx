import { getDailySummary } from "@/data/mockEmails";

export function DailySummary() {
  const { urgent, important, total, date } = getDailySummary();

  return (
    <header className="border-b border-border px-6 py-5">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1 font-sans">
        Daily Summary
      </p>
      <h1 className="text-lg font-semibold font-sans mb-3">{date}</h1>
      <div className="font-mono text-sm space-y-0.5">
        <p>
          <span className="text-destructive font-bold">{urgent} urgent</span>
          {" · "}
          <span className="font-bold underline">{important} important</span>
          {" · "}
          <span className="text-muted-foreground">{total} total emails today</span>
        </p>
        <p className="text-muted-foreground text-xs mt-2">
          You have an interview at TechCorp tomorrow and a CS 401 project due tonight. A GitHub password change was flagged.
        </p>
      </div>
    </header>
  );
}
