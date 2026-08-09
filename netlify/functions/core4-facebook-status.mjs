import { response, facebookConnections } from "./lib/core4-facebook.mjs";
import { supabaseConfigSummary } from "./lib/supabase.mjs";
import { metaConfig } from "./lib/meta-config.mjs";

export default async () => {
  try {
    const sb = supabaseConfigSummary();
    const meta = metaConfig();
    const connections = await facebookConnections();

    const checks = [
      { key: "FACEBOOK_APP_ID", ok: !!meta.appId, detail: meta.appId ? "Đã cấu hình" : "Thiếu" },
      { key: "FACEBOOK_APP_SECRET", ok: !!meta.appSecret, detail: meta.appSecret ? "Đã cấu hình" : "Thiếu" },
      { key: "FACEBOOK_REDIRECT_URI", ok: !!meta.redirectUri, detail: meta.redirectUri || "Thiếu" },
      { key: "APP_BASE_URL", ok: !!meta.appBaseUrl, detail: meta.appBaseUrl || "Thiếu" },
      { key: "SUPABASE_SERVER_KEY", ok: sb.serverKeyPresent, detail: sb.serverKeyType },
      { key: "FACEBOOK_CONNECTION", ok: connections.length > 0, detail: `${connections.length} Page đã lưu token` }
    ];

    return response(200, {
      version: "4.0-sprint-2-facebook",
      ready: checks.every(x => x.ok),
      score: Math.round(checks.filter(x => x.ok).length / checks.length * 100),
      graphVersion: meta.graphVersion,
      checks,
      pages: connections.map(x => ({
        external_id: x.external_id,
        channel_name: x.channel_name,
        last_sync_at: x.last_sync_at,
        scopes: x.scopes || []
      })),
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    return response(500, { error: error.message, version: "4.0-sprint-2-facebook" });
  }
};
