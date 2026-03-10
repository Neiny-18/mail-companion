import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function SettingsPage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobPrefs, setJobPrefs] = useState({
    roles: "Frontend Engineer, Full-Stack Developer",
    locations: "San Francisco, Remote",
    salaryMin: "120000",
    keywords: "React, TypeScript, Node.js",
  });
  const [schoolPrefs, setSchoolPrefs] = useState({
    institution: "University of California",
    emailDomain: "university.edu",
    trackDeadlines: true,
    trackExams: true,
    trackEvents: false,
  });
  const { t } = useLanguage();

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-1">{t("settings.configuration")}</p>
        <h1 className="font-sans text-lg font-semibold">{t("settings.title")}</h1>
      </div>

      <section className="border border-border p-5 mb-6">
        <h2 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-3">{t("settings.resume")}</h2>
        <p className="font-mono text-xs text-muted-foreground mb-3">{t("settings.resumeDesc")}</p>
        <label className="block border border-dashed border-border p-4 text-center cursor-pointer hover:bg-accent transition-colors">
          <input type="file" accept=".pdf,.docx" className="hidden" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} />
          {resumeFile ? (
            <span className="font-mono text-xs">{resumeFile.name}</span>
          ) : (
            <span className="font-mono text-xs text-muted-foreground">{t("settings.uploadPrompt")}</span>
          )}
        </label>
      </section>

      <section className="border border-border p-5 mb-6">
        <h2 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-3">{t("settings.jobPreferences")}</h2>
        <div className="space-y-3">
          <SettingsField label={t("settings.targetRoles")} value={jobPrefs.roles} onChange={(v) => setJobPrefs({ ...jobPrefs, roles: v })} />
          <SettingsField label={t("settings.preferredLocations")} value={jobPrefs.locations} onChange={(v) => setJobPrefs({ ...jobPrefs, locations: v })} />
          <SettingsField label={t("settings.minimumSalary")} value={jobPrefs.salaryMin} onChange={(v) => setJobPrefs({ ...jobPrefs, salaryMin: v })} />
          <SettingsField label={t("settings.keywords")} value={jobPrefs.keywords} onChange={(v) => setJobPrefs({ ...jobPrefs, keywords: v })} />
        </div>
      </section>

      <section className="border border-border p-5 mb-6">
        <h2 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-3">{t("settings.schoolPreferences")}</h2>
        <div className="space-y-3">
          <SettingsField label={t("settings.institution")} value={schoolPrefs.institution} onChange={(v) => setSchoolPrefs({ ...schoolPrefs, institution: v })} />
          <SettingsField label={t("settings.emailDomain")} value={schoolPrefs.emailDomain} onChange={(v) => setSchoolPrefs({ ...schoolPrefs, emailDomain: v })} />
          <div className="space-y-2 pt-1">
            <SettingsToggle label={t("settings.trackDeadlines")} checked={schoolPrefs.trackDeadlines} onChange={(v) => setSchoolPrefs({ ...schoolPrefs, trackDeadlines: v })} />
            <SettingsToggle label={t("settings.trackExams")} checked={schoolPrefs.trackExams} onChange={(v) => setSchoolPrefs({ ...schoolPrefs, trackExams: v })} />
            <SettingsToggle label={t("settings.trackEvents")} checked={schoolPrefs.trackEvents} onChange={(v) => setSchoolPrefs({ ...schoolPrefs, trackEvents: v })} />
          </div>
        </div>
      </section>

      <button className="border border-foreground px-6 py-2 font-mono text-xs uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors">
        {t("settings.save")}
      </button>
    </div>
  );
}

function SettingsField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block font-mono text-xs text-muted-foreground mb-1">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-border bg-background px-3 py-2 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-ring" />
    </div>
  );
}

function SettingsToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className={`w-8 h-4 border border-border flex items-center transition-colors ${checked ? "bg-foreground" : "bg-background"}`} onClick={(e) => { e.preventDefault(); onChange(!checked); }}>
        <div className={`w-3 h-3 transition-all ${checked ? "ml-[calc(100%-12px)] bg-background" : "ml-0.5 bg-muted-foreground"}`} />
      </div>
      <span className="font-mono text-xs">{label}</span>
    </label>
  );
}
