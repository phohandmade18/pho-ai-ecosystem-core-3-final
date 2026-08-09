const clean=(value='',name='')=>{
  let v=String(value||'').trim();
  if(!v)return '';
  if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'")))v=v.slice(1,-1).trim();
  const prefix=`${name}=`;
  if(name&&v.startsWith(prefix))v=v.slice(prefix.length).trim();
  return v;
};

const base=()=>clean(process.env.SUPABASE_URL,'SUPABASE_URL').replace(/\/+$/,'');

const serverKey=()=>clean(
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  process.env.SUPABASE_SECRET_KEY?'SUPABASE_SECRET_KEY':'SUPABASE_SERVICE_ROLE_KEY'
);

const publicKey=()=>clean(
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY,
  process.env.SUPABASE_PUBLISHABLE_KEY?'SUPABASE_PUBLISHABLE_KEY':'SUPABASE_ANON_KEY'
);

const isLegacyJwt=(value='')=>value.startsWith('eyJ');
const keyType=(value='')=>value.startsWith('sb_secret_')?'new_secret':
  value.startsWith('sb_publishable_')?'new_publishable':
  isLegacyJwt(value)?'legacy_jwt':'unknown';

export async function sb(path,{method='GET',body,headers={}}={}){
  const url=base();
  const key=serverKey();

  if(!url||!key){
    throw new Error('Supabase chưa cấu hình: cần SUPABASE_URL và khóa máy chủ');
  }

  const requestHeaders={
    apikey:key,
    'content-type':'application/json',
    Prefer:'return=representation'
  };

  if(isLegacyJwt(key)){
    requestHeaders.Authorization=`Bearer ${key}`;
  }

  const r=await fetch(`${url}/rest/v1/${path}`,{
    method,
    headers:{...requestHeaders,...headers},
    body:body?JSON.stringify(body):undefined
  });

  const text=await r.text();
  let data;
  try{ data=text?JSON.parse(text):null; }catch{ data=text; }

  if(!r.ok){
    throw new Error(`Supabase ${r.status}: ${typeof data==='string'?data:JSON.stringify(data)}`);
  }
  return data;
}

export async function sbHealth(){
  const url=base();
  const key=serverKey();

  if(!url||!key){
    return {ok:false,status:0,reason:'missing_config',keyType:keyType(key),hasPublicKey:Boolean(publicKey())};
  }

  const headers={apikey:key};
  if(isLegacyJwt(key))headers.Authorization=`Bearer ${key}`;

  const r=await fetch(`${url}/rest/v1/`,{headers});
  return {
    ok:r.ok,
    status:r.status,
    keyType:keyType(key),
    hasPublicKey:Boolean(publicKey()),
    urlLooksValid:/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)
  };
}

export const supabaseConfigSummary=()=>({
  hasUrl:Boolean(base()),
  urlLooksValid:/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(base()),
  serverKeyType:keyType(serverKey()),
  publicKeyType:keyType(publicKey()),
  serverKeyPresent:Boolean(serverKey()),
  publicKeyPresent:Boolean(publicKey())
});
