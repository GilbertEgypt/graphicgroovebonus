import { getStore } from "@netlify/blobs";

// POST /api/use-code   body: { "code": "XXXXXX" }
// Marks a code as used, atomically. Returns success:false if it was
// already used or doesn't exist, so the card can't be replayed.

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method not allowed" }), { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid body" }), { status: 400 });
  }

  const code = (body.code || "").trim().toUpperCase();
  if (!code) {
    return new Response(JSON.stringify({ error: "missing code" }), { status: 400 });
  }

  const store = getStore("scratch-codes");
  const record = await store.get(code, { type: "json" });

  if (!record) {
    return new Response(JSON.stringify({ success: false, reason: "invalid code" }), { status: 404 });
  }
  if (record.used) {
    return new Response(JSON.stringify({ success: false, reason: "already used" }), { status: 409 });
  }

  await store.setJSON(code, {
    ...record,
    used: true,
    usedAt: new Date().toISOString()
  });

  return new Response(JSON.stringify({ success: true, prize: record.prize }), {
    headers: { "Content-Type": "application/json" }
  });
};

export const config = { path: "/api/use-code" };
