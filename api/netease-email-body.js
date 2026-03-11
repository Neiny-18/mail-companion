import { ImapFlow } from "imapflow";
import { getNeteaseHost, getNeteaseErrorReason, findTextPart } from "./lib.js";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const email = body?.email;
  const appPassword = body?.appPassword;
  const provider = body?.provider === "126" ? "126" : "163";
  const uidRaw = body?.uid;
  const uid = uidRaw != null ? parseInt(String(uidRaw), 10) : NaN;

  if (!email || !appPassword || (uidRaw == null || isNaN(uid))) {
    return Response.json(
      {
        ok: false,
        error: "email, authorization code and uid required",
        reason: "email, appPassword and uid required",
      },
      { status: 400 }
    );
  }

  const host = getNeteaseHost(provider);
  const client = new ImapFlow({
    host,
    port: 993,
    secure: true,
    auth: { user: email, pass: appPassword },
  });

  try {
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");
    let emailBody = "";
    try {
      const msg = await client.fetchOne(uid, { bodyStructure: true }, { uid: true });
      if (!msg || !msg.bodyStructure) {
        return Response.json(
          { ok: false, error: "Message not found", reason: "message not found" },
          { status: 404 }
        );
      }
      const partInfo = findTextPart(msg.bodyStructure, "1");
      if (partInfo) {
        const { content } = await client.download(uid, partInfo.path, { uid: true });
        const chunks = [];
        for await (const chunk of content) chunks.push(chunk);
        emailBody = Buffer.concat(chunks).toString("utf-8");
      }
    } finally {
      lock.release();
    }
    await client.logout();
    return Response.json({ ok: true, body: emailBody });
  } catch (err) {
    const reason = getNeteaseErrorReason(err);
    return Response.json(
      {
        ok: false,
        error: "Failed to fetch email body",
        reason,
      },
      { status: 500 }
    );
  }
}
