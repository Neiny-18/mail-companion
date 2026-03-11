import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env");

dotenv.config({ path: envPath });

console.log("[server] PID:", process.pid);
console.log("[server] env path:", envPath);
console.log("[server] GEMINI_API_KEY exists:", !!process.env.GEMINI_API_KEY);
console.log("[server] GOOGLE_API_KEY exists:", !!process.env.GOOGLE_API_KEY);

import express from "express";
import cors from "cors";
import { ImapFlow } from "imapflow";

const app = express();

/** CORS: allow local frontend + Vercel frontend. Set CORS_ORIGINS (comma-separated) on Railway. */
const corsOrigins = (process.env.CORS_ORIGINS || "http://localhost:8080,http://localhost:8081,http://127.0.0.1:8080")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (corsOrigins.includes(origin)) return cb(null, true);
      if (corsOrigins.some((o) => o.includes("*"))) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));

const GEMINI_MODEL = "gemini-2.5-flash";
const PORT = process.env.PORT || process.env.API_PORT || 3001;

/** GET /health - Railway health check */
app.get("/health", (_req, res) => {
  res.json({ ok: true, runtime: "railway" });
});

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    pid: process.pid,
    hasGeminiKey: !!getGeminiKey(),
    port: Number(PORT),
  });
});


function getGeminiKey() {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key || typeof key !== "string" || !key.trim()) {
    return null;
  }
  return key.trim();
}

