import { useParams } from "react-router-dom";
import { mockEmails, type Category, type Email } from "@/data/mockEmails";
import { PriorityBadge } from "@/components/PriorityBadge";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";
import { useState } from "react";
import { OrderDetail } from "@/components/OrderDetail";

const categoryMap: Record<string, Category> = {
  jobs: "Job",
  school: "School",
  orders: "Orders / Travel",
  ads: "Ads / Subscriptions",
};

const categoryTitleMap: Record<string, TranslationKey> = {
  jobs: "category.Job",
  school: "category.School",
  orders: "category.Orders / Travel",
  ads: "category.Ads / Subscriptions",
};

const categoryTranslationMap: Record<Category, TranslationKey> = {
  "Job": "category.Job",
  "School": "category.School",
  "Orders / Travel": "category.Orders / Travel",
  "Ads / Subscriptions": "category.Ads / Subscriptions",
  "Other": "category.Other",
};

export default function EmailList() {
  const { category } = useParams<{ category?: string }>();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { t } = useLanguage();

  const filtered = category
    ? mockEmails.filter((e) => e.category === categoryMap[category])
    : mockEmails;

  const title = category
    ? t(categoryTitleMap[category] || "emailList.allEmails")
    : t("emailList.allEmails");

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-4">
        <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-1">
          {t("emailList.inbox")}
        </p>
        <h1 className="font-sans text-lg font-semibold">{title}</h1>
        <p className="font-mono text-xs text-muted-foreground mt-1">
          {filtered.length} {filtered.length !== 1 ? t("emailList.emails") : t("emailList.email")}
        </p>
      </div>

      <div className="border border-border">
        <div
          className="px-4 py-2 border-b border-border bg-accent/50 grid gap-x-3 items-center"
          style={{ gridTemplateColumns: "50px 1fr 160px 100px 80px" }}
        >
          <span className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">{t("emailList.time")}</span>
          <span className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">{t("emailList.subjectSender")}</span>
          <span className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">{t("emailList.category")}</span>
          <span className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">{t("emailList.priority")}</span>
          <span className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground text-right">{t("emailList.actions")}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <span className="font-mono text-xs text-muted-foreground">{t("emailList.none")}</span>
          </div>
        ) : (
          filtered.map((email) => (
            <EmailTableRow
              key={email.id}
              email={email}
              expanded={expandedId === email.id}
              hovered={hoveredId === email.id}
              onToggle={() => setExpandedId(expandedId === email.id ? null : email.id)}
              onHover={(h) => setHoveredId(h ? email.id : null)}
              categoryLabel={t(categoryTranslationMap[email.category])}
              translateLabel={t("emailList.translate")}
              replyLabel={t("emailList.reply")}
            />
          ))
        )}
      </div>
    </div>
  );
}

function EmailTableRow({
  email, expanded, hovered, onToggle, onHover, categoryLabel, translateLabel, replyLabel,
}: {
  email: Email; expanded: boolean; hovered: boolean; onToggle: () => void; onHover: (h: boolean) => void;
  categoryLabel: string; translateLabel: string; replyLabel: string;
}) {
  const time = new Date(email.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  const isExpandable = !!email.orderData;

  return (
    <div className="border-b border-border last:border-b-0" onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)}>
      <div
        className={`px-4 py-2.5 grid gap-x-3 items-start ${isExpandable ? "cursor-pointer" : ""}`}
        style={{ gridTemplateColumns: "50px 1fr 160px 100px 80px" }}
        onClick={() => isExpandable && onToggle()}
      >
        <span className="font-mono text-xs text-muted-foreground pt-0.5">{time}</span>
        <div className="min-w-0">
          <p className="font-mono text-sm truncate">{email.subject}</p>
          <p className="font-mono text-xs text-muted-foreground truncate">{email.sender}</p>
          <p className="font-mono text-xs text-muted-foreground/60 mt-0.5 line-clamp-1">{email.summary}</p>
        </div>
        <span className="font-mono text-xs text-muted-foreground pt-0.5">{categoryLabel}</span>
        <div className="pt-0.5"><PriorityBadge priority={email.priority} /></div>
        <div className="text-right pt-0.5">
          {hovered && (
            <div className="flex flex-col gap-0.5 items-end">
              <button className="font-mono text-[10px] underline text-muted-foreground hover:text-foreground">{translateLabel}</button>
              <button className="font-mono text-[10px] underline text-muted-foreground hover:text-foreground">{replyLabel}</button>
            </div>
          )}
        </div>
      </div>
      {expanded && email.orderData && (
        <div className="px-4 pb-3"><OrderDetail data={email.orderData} /></div>
      )}
    </div>
  );
}
