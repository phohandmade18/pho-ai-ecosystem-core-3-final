import { json, supabase } from "./lib/core4-supabase.mjs";

export default async () => {
  try {
    const [content, kpi, ai, logs] = await Promise.all([
      supabase("content_items?select=id,status,scheduled_at&order=created_at.desc&limit=200"),
      supabase("kpi_daily?select=provider,metric_date,metrics,captured_at&order=metric_date.desc&limit=100"),
      supabase("ai_history?select=feature,estimated_cost_usd,created_at&order=created_at.desc&limit=100"),
      supabase("activity_logs?select=event_type,level,message,created_at&order=created_at.desc&limit=20")
    ]);

    const today = new Date().toISOString().slice(0, 10);
    const contentRows = Array.isArray(content) ? content : [];
    const aiRows = Array.isArray(ai) ? ai : [];
    const kpiRows = Array.isArray(kpi) ? kpi : [];

    const summary = {
      drafts: contentRows.filter(x => x.status === "draft").length,
      scheduled: contentRows.filter(x => x.status === "scheduled").length,
      published: contentRows.filter(x => x.status === "published").length,
      aiCallsToday: aiRows.filter(x => String(x.created_at || "").startsWith(today)).length,
      aiCostUsd: aiRows.reduce((s, x) => s + Number(x.estimated_cost_usd || 0), 0)
    };

    return json(200, {
      version: "4.0-sprint-1-fix1",
      summary,
      latestKpi: kpiRows.slice(0, 20),
      recentLogs: Array.isArray(logs) ? logs : [],
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    return json(500, { error: error.message, version: "4.0-sprint-1-fix1" });
  }
};
