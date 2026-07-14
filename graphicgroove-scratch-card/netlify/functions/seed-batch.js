import { getStore } from "@netlify/blobs";

// POST /api/seed-batch   body: { "count": 50, "secret": "your-secret" }
// Generates a batch of unique card codes with prizes already assigned,
// so the prize is locked in server-side and can't be tampered with
// from the browser. Returns the full list so you can turn them into
// QR codes / a printed batch.
//
// Protected by SEED_SECRET so randoms can't spam-generate codes on
// your live site. Set SEED_SECRET in Netlify's environment variables.

const PRIZES = [
  { id: "20off", label: "20% Off", desc: "your next project, booked within 30 days.", won: true },
  { id: "poster", label: "Free Extra Poster", desc: "one free poster or flyer design, worth up to R300.", won: true },
  { id: "r150", label: "R150 Voucher", desc: "toward any package or add-on service.", won: true },
  { id: "banner", label: "Free Social Banner", desc: "one free social media banner design, worth up to R300.", won: true },
  { id: "none", label: "No Reward", desc: "not a win this time — thanks for playing.", won: false }
];

function randomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid confusion
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function pickPrize() {
  return PRIZES[Math.floor(Math.random() * PRIZES.length)];
}

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

  if (!process.env.SEED_SECRET || body.secret !== process.env.SEED_SECRET) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  const count = Math.min(Math.max(parseInt(body.count) || 20, 1), 500);
  const store = getStore("scratch-codes");
  const results = [];

  for (let i = 0; i < count; i++) {
    let code;
    let exists;
    do {
      code = randomCode();
      exists = await store.get(code);
    } while (exists);

    const prize = pickPrize();
    await store.setJSON(code, {
      prize: { label: prize.label, desc: prize.desc, won: prize.won },
      used: false,
      createdAt: new Date().toISOString()
    });

    results.push({ code, prize: prize.label });
  }

  return new Response(JSON.stringify({ generated: results.length, codes: results }), {
    headers: { "Content-Type": "application/json" }
  });
};

export const config = { path: "/api/seed-batch" };
