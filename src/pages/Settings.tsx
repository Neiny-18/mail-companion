import { useEffect, useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { clearStoredAuth, getStoredAuth, getRedirectUri } from "@/lib/outlookAuth";

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
  const [neteaseEmail, setNeteaseEmail] = useState(() => localStorage.getItem("netease_email") ?? "");
  const [neteasePassword, setNeteasePassword] = useState("");
  const [neteaseProvider, setNeteaseProvider] = useState<"163" | "126">(() =>
    localStorage.getItem("netease_provider") === "126" ? "126" : "163"
  );
  const { t } = useLanguage();

  const isNeteaseConnected = Boolean(localStorage.getItem("netease_email") && localStorage.getItem("netease_app_password"));

  const msClientId = import.meta.env.VITE_MS_CLIENT_ID as string | undefined;
  const msTenantId = import.meta.env.VITE_MS_TENANT_ID as string | undefined;

  const hasOutlookConfig = Boolean(msClientId && msTenantId);

  const handleConnectOutlook = async () => {
    if (!hasOutlookConfig) return;

    // Clear previous stored token to force re-login with new scopes
    sessionStorage.removeItem("outlook_token");

    const { codeVerifier, codeChallenge } = await createPkcePair();

    // Store verifier for later token exchange
    sessionStorage.setItem("outlook_pkce_code_verifier", codeVerifier);

    const params = new URLSearchParams({
      client_id: msClientId!,
      response_type: "code",
      redirect_uri: getRedirectUri(),
      response_mode: "query",
      scope: "openid profile offline_access User.Read Mail.Read",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    const authorizeUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
    window.location.href = authorizeUrl;
  };

  const handleDisconnectOutlook = () => {
    sessionStorage.removeItem("outlook_token");
    sessionStorage.removeItem("outlook_pkce_code_verifier");
    clearStoredAuth();
    localStorage.removeItem("outlook_category_overrides");
    localStorage.removeItem("outlook_domain_category_rules");
    window.location.href = "/settings";
  };

  const handleConnectNetease = (e: React.FormEvent) => {
    e.preventDefault();
    const email = neteaseEmail.trim();
    const pass = neteasePassword.trim();
    if (!email || !pass) return;
    localStorage.setItem("netease_email", email);
    localStorage.setItem("netease_app_password", pass);
    localStorage.setItem("netease_provider", neteaseProvider);
    setNeteasePassword("");
    window.location.href = "/settings";
  };

  const handleDisconnectNetease = () => {
    localStorage.removeItem("netease_email");
    localStorage.removeItem("netease_app_password");
    localStorage.removeItem("netease_provider");
    localStorage.removeItem("netease_category_overrides");
    localStorage.removeItem("netease_domain_category_rules");
    setNeteaseEmail("");
    setNeteasePassword("");
    window.location.href = "/settings";
  };

  useEffect(() => {
    const handleAuthRedirect = async () => {
      if (!hasOutlookConfig) return;

      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      if (!code) {
        const existingToken = sessionStorage.getItem("outlook_token") || localStorage.getItem("outlook_token");
        const storedAuth = getStoredAuth();
        if (!existingToken && !storedAuth && hasOutlookConfig) {
          void handleConnectOutlook();
        }
        return;
      }

      const storedVerifier = sessionStorage.getItem("outlook_pkce_code_verifier");
      if (!storedVerifier) {
        // Cannot complete PKCE flow without verifier
        return;
      }

      try {
        const body = new URLSearchParams({
          client_id: msClientId!,
          scope: "openid profile offline_access User.Read Mail.Read",
          code,
          redirect_uri: getRedirectUri(),
          grant_type: "authorization_code",
          code_verifier: storedVerifier,
        });

        const tokenEndpoint = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
        const response = await fetch(tokenEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body,
        });

        if (!response.ok) {
          // eslint-disable-next-line no-console
          console.error("Failed to exchange code for tokens", await response.text());
          return;
        }

        const tokenData = (await response.json()) as {
          access_token?: string;
          refresh_token?: string;
          expires_in?: number;
        };
        const accessToken = tokenData.access_token;
        const refreshToken = tokenData.refresh_token;
        if (accessToken) {
          sessionStorage.setItem("outlook_token", accessToken);
          const expiresIn = tokenData.expires_in ?? 3600;
          const expiresAt = Date.now() + expiresIn * 1000 - 60_000;
          if (refreshToken) {
            const { setStoredAuth } = await import("@/lib/outlookAuth");
            setStoredAuth({
              access_token: accessToken,
              refresh_token: refreshToken,
              expires_at: expiresAt,
            });
          } else {
            localStorage.setItem("outlook_token", accessToken);
          }
        } else {
          // eslint-disable-next-line no-console
          console.error("No access_token in Outlook token response", tokenData);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error during Outlook token exchange", err);
      } finally {
        // Clear verifier and remove code from URL to avoid repeat exchanges
        sessionStorage.removeItem("outlook_pkce_code_verifier");
        url.searchParams.delete("code");
        window.history.replaceState({}, document.title, url.toString());
      }
    };

    void handleAuthRedirect();
  }, [hasOutlookConfig, msClientId, msTenantId]);

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

      <section className="border border-border p-5 mb-6">
        <h2 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-3">{t("settings.outlook")}</h2>
        <p className="font-mono text-xs text-muted-foreground mb-3">{t("settings.outlookDesc")}</p>
        {!hasOutlookConfig && (
          <p className="font-mono text-xs text-amber-600 mb-3">
            {t("settings.outlookMissingEnv")}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleConnectOutlook}
            disabled={!hasOutlookConfig}
            className={`border px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
              hasOutlookConfig
                ? "border-foreground hover:bg-foreground hover:text-background"
                : "border-border text-muted-foreground cursor-not-allowed"
            }`}
          >
            {t("settings.connectOutlook")}
          </button>
          <button
            type="button"
            onClick={handleDisconnectOutlook}
            className="border border-border px-4 py-2 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:bg-accent transition-colors"
          >
            {t("settings.disconnectOutlook")}
          </button>
        </div>
      </section>

      <section className="border border-border p-5 mb-6">
        <h2 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-3">{t("settings.netease")}</h2>
        <p className="font-mono text-xs text-muted-foreground mb-3">{t("settings.neteaseDesc")}</p>
        <form onSubmit={handleConnectNetease} className="space-y-3 mb-3">
          <SettingsField
            label={t("settings.neteaseEmail")}
            value={neteaseEmail}
            onChange={setNeteaseEmail}
            type="email"
            placeholder="user@163.com or user@126.com"
          />
          <SettingsField
            label={t("settings.neteaseAppPassword")}
            value={neteasePassword}
            onChange={setNeteasePassword}
            type="password"
            placeholder={isNeteaseConnected ? "••••••••" : "Authorization code / app password"}
          />
          <div>
            <label className="block font-mono text-xs text-muted-foreground mb-1">{t("settings.neteaseProvider")}</label>
            <select
              value={neteaseProvider}
              onChange={(e) => setNeteaseProvider(e.target.value as "163" | "126")}
              className="w-full border border-border bg-background px-3 py-2 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="163">163.com</option>
              <option value="126">126.com</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="border border-foreground px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
            >
              {t("settings.connectNetease")}
            </button>
            {isNeteaseConnected && (
              <button
                type="button"
                onClick={handleDisconnectNetease}
                className="border border-border px-4 py-2 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:bg-accent transition-colors"
              >
                {t("settings.disconnectNetease")}
              </button>
            )}
          </div>
        </form>
      </section>

      <button className="border border-foreground px-6 py-2 font-mono text-xs uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors">
        {t("settings.save")}
      </button>
    </div>
  );
}

function SettingsField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block font-mono text-xs text-muted-foreground mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-border bg-background px-3 py-2 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-ring"
      />
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

function generateCodeVerifier(length = 64): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const randomValues = new Uint32Array(length);
  window.crypto.getRandomValues(randomValues);

  let verifier = "";
  for (let i = 0; i < length; i += 1) {
    verifier += charset[randomValues[i] % charset.length];
  }
  return verifier;
}

async function sha256(input: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  return window.crypto.subtle.digest("SHA-256", data);
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = window.btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function createPkcePair(): Promise<{ codeVerifier: string; codeChallenge: string }> {
  const codeVerifier = generateCodeVerifier();
  const digest = await sha256(codeVerifier);
  const codeChallenge = base64UrlEncode(digest);
  return { codeVerifier, codeChallenge };
}
