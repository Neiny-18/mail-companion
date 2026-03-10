import { getDailySummary, mockEmails } from "@/data/mockEmails";
import { PriorityBadge } from "@/components/PriorityBadge";
import { useLanguage } from "@/i18n/LanguageContext";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { urgent, important, total, date } = getDailySummary();
  const ignored = mockEmails.filter((e) => e.priority === "ignore").length;
  const normal = mockEmails.filter((e) => e.priority === "normal").length;
  const { t } = useLanguage();

  const topEmails = mockEmails
    .filter((e) => e.priority === "urgent" || e.priority === "important")
    .slice(0, 5);

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-1">
          {t("dashboard.dailySummary")}
        </p>
        <h1 className="font-sans text-lg font-semibold">{date}</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard label={t("dashboard.urgent")} value={urgent} variant="urgent" />
        <StatCard label={t("dashboard.important")} value={important} variant="important" />
        <StatCard label={t("dashboard.normal")} value={normal} variant="normal" />
        <StatCard label={t("dashboard.ignored")} value={ignored} variant="ignore" />
      </div>

      <div className="border border-border p-4 mb-8">
        <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-2">
          {t("dashboard.todaysBrief")}
        </p>
        <div className="font-mono text-xs leading-relaxed space-y-1 text-muted-foreground">
          <p>• {t("dashboard.briefInterview")}</p>
          <p>• {t("dashboard.briefProject")}</p>
          <p>• {t("dashboard.briefGithub")}</p>
          <p>• {t("dashboard.briefFlight")}</p>
          <p>• {t("dashboard.briefExams")}</p>
        </div>
      </div>

      <div className="border border-border">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground">
            {t("dashboard.needsAttention")}
          </p>
          <Link
            to="/emails"
            className="font-mono text-xs underline text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("dashboard.viewAll")}
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
              <p className="font-mono text-xs text-muted-foreground truncate">{email.sender}</p>
              <p className="font-mono text-xs text-muted-foreground/70 mt-0.5">{email.summary}</p>
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

function StatCard({ label, value, variant }: { label: string; value: number; variant: "urgent" | "important" | "normal" | "ignore" }) {
  return (
    <div className="border border-border p-4">
      <p className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
      <p className={`font-mono text-2xl font-bold ${variant === "urgent" ? "text-destructive" : variant === "important" ? "underline" : "text-muted-foreground"}`}>
        {value}
      </p>
    </div>
  );
}