function stripHtmlToText(html) {
  if (!html || typeof html !== "string") return "";
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

app.post("/api/translate-email", async (req, res) => {
  console.log("[translate-email] request received | PID:", process.pid, "| GEMINI_API_KEY:", !!process.env.GEMINI_API_KEY, "| GOOGLE_API_KEY:", !!process.env.GOOGLE_API_KEY);
  const apiKey = getGeminiKey();
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
  const log = (msg, data) => console.log("[translate]", msg, data !== undefined ? JSON.stringify(data).slice(0, 200) : "");

  log("request received");
  if (!apiKey) {
    log("error: API key missing");
    return res.status(500).json({
      ok: false,
      error: "API key missing",
      reason: "GEMINI_API_KEY or GOOGLE_API_KEY not set in server environment",
    });
  }

  let content = req.body?.content;
  if (content == null) content = "";
  if (typeof content !== "string") content = String(content);
  const text = stripHtmlToText(content).slice(0, 50000);
  log("body length", { raw: content.length, cleaned: text.length });

  const prompt = `Translate this email into clear and natural Chinese.
Preserve the important meaning, dates, actions, and structure.
Keep formatting simple and easy to read.

Email content:
${text}`;

  try {
    const response = await fetch(`${endpoint}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 8192 },
      }),
    });

    const status = response.status;
    const body = await response.text();
    log("response status", status);
    if (!response.ok) {
      log("response body (fail)", body.slice(0, 500));
      let reason = "request failed";
      try {
        const j = JSON.parse(body);
        if (j.error?.message) reason = j.error.message;
        else if (j.error?.status) reason = j.error.status;
      } catch (_) {}
      if (status === 400) reason = reason || "invalid model or request";
      if (status === 403) reason = reason || "quota exceeded or access denied";
      if (status === 404) reason = reason || "invalid model";
      return res.status(status >= 400 ? status : 500).json({
        ok: false,
        error: "Translation failed",
        reason,
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch (e) {
      log("parse error", e.message);
      return res.status(500).json({
        ok: false,
        error: "Translation failed",
        reason: "response parse failed",
      });
    }

    const translated =
      parsed?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    if (!translated) {
      log("empty candidate");
      return res.status(500).json({
        ok: false,
        error: "Translation failed",
        reason: "empty model response",
      });
    }
    return res.json({ ok: true, translatedText: translated });
  } catch (err) {
    log("exception", err.message);
    return res.status(500).json({
      ok: false,
      error: "Translation failed",
      reason: err.message || "request failed",
    });
  }
});

app.post("/api/summarize-email", async (req, res) => {
  console.log("[summarize-email] request received | PID:", process.pid, "| GEMINI_API_KEY:", !!process.env.GEMINI_API_KEY, "| GOOGLE_API_KEY:", !!process.env.GOOGLE_API_KEY);
  const apiKey = getGeminiKey();
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
  const log = (msg, data) => console.log("[summarize]", msg, data !== undefined ? JSON.stringify(data).slice(0, 200) : "");

  log("request received");
  if (!apiKey) {
    log("error: API key missing");
    return res.status(500).json({
      ok: false,
      error: "Summary failed",
      reason: "GEMINI_API_KEY or GOOGLE_API_KEY not set in server environment",
    });
  }

  let content = req.body?.content;
  if (content == null) content = "";
  if (typeof content !== "string") content = String(content);
  const subject = req.body?.subject ?? "";
  const from = req.body?.from ?? "";
  const text = stripHtmlToText(content).slice(0, 50000);
  log("body length", { raw: content.length, cleaned: text.length });

  const prompt = `Read this email and extract the most important actionable information in Chinese.

Return in this format:
事件:
来源:
时间:
需要动作:
一句话总结:

Email subject:
${subject}

Sender:
${from}

Email content:
${text}`;

  try {
    const response = await fetch(`${endpoint}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
      }),
    });

    const status = response.status;
    const body = await response.text();
    log("response status", status);
    if (!response.ok) {
      log("response body (fail)", body.slice(0, 500));
      let reason = "request failed";
      try {
        const j = JSON.parse(body);
        if (j.error?.message) reason = j.error.message;
        else if (j.error?.status) reason = j.error.status;
      } catch (_) {}
      if (status === 400) reason = reason || "invalid model or request";
      if (status === 403) reason = reason || "quota exceeded or access denied";
      if (status === 404) reason = reason || "invalid model";
      return res.status(status >= 400 ? status : 500).json({
        ok: false,
        error: "Summary failed",
        reason,
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch (e) {
      log("parse error", e.message);
      return res.status(500).json({
        ok: false,
        error: "Summary failed",
        reason: "response parse failed",
      });
    }

    const summary =
      parsed?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    if (!summary) {
      log("empty candidate");
      return res.status(500).json({
        ok: false,
        error: "Summary failed",
        reason: "empty model response",
      });
    }
    return res.json({ ok: true, summaryText: summary });
  } catch (err) {
    log("exception", err.message);
    return res.status(500).json({
      ok: false,
      error: "Summary failed",
      reason: err.message || "request failed",
    });
  }
});

/** NetEase IMAP: 163.com -> imap.163.com, 126.com -> imap.126.com. Port 993, SSL. */
function getNeteaseHost(provider) {
  if (provider === "126") return "imap.126.com";
  return "imap.163.com";
}

/** Map IMAP errors to safe, user-facing reasons (no secrets). Never throw. */
function getNeteaseErrorReason(err) {
  try {
    const msg = (err?.message || String(err)).toLowerCase();
    if (msg.includes("invalid") && (msg.includes("credential") || msg.includes("auth") || msg.includes("login")))
      return "invalid authorization code";
    if (msg.includes("authentication failed") || msg.includes("login failed")) return "invalid authorization code";
    if (msg.includes("econnrefused") || msg.includes("connection refused")) return "connection refused";
    if (msg.includes("etimedout") || msg.includes("timeout")) return "connection timeout";
    if (msg.includes("econnreset") || msg.includes("connection closed") || msg.includes("connection reset"))
      return "connection closed";
    if (msg.includes("imap") && msg.includes("not enabled")) return "IMAP not enabled";
    if (msg.includes("not supported") || msg.includes("unsupported")) return "unsupported provider";
    if (msg.includes("socket") && msg.includes("hang")) return "timeout connecting to mailbox";
    if (msg.includes("certificate") || msg.includes("tls") || msg.includes("ssl")) return "secure connection failed";
    return err?.message || "IMAP error";
  } catch {
    return "IMAP error";
  }
}

function parseNeteaseEnvelope(envelope) {
  const from = envelope?.from?.[0];
  const fromAddr = from?.address ?? "";
  const fromName = from?.name ?? fromAddr;
  const date = envelope?.date;
  const receivedDateTime = date ? new Date(date).toISOString() : new Date().toISOString();
  return {
    subject: envelope?.subject ?? "(no subject)",
    from: fromName ? `${fromName} <${fromAddr}>` : fromAddr,
    fromAddr,
    fromName,
    receivedDateTime,
  };
}

function findTextPart(node, path = "1", preferHtml = true) {
  if (!node) return null;
  if (node.type === "text") {
    if (node.subtype === "html") return { path, isHtml: true };
    if (node.subtype === "plain") return { path, isHtml: false };
  }
  if (node.childNodes) {
    let htmlPart = null;
    let plainPart = null;
    for (let i = 0; i < node.childNodes.length; i++) {
      const childPath = path === "1" ? `${i + 1}` : `${path}.${i + 1}`;
      const found = findTextPart(node.childNodes[i], childPath, preferHtml);
      if (found) {
        if (found.isHtml) htmlPart = found;
        else plainPart = found;
      }
    }
    if (preferHtml && htmlPart) return htmlPart;
    if (plainPart) return plainPart;
    return htmlPart;
  }
  return null;
}

/** NetEase requires authorization code (app password), not the normal mailbox password. */
app.post("/api/netease-emails", async (req, res) => {
  const log = (msg, d) => console.log("[netease-emails]", msg, d !== undefined ? String(d).slice(0, 100) : "");
  try {
    const email = req.body?.email;
    const appPassword = req.body?.appPassword; // NetEase authorization code / app password
    const provider = req.body?.provider === "126" ? "126" : "163";
    if (!email || !appPassword) {
      return res.status(400).json({ ok: false, error: "email and authorization code required", reason: "email and appPassword required" });
    }
    const host = getNeteaseHost(provider);
    const client = new ImapFlow({
      host,
      port: 993,
      secure: true,
      auth: { user: email, pass: appPassword },
    });
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");
    const list = [];
    try {
      const sinceDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const uids = await client.search({ since: sinceDate }, { uid: true });
      if (uids.length === 0) {
        return res.json({ ok: true, emails: [] });
      }
      const messages = await client.fetchAll(uids, { envelope: true }, { uid: true });
      for (const msg of messages) {
        const { subject, from, fromAddr, fromName, receivedDateTime } = parseNeteaseEnvelope(msg.envelope);
        list.push({
          id: `netease:${msg.uid}`,
          uid: msg.uid,
          provider: "netease",
          subject,
          from: `${fromName} <${fromAddr}>`,
          sender: fromName || fromAddr,
          senderEmail: fromAddr,
          receivedDateTime,
          bodyPreview: "",
          webLink: undefined,
        });
      }
    } finally {
      lock.release();
    }
    await client.logout();
    list.sort((a, b) => new Date(b.receivedDateTime) - new Date(a.receivedDateTime));
    return res.json({ ok: true, emails: list });
  } catch (err) {
    log("error", err?.message ?? err);
    const reason = getNeteaseErrorReason(err);
    return res.status(500).json({
      ok: false,
      error: "Failed to fetch NetEase emails",
      reason,
    });
  }
});

app.post("/api/netease-email-body", async (req, res) => {
  const log = (msg, d) => console.log("[netease-body]", msg, d !== undefined ? String(d).slice(0, 100) : "");
  try {
    const email = req.body?.email;
    const appPassword = req.body?.appPassword; // NetEase authorization code
    const provider = req.body?.provider === "126" ? "126" : "163";
    const uid = req.body?.uid;
    if (!email || !appPassword || uid == null) {
      return res.status(400).json({ ok: false, error: "email, authorization code and uid required", reason: "email, appPassword and uid required" });
    }
    const host = getNeteaseHost(provider);
    const client = new ImapFlow({
      host,
      port: 993,
      secure: true,
      auth: { user: email, pass: appPassword },
    });
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");
    let body = "";
    try {
      const msg = await client.fetchOne(uid, { bodyStructure: true }, { uid: true });
      if (!msg || !msg.bodyStructure) {
        return res.status(404).json({ ok: false, error: "Message not found", reason: "message not found" });
      }
      const partInfo = findTextPart(msg.bodyStructure, "1");
      if (partInfo) {
        const { content } = await client.download(uid, partInfo.path, { uid: true });
        const chunks = [];
        for await (const chunk of content) chunks.push(chunk);
        body = Buffer.concat(chunks).toString("utf-8");
      }
    } finally {
      lock.release();
    }
    await client.logout();
    return res.json({ ok: true, body });
  } catch (err) {
    log("error", err?.message ?? err);
    const reason = getNeteaseErrorReason(err);
    return res.status(500).json({
      ok: false,
      error: "Failed to fetch email body",
      reason,
    });
  }
});

app.listen(PORT, () => {
  console.log("[server] listening on http://localhost:" + PORT);
});
