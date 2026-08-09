import{json,err}from'./lib/http.mjs';
import{issue}from'./lib/oauth.mjs';
import{assertMetaConfig}from'./lib/meta-config.mjs';

export default async()=>{
  try{
    const config=assertMetaConfig();
    const state=await issue('facebook');
    const params=new URLSearchParams({
      client_id:config.appId,
      redirect_uri:config.redirectUri,
      state,
      response_type:'code',
      scope:'pages_show_list,pages_read_engagement'
    });
    return json({authorizationUrl:`https://www.facebook.com/${config.graphVersion}/dialog/oauth?${params}`});
  }catch(error){
    return err(error.message,500);
  }
};
