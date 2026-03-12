import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import type { Category, Email, SubCategory } from "@/data/mockEmails";
import { PriorityBadge } from "@/components/PriorityBadge";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";
import { OrderDetail } from "@/components/OrderDetail";
import {
  detectEmailLanguage,
  fetchFullEmailBody,
  fetchNetEaseEmailBody,
  getNeteaseConfig,
  translateEmailContent,
  summarizeEmail,
  getCachedTranslation,
  setCachedTranslation,
  getCachedSummary,
  setCachedSummary,
} from "@/lib/emailTranslate";
import { getValidAccessToken } from "@/lib/outlookAuth";

const categoryMap: Record<string, Category> = {
  jobs: "Job",
  school: "School",
  orders: "Orders / Travel",
  ads: "Ads / Subscriptions",
  other: "Other",
};

const categoryTitleMap: Record<string, TranslationKey> = {
  jobs: "category.Job",
  school: "category.School",
  orders: "category.Orders / Travel",
  ads: "category.Ads / Subscriptions",
  other: "category.Other",
};

const categoryTranslationMap: Record<Category, TranslationKey> = {
  "Job": "category.Job",
  "School": "category.School",
  "Orders / Travel": "category.Orders / Travel",
  "Ads / Subscriptions": "category.Ads / Subscriptions",
  "Other": "category.Other",
};

const subCategoryLabelKeyMap: Record<SubCategory, TranslationKey> = {
  Interview: "sidebar.sub.Interview",
  Application: "sidebar.sub.Application",
  OA: "sidebar.sub.OA",
  Offer: "sidebar.sub.Offer",
  Rejection: "sidebar.sub.Rejection",
  Recruiter: "sidebar.sub.Recruiter",
  Course: "sidebar.sub.Course",
  Deadline: "sidebar.sub.Deadline",
  Exam: "sidebar.sub.Exam",
  Events: "sidebar.sub.Events",
  Ecommerce: "sidebar.sub.Ecommerce",
  Travel: "sidebar.sub.Travel",
  Bills: "sidebar.sub.Bills",
  Refund: "sidebar.sub.Refund",
  Newsletter: "sidebar.sub.Newsletter",
  Promotion: "sidebar.sub.Promotion",
  Banking: "sidebar.sub.Banking",
  Social: "sidebar.sub.Social",
  Uncategorized: "sidebar.sub.Uncategorized",
};

const OUTLOOK_CATEGORY_OVERRIDES_KEY = "outlook_category_overrides";
const OUTLOOK_DOMAIN_RULES_KEY = "outlook_domain_category_rules";
const NETEASE_CATEGORY_OVERRIDES_KEY = "netease_category_overrides";
const NETEASE_DOMAIN_RULES_KEY = "netease_domain_category_rules";

type DomainRule = { category: Category; subCategory?: SubCategory };

function loadCategoryOverrides(): Record<string, Category> {
  try {
    const rawO = localStorage.getItem(OUTLOOK_CATEGORY_OVERRIDES_KEY);
    const rawN = localStorage.getItem(NETEASE_CATEGORY_OVERRIDES_KEY);
    const o = rawO ? (JSON.parse(rawO) as Record<string, Category>) : {};
    const n = rawN ? (JSON.parse(rawN) as Record<string, Category>) : {};
    return { ...o, ...n };
  } catch {
    return {};
  }
}

function saveCategoryOverrides(map: Record<string, Category>) {
  const outlook = Object.fromEntries(Object.entries(map).filter(([id]) => !id.startsWith("netease:")));
  const netease = Object.fromEntries(Object.entries(map).filter(([id]) => id.startsWith("netease:")));
  localStorage.setItem(OUTLOOK_CATEGORY_OVERRIDES_KEY, JSON.stringify(outlook));
  localStorage.setItem(NETEASE_CATEGORY_OVERRIDES_KEY, JSON.stringify(netease));
}

