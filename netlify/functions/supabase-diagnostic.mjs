import{json,err}from'./lib/http.mjs';
import{sbHealth,sb}from'./lib/supabase.mjs';

export default async()=>{
  try{
    const probe=await sbHealth();
    if(!probe.ok) return err('Không xác thực được Supabase',401,probe);

    const tables={};
    for(const name of[
      'oauth_states',
      'oauth_connections',
      'metric_snapshots',
      'strategy_findings',
      'executive_briefs',
      'ai_usage',
      'activity_logs'
    ]){
      try{
        const rows=await sb(`${name}?select=id&limit=1`);
        tables[name]={ok:true,count:Array.isArray(rows)?rows.length:0};
      }catch(error){
        tables[name]={ok:false,error:error.message};
      }
    }

    return json({ok:true,version:'2.1',probe,tables});
  }catch(error){
    return err(error.message,500);
  }
};
