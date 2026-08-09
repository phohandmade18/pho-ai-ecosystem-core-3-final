import{json}from'./lib/http.mjs';
import{sbHealth,supabaseConfigSummary}from'./lib/supabase.mjs';
import{metaConfig}from'./lib/meta-config.mjs';

const result=(status,label,detail,action='')=>({status,label,detail,action});
const validUrl=value=>{try{return Boolean(new URL(value))}catch{return false}};

async function checkOpenAI(){
  const key=String(process.env.OPENAI_API_KEY||'').trim();
  const model=String(process.env.OPENAI_MODEL||'gpt-4.1-mini').trim();
  if(!key)return result('missing','OpenAI','Chưa có OPENAI_API_KEY','Thêm khóa OpenAI trong Netlify');
  try{
    const r=await fetch(`https://api.openai.com/v1/models/${encodeURIComponent(model)}`,{
      headers:{Authorization:`Bearer ${key}`}
    });
    if(r.ok)return result('ok','OpenAI',`Khóa hợp lệ · model ${model}`,'Có thể tạo Executive Brief');
    const body=await r.json().catch(()=>({}));
    return result('error','OpenAI',body.error?.message||`HTTP ${r.status}`,'Kiểm tra API key hoặc tên model');
  }catch(error){
    return result('error','OpenAI',error.message,'Kiểm tra kết nối mạng');
  }
}

async function checkMeta(){
  const config=metaConfig();
  const{id,secret,redirect}={id:config.appId,secret:config.appSecret,redirect:config.redirectUri};
  if(!id||!secret||!redirect)return result('missing','Facebook / Meta','Thiếu FACEBOOK_APP_ID, FACEBOOK_APP_SECRET hoặc FACEBOOK_REDIRECT_URI','Bổ sung 3 biến Facebook trong Netlify');
  if(!validUrl(redirect))return result('error','Facebook / Meta','FACEBOOK_REDIRECT_URI không phải URL hợp lệ','Sửa URL callback');
  try{
    const token=`${id}|${secret}`;
    const r=await fetch(`https://graph.facebook.com/${config.graphVersion}/${encodeURIComponent(id)}?fields=id,name&access_token=${encodeURIComponent(token)}`);
    const body=await r.json().catch(()=>({}));
    if(r.ok)return result('ok','Facebook / Meta',`Meta App hợp lệ · ${body.name||id}`,'Sẵn sàng đăng nhập Fanpage');
    return result('error','Facebook / Meta',body.error?.message||`HTTP ${r.status}`,'Kiểm tra App ID và App Secret');
  }catch(error){
    return result('error','Facebook / Meta',error.message,'Kiểm tra kết nối mạng');
  }
}

async function checkSupabase(){
  const config=supabaseConfigSummary();
  if(!config.hasUrl||!config.serverKeyPresent){
    return result('missing','Supabase','Thiếu SUPABASE_URL hoặc khóa máy chủ','Bổ sung biến Supabase');
  }
  const probe=await sbHealth();
  if(probe.ok)return result('ok','Supabase',`Kết nối thành công · ${probe.keyType}`,'Cơ sở dữ liệu sẵn sàng');
  const hint=probe.keyType==='unknown'
    ?'Giá trị khóa có thể chứa tên biến, dấu ngoặc hoặc khoảng trắng'
    :`Supabase trả về HTTP ${probe.status}`;
  return result('error','Supabase',hint,'Dán lại đúng khóa sb_secret_ hoặc JWT service_role');
}

function checkYouTube(){
  const id=String(process.env.GOOGLE_CLIENT_ID||'').trim();
  const secret=String(process.env.GOOGLE_CLIENT_SECRET||'').trim();
  const redirect=String(process.env.GOOGLE_REDIRECT_URI||'').trim();
  if(!id||!secret||!redirect)return result('missing','YouTube / Google','Chưa cấu hình Google OAuth','Thêm Client ID, Client Secret và Redirect URI');
  if(!validUrl(redirect))return result('error','YouTube / Google','GOOGLE_REDIRECT_URI không hợp lệ','Sửa URL callback');
  return result('configured','YouTube / Google','Đã có đủ cấu hình OAuth','Bấm Kết nối YouTube để xác thực tài khoản');
}

function checkEncryption(){
  const value=String(process.env.TOKEN_ENCRYPTION_KEY||'').trim();
  if(!value)return result('missing','Mã hóa token','Chưa có TOKEN_ENCRYPTION_KEY','Tạo chuỗi bí mật tối thiểu 32 ký tự');
  if(value.length<32)return result('error','Mã hóa token',`Khóa quá ngắn: ${value.length} ký tự`,'Dùng khóa ngẫu nhiên tối thiểu 32 ký tự');
  return result('ok','Mã hóa token','Khóa mã hóa đạt yêu cầu','Token kết nối được bảo vệ');
}

function checkBaseUrl(){
  const value=String(process.env.APP_BASE_URL||'').trim().replace(/\/+$/,'');
  if(!value)return result('missing','APP_BASE_URL','Chưa cấu hình địa chỉ ứng dụng','Đặt URL production Netlify');
  if(!validUrl(value))return result('error','APP_BASE_URL','URL không hợp lệ','Sửa lại địa chỉ https://...');
  return result('ok','APP_BASE_URL',value,'Địa chỉ callback nền tảng');
}

export default async()=>{
  const checks=[
    await checkSupabase(),
    checkEncryption(),
    await checkOpenAI(),
    await checkMeta(),
    checkYouTube(),
    checkBaseUrl()
  ];

  const weight={ok:1,configured:.75,missing:0,error:0};
  const score=Math.round(checks.reduce((sum,x)=>sum+(weight[x.status]||0),0)/checks.length*100);
  const blocking=checks.filter(x=>x.status==='error'||x.status==='missing');

  return json({
    ok:true,
    version:'2.3.2',
    score,
    ready:blocking.length===0,
    summary:blocking.length?`${blocking.length} mục cần xử lý`:'Hệ thống sẵn sàng',
    checks,
    checkedAt:new Date().toISOString()
  });
};
