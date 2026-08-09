import{query}from'./lib/http.mjs';
import{consume}from'./lib/oauth.mjs';
import{saveConnection}from'./lib/tokens.mjs';
import{assertMetaConfig}from'./lib/meta-config.mjs';

const go=(base,params)=>Response.redirect(`${base}/?${new URLSearchParams(params)}`,302);
const messageOf=body=>body?.error?.message||body?.message||JSON.stringify(body);

export default async req=>{
  let base=String(process.env.APP_BASE_URL||'').trim().replace(/\/+$/,'')||'https://pho-ai-ecosystem.netlify.app';
  try{
    const config=assertMetaConfig({requireSecret:true});
    base=config.appBaseUrl;
    const{code,state,error,error_description}=query(req);
    if(error)throw new Error(error_description||error);
    if(!code||!state)throw new Error('Facebook không trả về code hoặc state');
    await consume('facebook',state);

    const tokenUrl=new URL(`https://graph.facebook.com/${config.graphVersion}/oauth/access_token`);
    tokenUrl.search=new URLSearchParams({
      client_id:config.appId,
      client_secret:config.appSecret,
      redirect_uri:config.redirectUri,
      code
    }).toString();

    let response=await fetch(tokenUrl);
    const token=await response.json().catch(()=>({}));
    if(!response.ok||!token.access_token)throw new Error(messageOf(token)||`Facebook token HTTP ${response.status}`);

    response=await fetch(`https://graph.facebook.com/${config.graphVersion}/me/accounts?fields=id,name,access_token,tasks&limit=100&access_token=${encodeURIComponent(token.access_token)}`);
    const pages=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(messageOf(pages)||`Facebook pages HTTP ${response.status}`);
    if(!pages.data?.length)throw new Error('Không tìm thấy Fanpage mà tài khoản đang quản lý');

    await Promise.all(pages.data.map(page=>saveConnection({
      provider:'facebook',
      external_id:page.id,
      channel_name:page.name,
      access_token:page.access_token,
      scopes:['pages_show_list','pages_read_engagement']
    })));

    return go(base,{connected:'facebook',pages:String(pages.data.length)});
  }catch(error){
    return go(base,{oauth_error:error.message||'Facebook OAuth thất bại'});
  }
};
