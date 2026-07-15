import { getStore } from "@netlify/blobs";

// GET /api/check-code?code=XXXXXX
// Returns { valid: true, used: false }  -> card exists and hasn't been scratched
// Returns { valid: true, used: true }   -> card exists but was already scratched
// Returns { valid: false }              -> code doesn't exist in the batch at all

export default async (req) => {
  const url = new URL(req.url);
  const code = (url.searchParams.get("code") || "").trim().toUpperCase();

  if (!code) {
    return new Response(JSON.stringify({ error: "missing code" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const store = getStore("scratch-codes");
  const record = await store.get(code, { type: "json" });

  if (!record) {
    return new Response(JSON.stringify({ valid: false }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ valid: true, used: !!record.used }), {
    headers: { "Content-Type": "application/json" }
  });
};
