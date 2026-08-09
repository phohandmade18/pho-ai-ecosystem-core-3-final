import { sb } from "./supabase.mjs";
import { decrypt } from "./crypto.mjs";
import { metaConfig } from "./meta-config.mjs";

export async function facebookConnections() {
  const rows = await sb(
    "oauth_connections?provider=eq.facebook&status=eq.connected&order=updated_at.desc&select=*"
  );
  return (rows || []).map(row => ({
    ...row,
    access_token: decrypt(row.access_token_encrypted)
  }));
}

function graphError(body, status) {
  return body?.error?.message || body?.message || `Facebook Graph HTTP ${status}`;
}

export async function graph(path, token, params = {}) {
  const { graphVersion } = metaConfig();
  const url = new URL(`https://graph.facebook.com/${graphVersion}/${path.replace(/^\/+/, "")}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  });
  url.searchParams.set("access_token", token);

  const response = await fetch(url);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(graphError(body, response.status));
    error.status = response.status;
    error.facebook = body?.error || body;
    throw error;
  }
  return body;
}

export async function tryGraph(path, token, params = {}) {
  try {
    return { ok: true, data: await graph(path, token, params) };
  } catch (error) {
    return {
      ok: false,
      error: error.message,
      code: error.facebook?.code,
      subcode: error.facebook?.error_subcode
    };
  }
}

export function response(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

export function postMetrics(post = {}) {
  return {
    reactions: Number(post.reactions?.summary?.total_count || 0),
    comments: Number(post.comments?.summary?.total_count || 0),
    shares: Number(post.shares?.count || 0)
  };
}
