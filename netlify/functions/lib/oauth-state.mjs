import { randomState } from './crypto.mjs';
import { sb } from './supabase.mjs';
export async function issueState(provider){
  const state=randomState(),expires_at=new Date(Date.now()+10*60*1000).toISOString();
  await sb('oauth_states',{method:'POST',body:{provider,state,expires_at}});
  return state;
}
export async function consumeState(provider,state){
  const rows=await sb(`oauth_states?provider=eq.${encodeURIComponent(provider)}&state=eq.${encodeURIComponent(state)}&select=*`);
  const row=rows?.[0];
  if(!row||new Date(row.expires_at)<new Date()) throw new Error('OAuth state is invalid or expired');
  await sb(`oauth_states?id=eq.${row.id}`,{method:'DELETE'});
}
