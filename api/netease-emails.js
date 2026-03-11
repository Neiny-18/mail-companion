import { ImapFlow } from "imapflow";
import { getNeteaseHost, getNeteaseErrorReason, parseNeteaseEnvelope } from "./lib.js";

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

  if (!email || !appPassword) {
    return Response.json(
      {
        ok: false,
        error: "email and authorization code required",
        reason: "email and appPassword required",
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
    const list = [];
    try {
      const sinceDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const uids = await client.search({ since: sinceDate }, { uid: true });
      if (uids.length === 0) {
        return Response.json({ ok: true, emails: [] });
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
    return Response.json({ ok: true, emails: list });
  } catch (err) {
    const reason = getNeteaseErrorReason(err);
    return Response.json(
      {
        ok: false,
        error: "Failed to fetch NetEase emails",
        reason,
      },
      { status: 500 }
    );
  }
}
