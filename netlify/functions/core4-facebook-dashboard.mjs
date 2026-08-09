import { sb } from "./lib/supabase.mjs";
import { response } from "./lib/core4-facebook.mjs";

export default async () => {
  try {
    const [pages, posts, kpi] = await Promise.all([
      sb("facebook_pages?select=*&order=followers_count.desc"),
      sb("facebook_posts?select=*&order=created_time.desc&limit=50"),
      sb("kpi_daily?provider=eq.facebook&select=*&order=captured_at.desc&limit=100")
    ]);

    const summary = (pages || []).reduce((acc, page) => {
      acc.pages += 1;
      acc.followers += Number(page.followers_count || 0);
      acc.fans += Number(page.fan_count || 0);
      return acc;
    }, { pages: 0, followers: 0, fans: 0 });

    const recent = (posts || []).slice(0, 25);
    summary.recentPosts = recent.length;
    summary.recentReactions = recent.reduce((s,x)=>s+Number(x.reactions_count||0),0);
    summary.recentComments = recent.reduce((s,x)=>s+Number(x.comments_count||0),0);
    summary.recentShares = recent.reduce((s,x)=>s+Number(x.shares_count||0),0);

    return response(200, {
      version: "4.0-sprint-2-facebook",
      summary,
      pages: pages || [],
      recentPosts: recent,
      kpi: kpi || [],
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    return response(500, { error: error.message });
  }
};
