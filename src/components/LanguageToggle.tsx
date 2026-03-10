import { useLanguage } from "@/i18n/LanguageContext";

export function LanguageToggle() {
  const { lang, setLang, t } = useLanguage();

  return (
    <button
      onClick={() => setLang(lang === "en" ? "zh" : "en")}
      className="font-mono text-xs border border-border px-3 py-1 hover:bg-accent transition-colors"
    >
      {t("lang.toggle")}
    </button>
  );
}
