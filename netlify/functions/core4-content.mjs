import { json, supabase } from "./lib/core4-supabase.mjs";

export default async (request) => {
  try {
    if (request.method === "GET") {
      const rows = await supabase("content_items?select=*&order=created_at.desc&limit=100");
      return json(200, { items: rows || [] });
    }

    if (request.method !== "POST") return json(405, { error: "Method not allowed" });

    const payload = await request.json();
    const item = {
      title: payload.title || null,
      topic: payload.topic || null,
      platform: payload.platform || null,
      content_type: payload.contentType || null,
      status: payload.status || "draft",
      body: payload.body || "",
      metadata: payload.metadata || {},
      scheduled_at: payload.scheduledAt || null
    };

    const rows = await supabase("content_items", {
      method: "POST",
      body: item,
      headers: { Prefer: "return=representation" }
    });
    return json(201, { item: Array.isArray(rows) ? rows[0] : rows });
  } catch (error) {
    return json(500, { error: error.message });
  }
};
