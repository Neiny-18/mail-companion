import { getDailySummary } from "@/data/mockEmails";
import { useLanguage } from "@/i18n/LanguageContext";

export function DailySummary() {
  const { urgent, important, total, date } = getDailySummary();
  const { t } = useLanguage();

  return (
    <header className="border-b border-border px-6 py-5">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1 font-sans">
        {t("dailySummary.title")}
      </p>
      <h1 className="text-lg font-semibold font-sans mb-3">{date}</h1>
      <div className="font-mono text-sm space-y-0.5">
        <p>
          <span className="text-destructive font-bold">{urgent} {t("dailySummary.urgentCount")}</span>
          {" · "}
          <span className="font-bold underline">{important} {t("dailySummary.importantCount")}</span>
          {" · "}
          <span className="text-muted-foreground">{total} {t("dailySummary.totalEmails")}</span>
        </p>
        <p className="text-muted-foreground text-xs mt-2">{t("dailySummary.briefText")}</p>
      </div>
    </header>
  );
}
