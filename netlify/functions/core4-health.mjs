import { json, supabase } from "./lib/core4-supabase.mjs";

export default async () => {
  const checks = [];
  const add = (key, ok, detail) => checks.push({ key, ok, detail });

  add("SUPABASE_URL", !!process.env.SUPABASE_URL, process.env.SUPABASE_URL ? "Đã cấu hình" : "Thiếu");
  add("SUPABASE_KEY", !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY),
      process.env.SUPABASE_SERVICE_ROLE_KEY ? "service role (server only)" :
      process.env.SUPABASE_ANON_KEY ? "anon key" : "Thiếu");
  add("OPENAI_API_KEY", !!process.env.OPENAI_API_KEY, process.env.OPENAI_API_KEY ? "Đã cấu hình" : "Thiếu");
  add("OPENAI_MODEL", !!process.env.OPENAI_MODEL, process.env.OPENAI_MODEL || "Chưa đặt");

  try {
    await supabase("content_items?select=id&limit=1");
    add("DATABASE", true, "Kết nối Supabase thành công");
  } catch (error) {
    add("DATABASE", false, error.message);
  }

  const passed = checks.filter(x => x.ok).length;
  return json(200, {
    version: "4.0-sprint-1-fix1",
    ready: checks.every(x => x.ok),
    score: Math.round((passed / checks.length) * 100),
    checks,
    checkedAt: new Date().toISOString()
  });
};
