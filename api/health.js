import { getGeminiKey } from "./lib.js";

export function GET() {
  return Response.json({
    ok: true,
    hasGeminiKey: !!getGeminiKey(),
    runtime: "vercel",
  });
}
