const clean=(value='',name='')=>{
  let v=String(value||'').trim();
  if(!v)return '';
  if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'")))v=v.slice(1,-1).trim();
  const prefix=name?`${name}=`:'';
  if(prefix&&v.startsWith(prefix))v=v.slice(prefix.length).trim();
  return v;
};

const read=(primary,legacy='')=>{
  const primaryValue=clean(process.env[primary],primary);
  if(primaryValue)return primaryValue;
  return legacy?clean(process.env[legacy],legacy):'';
};

export const metaConfig=()=>({
  appId:read('FACEBOOK_APP_ID','META_APP_ID'),
  appSecret:read('FACEBOOK_APP_SECRET','META_APP_SECRET'),
  redirectUri:read('FACEBOOK_REDIRECT_URI','META_REDIRECT_URI'),
  appBaseUrl:clean(process.env.APP_BASE_URL,'APP_BASE_URL').replace(/\/+$/,''),
  graphVersion:clean(process.env.FACEBOOK_GRAPH_VERSION,'FACEBOOK_GRAPH_VERSION')||'v23.0'
});

export function assertMetaConfig({requireSecret=false}={}){
  const config=metaConfig();
  const missing=[];
  if(!config.appId)missing.push('FACEBOOK_APP_ID');
  if(requireSecret&&!config.appSecret)missing.push('FACEBOOK_APP_SECRET');
  if(!config.redirectUri)missing.push('FACEBOOK_REDIRECT_URI');
  if(!config.appBaseUrl)missing.push('APP_BASE_URL');
  if(missing.length)throw new Error(`Meta OAuth chưa cấu hình: thiếu ${missing.join(', ')}`);
  try{new URL(config.redirectUri);new URL(config.appBaseUrl)}catch{throw new Error('FACEBOOK_REDIRECT_URI hoặc APP_BASE_URL không hợp lệ')}
  return config;
}