function loadDomainRules(): Record<string, DomainRule> {
  try {
    const rawO = localStorage.getItem(OUTLOOK_DOMAIN_RULES_KEY);
    const rawN = localStorage.getItem(NETEASE_DOMAIN_RULES_KEY);
    const o = rawO ? (JSON.parse(rawO) as Record<string, DomainRule>) : {};
    const n = rawN ? (JSON.parse(rawN) as Record<string, DomainRule>) : {};
    return { ...o, ...n };
  } catch {
    return {};
  }
}

function saveDomainRules(map: Record<string, DomainRule>, provider: "outlook" | "netease") {
  const key = provider === "outlook" ? OUTLOOK_DOMAIN_RULES_KEY : NETEASE_DOMAIN_RULES_KEY;
  localStorage.setItem(key, JSON.stringify(map));
}

function extractDomain(addr: string): string | null {
  if (!addr) return null;
  const lower = addr.toLowerCase();
  const match = lower.match(/@([a-z0-9.-]+\.[a-z]{2,})/);
  return match ? match[1] : null;
}

export default function EmailList() {
  const { category } = useParams<{ category?: string }>();
  const [searchParams] = useSearchParams();
  const subParam = searchParams.get("sub") as SubCategory | null;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outlookDisconnected, setOutlookDisconnected] = useState(false);
  const [categoryOverrides, setCategoryOverrides] = useState<Record<string, Category>>(() => loadCategoryOverrides());
  const { t } = useLanguage();

  function getEffectiveCategory(email: Email): Category {
    const override = categoryOverrides[email.id];
    if (override) return override;
    return email.category;
  }

  function handleCategoryChange(emailId: string, nextCategory: Category) {
    setCategoryOverrides((prev) => {
      const next = { ...prev, [emailId]: nextCategory };
      saveCategoryOverrides(next);
      return next;
    });
    const email = emails.find((e) => e.id === emailId);
    if (email) {
      const domain = extractDomain(email.senderEmail || email.from || "");
      if (domain) {
        const provider = email.provider === "netease" ? "netease" : "outlook";
        const rules = provider === "outlook"
          ? (() => { try { const r = localStorage.getItem(OUTLOOK_DOMAIN_RULES_KEY); return r ? JSON.parse(r) as Record<string, DomainRule> : {}; } catch { return {}; } })()
          : (() => { try { const r = localStorage.getItem(NETEASE_DOMAIN_RULES_KEY); return r ? JSON.parse(r) as Record<string, DomainRule> : {}; } catch { return {}; } })();
        rules[domain] = { category: nextCategory, subCategory: email.subCategory };
        saveDomainRules(rules, provider);
      }
    }
  }

  useEffect(() => {
    if (isLoading || hasLoaded) return;

    const fetchEmails = async () => {
      const accessToken = await getValidAccessToken();
      const neteaseConfig = getNeteaseConfig();
      if (!accessToken && !neteaseConfig) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const allEmails: Email[] = [];

        if (accessToken) {
          let allMessages: any[] = [];
          let url: string | null = "https://graph.microsoft.com/v1.0/me/messages?$select=subject,from,receivedDateTime,bodyPreview,webLink,id&$orderby=receivedDateTime%20desc&$top=50";

          while (url) {
            const response = await fetch(url, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (response.status === 401) {
              const { clearStoredAuth } = await import("@/lib/outlookAuth");
              clearStoredAuth();
              setOutlookDisconnected(true);
              setError("Failed to load emails");
              setEmails([]);
              window.location.href = "/settings";
              return;
            }

            if (!response.ok) {
              // eslint-disable-next-line no-console
              console.error("Failed to fetch Outlook messages", await response.text());
              setError("Failed to load emails");
              setEmails([]);
              return;
            }

            const data = await response.json() as { value: any[]; "@odata.nextLink"?: string };
            allMessages = allMessages.concat(data.value ?? []);
            url = data["@odata.nextLink"] ?? null;
          }

          const deduped = dedupeMessages(allMessages);
          allEmails.push(...deduped.map((m) => mapGraphMessageToEmail(m)));
        }

        if (neteaseConfig) {
          const neteaseBase = (import.meta.env.VITE_BACKEND_BASE_URL || "").replace(/\/$/, "") || "";
          try {
            const res = await fetch(`${neteaseBase}/api/netease-emails`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: neteaseConfig.email,
                appPassword: neteaseConfig.appPassword,
                provider: neteaseConfig.provider,
              }),
            });
            if (res.ok) {
              const data = (await res.json()) as { emails?: any[] };
              const list = data.emails ?? [];
              for (const m of list) {
                allEmails.push(mapNeteaseItemToEmail(m));
              }
            } else {
              const text = await res.text();
              let reason = "request failed";
              try {
                const j = JSON.parse(text) as { reason?: string };
                if (j.reason) reason = j.reason;
              } catch (_) {}
              toast.error(`NetEase: ${reason}`);
            }
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            toast.error(`NetEase: ${msg}`);
          }
        }

        allEmails.sort((a, b) => new Date(b.receivedDateTime ?? b.timestamp).getTime() - new Date(a.receivedDateTime ?? a.timestamp).getTime());
        const dedupedAll = dedupeEmails(allEmails);
        setEmails(dedupedAll);
        setHasLoaded(true);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error while fetching emails", err);
        setError("Failed to load emails");
        setEmails([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchEmails();
  }, [isLoading, hasLoaded]);

  const handleRetry = () => {
    setHasLoaded(false);
    setError(null);
    setOutlookDisconnected(false);
    window.location.reload();
  };

  const handleTranslateClick = useCallback((email: Email) => {
    setExpandedId((prev) => (prev === email.id ? null : email.id));
  }, []);

  const filtered = (() => {
    let list = emails;
    if (category) {
      list = list.filter((e) => getEffectiveCategory(e) === categoryMap[category]);
      if (subParam) {
        list = list.filter((e) => e.subCategory === subParam);
      }
    }
    return list;
  })();

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
            {isLoading ? (
              <span className="font-mono text-xs text-muted-foreground">Loading emails...</span>
            ) : error ? (
              <div className="space-y-2">
                <span className="font-mono text-xs text-red-500">Failed to load emails</span>
                {outlookDisconnected && (
                  <div className="font-mono text-xs text-amber-600">Outlook 连接已失效，请重新连接。</div>
                )}
                <button
                  type="button"
                  onClick={handleRetry}
                  className="mt-1 border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-widest hover:bg-accent transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : (
              <span className="font-mono text-xs text-muted-foreground">No emails loaded</span>
            )}
          </div>
        ) : (
          filtered.map((email) => {
            const effectiveCategory = getEffectiveCategory(email);
            return (
              <EmailTableRow
                key={email.id}
                email={email}
                effectiveCategory={effectiveCategory}
                categoryLabels={{
                  Job: t(categoryTranslationMap.Job),
                  School: t(categoryTranslationMap.School),
                  "Orders / Travel": t(categoryTranslationMap["Orders / Travel"]),
                  "Ads / Subscriptions": t(categoryTranslationMap["Ads / Subscriptions"]),
                  Other: t(categoryTranslationMap.Other),
                }}
                onCategoryChange={handleCategoryChange}
                subCategory={email.subCategory}
                subCategoryLabelKeyMap={subCategoryLabelKeyMap}
                expanded={expandedId === email.id}
                hovered={hoveredId === email.id}
                onToggle={() => setExpandedId(expandedId === email.id ? null : email.id)}
                onHover={(h) => setHoveredId(h ? email.id : null)}
                onTranslateClick={handleTranslateClick}
                translateLabel={t("emailList.translate")}
                replyLabel={t("emailList.reply")}
                t={t}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

function EmailDetailPanel({ email }: { email: Email }) {
  const [fullBody, setFullBody] = useState<string | null>(null);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [isChinese, setIsChinese] = useState<boolean | null>(null);
  const [loadingBody, setLoadingBody] = useState(true);
  const [loadingTranslate, setLoadingTranslate] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [errorTranslate, setErrorTranslate] = useState<string | null>(null);
  const [errorSummary, setErrorSummary] = useState<string | null>(null);
  const [errorTranslateReason, setErrorTranslateReason] = useState<string | null>(null);
  const [errorSummaryReason, setErrorSummaryReason] = useState<string | null>(null);

  const from =
    email.from ?? `${email.sender} <${email.senderEmail}>`;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      let body: string;
      if (email.provider === "netease") {
        const config = getNeteaseConfig();
        if (!config || cancelled) {
          if (!cancelled) setLoadingBody(false);
          return;
        }
        try {
          body = await fetchNetEaseEmailBody(email.id, config);
        } catch (err) {
          if (!cancelled) {
            setFullBody("");
            toast.error(err instanceof Error ? err.message : String(err));
          }
          setLoadingBody(false);
          return;
        }
      } else {
        const token = await getValidAccessToken();
        if (!token || cancelled) {
          if (!cancelled) setLoadingBody(false);
          return;
        }
        try {
          body = await fetchFullEmailBody(email.id, token);
        } catch {
          if (!cancelled) setFullBody("");
          setLoadingBody(false);
          return;
        }
      }
      if (cancelled) return;
      setFullBody(body);

      try {
        const cachedTrans = getCachedTranslation(email.id);
        const cachedSum = getCachedSummary(email.id);
        if (cachedTrans) {
          setTranslatedText(cachedTrans.translatedText);
          setIsChinese(cachedTrans.originalLanguage === "zh");
        }
        if (cachedSum) setSummaryText(cachedSum.summaryText);

        if (!cachedTrans) {
          setLoadingTranslate(true);
          setErrorTranslate(null);
          setErrorTranslateReason(null);
          const lang = detectEmailLanguage(body);
          setIsChinese(lang === "zh");
          if (lang === "zh") {
            setCachedTranslation(email.id, {
              translatedText: "",
              originalLanguage: "zh",
              createdAt: new Date().toISOString(),
            });
            setLoadingTranslate(false);
          } else {
            try {
              const translated = await translateEmailContent(body);
              if (cancelled) return;
              setTranslatedText(translated);
              setCachedTranslation(email.id, {
                translatedText: translated,
                originalLanguage: "other",
                createdAt: new Date().toISOString(),
              });
            } catch (err) {
              if (!cancelled) {
                setErrorTranslate("翻译失败，请重试");
                setErrorTranslateReason(err instanceof Error ? err.message : String(err));
              }
            }
          }
          setLoadingTranslate(false);
        }

        if (!cachedSum) {
          setLoadingSummary(true);
          setErrorSummary(null);
          setErrorSummaryReason(null);
          try {
            const summary = await summarizeEmail(body, email.subject, from);
            if (cancelled) return;
            setSummaryText(summary);
            setCachedSummary(email.id, {
              summaryText: summary,
              createdAt: new Date().toISOString(),
            });
          } catch (err) {
            if (!cancelled) {
              setErrorSummary("总结失败，请重试");
              setErrorSummaryReason(err instanceof Error ? err.message : String(err));
            }
          }
          setLoadingSummary(false);
        }
      } catch (_) {
        // ignore
      } finally {
        if (!cancelled) setLoadingBody(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [email.id, email.subject, from]);

  return (
    <div className="px-4 pb-3 space-y-3 border-t border-border pt-3 mt-1">
      <div className="flex gap-2">
        {email.webLink && (
          <a
            href={email.webLink}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:bg-accent transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            在 Outlook 中打开
          </a>
        )}
      </div>

      {loadingBody ? (
        <p className="font-mono text-xs text-muted-foreground">加载正文...</p>
      ) : (
        <>
          <div>
            <p className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
              原文
            </p>
            <div className="font-mono text-xs text-foreground whitespace-pre-wrap break-words border border-border p-3 bg-muted/30 max-h-48 overflow-y-auto">
              {fullBody != null
                ? fullBody
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
                    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
                    .replace(/<br\s*\/?>/gi, "\n")
                    .replace(/<\/p>/gi, "\n")
                    .replace(/<[^>]+>/g, "")
                    .replace(/&nbsp;/g, " ")
                    .replace(/&amp;/g, "&")
                    .replace(/&lt;/g, "<")
                    .replace(/&gt;/g, ">")
                    .replace(/&quot;/g, '"')
                    .trim()
                : ""}
            </div>
          </div>

          <div>
            <p className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
              翻译
            </p>
            {loadingTranslate && (
              <p className="font-mono text-xs text-muted-foreground">
                翻译中...
              </p>
            )}
            {errorTranslate && (
              <div>
                <p className="font-mono text-xs text-red-500">{errorTranslate}</p>
                {errorTranslateReason && (
                  <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{errorTranslateReason}</p>
                )}
              </div>
            )}
            {!loadingTranslate && !errorTranslate && isChinese === true && (
              <p className="font-mono text-xs text-muted-foreground">
                该邮件已是中文，无需翻译
              </p>
            )}
            {!loadingTranslate && !errorTranslate && translatedText && (
              <div className="font-mono text-xs text-foreground whitespace-pre-wrap break-words border border-border p-3 bg-muted/30 max-h-48 overflow-y-auto">
                {translatedText}
              </div>
            )}
          </div>

          <div>
            <p className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
              AI 总结
            </p>
            {loadingSummary && (
              <p className="font-mono text-xs text-muted-foreground">
                总结中...
              </p>
            )}
            {errorSummary && (
              <div>
                <p className="font-mono text-xs text-red-500">{errorSummary}</p>
                {errorSummaryReason && (
                  <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{errorSummaryReason}</p>
                )}
              </div>
            )}
            {summaryText && !loadingSummary && (
              <div className="font-mono text-xs text-foreground whitespace-pre-wrap break-words border border-border p-3 bg-muted/30">
                {summaryText}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function EmailTableRow({
  email,
  effectiveCategory,
  categoryLabels,
  onCategoryChange,
  subCategory,
  subCategoryLabelKeyMap,
  expanded,
  hovered,
  onToggle,
  onHover,
  onTranslateClick,
  translateLabel,
  replyLabel,
  t,
}: {
  email: Email;
  effectiveCategory: Category;
  categoryLabels: Record<Category, string>;
  onCategoryChange: (emailId: string, category: Category) => void;
  subCategory?: SubCategory;
  subCategoryLabelKeyMap: Record<SubCategory, TranslationKey>;
  expanded: boolean;
  hovered: boolean;
  onToggle: () => void;
  onHover: (h: boolean) => void;
  onTranslateClick: (email: Email) => void;
  translateLabel: string;
  replyLabel: string;
  t: (key: TranslationKey) => string;
}) {
  const time = new Date(email.timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const isExpandable = !!email.orderData;
  const canOpenInOutlook = Boolean(email.webLink);
  const showDetailPanel = expanded && !email.orderData;
  const hasCachedTranslation = !!getCachedTranslation(email.id);

  const handleTranslate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTranslateClick(email);
  };

  const handleOpenInOutlook = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (email.webLink) window.open(email.webLink, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="border-b border-border last:border-b-0"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <div
        className={`px-4 py-2.5 grid gap-x-3 items-start ${
          isExpandable || canOpenInOutlook ? "cursor-pointer" : ""
        }`}
        style={{ gridTemplateColumns: "50px 1fr 160px 100px 80px" }}
        onClick={() => {
          if (canOpenInOutlook && email.webLink) {
            window.open(email.webLink, "_blank", "noopener,noreferrer");
            return;
          }
          onToggle();
        }}
      >
        <span className="font-mono text-xs text-muted-foreground pt-0.5 flex flex-col gap-0.5">
          {time}
          {email.provider && (
            <span className="text-[10px] text-muted-foreground/70">
              {email.provider === "netease" ? "网易" : "Outlook"}
            </span>
          )}
        </span>
        <div className="min-w-0">
          <p className="font-mono text-sm truncate">{email.subject}</p>
          <p className="font-mono text-xs text-muted-foreground truncate">
            {email.sender}
          </p>
          <p className="font-mono text-xs text-muted-foreground/60 mt-0.5 line-clamp-1">
            {email.summary}
          </p>
        </div>
        <div
          className="pt-0.5 space-y-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <select
            value={effectiveCategory}
            onChange={(e) =>
              onCategoryChange(email.id, e.target.value as Category)
            }
            className="w-full max-w-[160px] border border-border bg-background px-2 py-1 font-mono text-[10px] text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {(
              [
                "Job",
                "School",
                "Orders / Travel",
                "Ads / Subscriptions",
                "Other",
              ] as Category[]
            ).map((c) => (
              <option key={c} value={c}>
                {categoryLabels[c]}
              </option>
            ))}
          </select>
          {subCategory && (
            <span className="font-mono text-[10px] text-muted-foreground block truncate">
              {t(subCategoryLabelKeyMap[subCategory])}
            </span>
          )}
        </div>
        <div className="pt-0.5">
          <PriorityBadge priority={email.priority} />
        </div>
        <div
          className="text-right pt-0.5 flex flex-col gap-0.5 items-end"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={handleTranslate}
            className="font-mono text-[10px] underline text-muted-foreground hover:text-foreground"
          >
            {hasCachedTranslation ? "已翻译" : "翻译"}
          </button>
          {canOpenInOutlook && (
            <button
              type="button"
              onClick={handleOpenInOutlook}
              className="font-mono text-[10px] underline text-muted-foreground hover:text-foreground"
            >
              在 Outlook 中打开
            </button>
          )}
          <button className="font-mono text-[10px] underline text-muted-foreground hover:text-foreground">
            {replyLabel}
          </button>
        </div>
      </div>
      {expanded && email.orderData && (
        <div className="px-4 pb-3">
          <OrderDetail data={email.orderData} />
        </div>
      )}
      {showDetailPanel && <EmailDetailPanel email={email} />}
    </div>
  );
}

function dedupeMessages(messages: any[]): any[] {
  const seenIds = new Set<string>();
  const seenKeys = new Set<string>();
  const result: any[] = [];

  for (const m of messages) {
    const id = m.id as string | undefined;
    const fromAddr = m.from?.emailAddress?.address ?? "";
    const received = m.receivedDateTime ?? "";
    const subject = m.subject ?? "";
    const key = `${subject}|${fromAddr}|${received}`;
    const bodyPreview = (m.bodyPreview ?? "").slice(0, 200);

    if (id && seenIds.has(id)) continue;
    if (seenKeys.has(key)) continue;

    if (id) seenIds.add(id);
    seenKeys.add(id ?? `noid:${key}:${bodyPreview}`);
    result.push(m);
  }
  return result;
}

function dedupeEmails(emails: Email[]): Email[] {
  const seen = new Set<string>();
  const result: Email[] = [];
  for (const e of emails) {
    const primary = `${e.provider ?? "outlook"}:${e.id}`;
    const fallback = `${e.subject}|${e.senderEmail}|${e.receivedDateTime ?? e.timestamp}`;
    if (seen.has(primary)) continue;
    if (seen.has(`key:${fallback}`)) continue;
    seen.add(primary);
    seen.add(`key:${fallback}`);
    result.push(e);
  }
  return result;
}

function mapNeteaseItemToEmail(m: {
  id: string;
  subject: string;
  from: string;
  sender: string;
  senderEmail: string;
  receivedDateTime: string;
  bodyPreview?: string;
}): Email {
  const bodyPreview = m.bodyPreview ?? "";
  const { category, subCategory } = classifyEmail(m.subject, bodyPreview, m.sender, m.senderEmail);
  const priority = inferPriorityFromMessage(m.subject, bodyPreview);
  return {
    id: m.id,
    provider: "netease",
    subject: m.subject,
    from: m.from,
    receivedDateTime: m.receivedDateTime,
    bodyPreview,
    sender: m.sender,
    senderEmail: m.senderEmail,
    category,
    subCategory,
    priority,
    summary: bodyPreview,
    timestamp: m.receivedDateTime,
  };
}

function mapGraphMessageToEmail(message: any): Email {
  const fromAddr = message.from?.emailAddress;
  const subject: string = message.subject ?? "(no subject)";
  const senderName: string = fromAddr?.name ?? "(unknown sender)";
  const senderEmail: string = fromAddr?.address ?? "";
  const webLink: string | undefined = message.webLink ?? undefined;

  const bodyPreview: string = message.bodyPreview ?? "";
  const received: string = message.receivedDateTime ?? new Date().toISOString();

  const { category, subCategory } = classifyEmail(subject, bodyPreview, senderName, senderEmail);
  const priority: "urgent" | "important" | "normal" | "ignore" = inferPriorityFromMessage(subject, bodyPreview);

  return {
    id: message.id ?? crypto.randomUUID(),
    provider: "outlook",
    subject,
    from: `${senderName} <${senderEmail}>`,
    receivedDateTime: received,
    bodyPreview,
    webLink,
    sender: senderName,
    senderEmail,
    category,
    subCategory,
    priority,
    summary: bodyPreview,
    timestamp: received,
  };
}

/** Priority: learning rules (domain) > keyword rules > Other */
function classifyEmail(subject: string, bodyPreview: string, sender: string, senderEmail: string): { category: Category; subCategory?: SubCategory } {
  const text = `${subject} ${bodyPreview} ${sender} ${senderEmail}`.toLowerCase();
  const domain = extractDomain(senderEmail || sender || "");

  const domainRules = loadDomainRules();
  if (domain && domainRules[domain]) {
    return domainRules[domain];
  }

  // Job + subcategories
  if (/(interview|面试)/.test(text)) return { category: "Job", subCategory: "Interview" };
  if (/(application|apply|投递|申请)/.test(text)) return { category: "Job", subCategory: "Application" };
  if (/(assessment|oa\b|online assessment)/.test(text)) return { category: "Job", subCategory: "OA" };
  if (/(offer|录用|签约)/.test(text)) return { category: "Job", subCategory: "Offer" };
  if (/(rejection|regret|不再考虑|很遗憾)/.test(text)) return { category: "Job", subCategory: "Rejection" };
  if (/(recruiter|猎头|hr\b)/.test(text)) return { category: "Job", subCategory: "Recruiter" };
  if (/(job\b|hiring|linkedin|greenhouse)/.test(text)) return { category: "Job" };

  // School + subcategories
  if (/(course|课程|module)/.test(text)) return { category: "School", subCategory: "Course" };
  if (/(deadline|ddl|截止)/.test(text)) return { category: "School", subCategory: "Deadline" };
  if (/(exam|测验|考试)/.test(text)) return { category: "School", subCategory: "Exam" };
  if (/(event|活动|seminar)/.test(text)) return { category: "School", subCategory: "Events" };
  if (/(university|student|canvas|registrar|professor|lecturer|manchester)/.test(text)) return { category: "School" };

  // Orders + subcategories
  if (/(refund|退货|退款)/.test(text)) return { category: "Orders / Travel", subCategory: "Refund" };
  if (/(invoice|receipt|账单|对账)/.test(text)) return { category: "Orders / Travel", subCategory: "Bills" };
  if (/(flight|hotel|airline|ticket|行程|itinerary|booking)/.test(text)) return { category: "Orders / Travel", subCategory: "Travel" };
  if (/(order\b|订单|shipped|delivery|快递|发货|amazon)/.test(text)) return { category: "Orders / Travel", subCategory: "Ecommerce" };
  if (/(order\b|shipped|delivery|receipt|payment)/.test(text)) return { category: "Orders / Travel" };

  // Ads + subcategories
  if (/(newsletter|digest)/.test(text)) return { category: "Ads / Subscriptions", subCategory: "Newsletter" };
  if (/(promotion|sale\b|discount|限时|优惠)/.test(text)) return { category: "Ads / Subscriptions", subCategory: "Promotion" };
  if (/(subscribe|marketing|advertising|medium|ft\b)/.test(text)) return { category: "Ads / Subscriptions" };

  return { category: "Other" };
}

function inferPriorityFromMessage(subject: string, bodyPreview: string): "urgent" | "important" | "normal" | "ignore" {
  const text = `${subject} ${bodyPreview}`.toLowerCase();

  if (/(password|security|urgent|asap|action required)/.test(text)) return "urgent";
  if (/(interview|offer|flight|booking|invoice|payment)/.test(text)) return "important";
  if (/(newsletter|digest|sale|promotion|offer)/.test(text)) return "ignore";

  return "normal";
}
