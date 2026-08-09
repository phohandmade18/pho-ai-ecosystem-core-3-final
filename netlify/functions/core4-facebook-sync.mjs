import { sb } from "./lib/supabase.mjs";
import { facebookConnections, graph, tryGraph, response, postMetrics } from "./lib/core4-facebook.mjs";

async function upsert(path, body, onConflict) {
  const q = onConflict ? `${path}?on_conflict=${encodeURIComponent(onConflict)}` : path;
  return sb(q, {
    method: "POST",
    body,
    headers: { Prefer: "resolution=merge-duplicates,return=representation" }
  });
}

export default async request => {
  try {
    if (request.method !== "POST") return response(405, { error: "Method not allowed" });

    const connections = await facebookConnections();
    if (!connections.length) return response(409, { error: "Facebook chưa kết nối" });

    const results = [];
    for (const connection of connections) {
      const page = await graph(connection.external_id, connection.access_token, {
        fields: "id,name,fan_count,followers_count,link"
      });

      await upsert("facebook_pages", {
        external_id: page.id,
        page_name: page.name || connection.channel_name || "Facebook Page",
        page_link: page.link || null,
        fan_count: Number(page.fan_count || 0),
        followers_count: Number(page.followers_count || 0),
        metadata: { source: "graph_api" },
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, "external_id");

      const postResult = await tryGraph(`${page.id}/posts`, connection.access_token, {
        fields: "id,message,created_time,permalink_url,reactions.limit(0).summary(true),comments.limit(0).summary(true),shares",
        limit: 25
      });

      let totals = { post_count: 0, reactions: 0, comments: 0, shares: 0 };
      if (postResult.ok) {
        const posts = postResult.data?.data || [];
        totals.post_count = posts.length;

        for (const post of posts) {
          const m = postMetrics(post);
          totals.reactions += m.reactions;
          totals.comments += m.comments;
          totals.shares += m.shares;

          await upsert("facebook_posts", {
            external_id: post.id,
            page_external_id: page.id,
            message: post.message || null,
            permalink_url: post.permalink_url || null,
            created_time: post.created_time || null,
            reactions_count: m.reactions,
            comments_count: m.comments,
            shares_count: m.shares,
            metadata: { source: "graph_api" },
            synced_at: new Date().toISOString()
          }, "external_id");
        }
      }

      const metrics = {
        fan_count: Number(page.fan_count || 0),
        followers_count: Number(page.followers_count || 0),
        recent_posts: totals.post_count,
        recent_reactions: totals.reactions,
        recent_comments: totals.comments,
        recent_shares: totals.shares
      };

      await sb("kpi_daily", {
        method: "POST",
        body: {
          provider: "facebook",
          account_id: page.id,
          metric_date: new Date().toISOString().slice(0, 10),
          metrics,
          captured_at: new Date().toISOString()
        }
      });

      await sb(`oauth_connections?id=eq.${connection.id}`, {
        method: "PATCH",
        body: { last_sync_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      });

      results.push({
        page: { id: page.id, name: page.name, link: page.link || null },
        metrics,
        posts: postResult.ok
          ? { ok: true, count: totals.post_count }
          : { ok: false, warning: postResult.error, code: postResult.code }
      });
    }

    await sb("activity_logs", {
      method: "POST",
      body: {
        event_type: "facebook_sync",
        source: "core4-facebook-sync",
        level: "info",
        message: `Đồng bộ ${results.length} Facebook Page`,
        payload: { pages: results.map(x => x.page.id) }
      }
    });

    return response(200, {
      ok: true,
      version: "4.0-sprint-2-facebook",
      pagesSynced: results.length,
      results,
      note: "Nếu posts.ok=false, Meta chưa cấp pages_read_user_content hoặc quyền liên quan cho app/token."
    });
  } catch (error) {
    try {
      await sb("activity_logs", {
        method: "POST",
        body: {
          event_type: "facebook_sync",
          source: "core4-facebook-sync",
          level: "error",
          message: error.message,
          payload: {}
        }
      });
    } catch {}
    return response(500, { error: error.message, version: "4.0-sprint-2-facebook" });
  }
};
