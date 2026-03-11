import { getGeminiKey, stripHtmlToText } from "./lib.js";

const GEMINI_MODEL = "gemini-2.5-flash";

export async function POST(request) {
  const apiKey = getGeminiKey();
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

  if (!apiKey) {
    return Response.json(
      {
        ok: false,
        error: "Summary failed",
        reason: "GEMINI_API_KEY or GOOGLE_API_KEY not set in server environment",
      },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  let content = body?.content;
  if (content == null) content = "";
  if (typeof content !== "string") content = String(content);
  const subject = body?.subject ?? "";
  const from = body?.from ?? "";
  const text = stripHtmlToText(content).slice(0, 50000);

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
    const resBody = await response.text();

    if (!response.ok) {
      let reason = "request failed";
      try {
        const j = JSON.parse(resBody);
        if (j.error?.message) reason = j.error.message;
        else if (j.error?.status) reason = j.error.status;
      } catch (_) {}
      if (status === 400) reason = reason || "invalid model or request";
      if (status === 403) reason = reason || "quota exceeded or access denied";
      if (status === 404) reason = reason || "invalid model";
      return Response.json(
        { ok: false, error: "Summary failed", reason },
        { status: status >= 400 ? status : 500 }
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(resBody);
    } catch (e) {
      return Response.json(
        { ok: false, error: "Summary failed", reason: "response parse failed" },
        { status: 500 }
      );
    }

    const summary = parsed?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    if (!summary) {
      return Response.json(
        { ok: false, error: "Summary failed", reason: "empty model response" },
        { status: 500 }
      );
    }
    return Response.json({ ok: true, summaryText: summary });
  } catch (err) {
    return Response.json(
      { ok: false, error: "Summary failed", reason: err.message || "request failed" },
      { status: 500 }
    );
  }
}
