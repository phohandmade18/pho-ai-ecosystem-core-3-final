const $=id=>document.getElementById(id);
const toast=m=>{const t=$('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2400)};
const CORE31_LIB='pho-core-31-library', CORE31_CAL='pho-core-31-calendar';
let lastStructured=null, imageData=[];

document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x===b));
  document.querySelectorAll('.tabpanel').forEach(x=>x.classList.toggle('active',x.id==='tab-'+b.dataset.tab));
});

async function api(name,body){
  const r=await fetch('/.netlify/functions/'+name,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
  const j=await r.json().catch(()=>({error:'Phản hồi không hợp lệ'}));
  if(!r.ok)throw new Error(j.error||j.message||'Lỗi máy chủ');
  return j;
}
function esc(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function normalize(v){return Array.isArray(v)?v.join('\n'):v==null?'':String(v)}
const fields=[
 ['topic','Chủ đề'],['product','Sản phẩm'],['style','Phong cách'],['title','Tiêu đề'],
 ['hook','Hook'],['content','Nội dung chính'],['story','Câu chuyện'],['insight','Insight khách hàng'],
 ['cta','CTA'],['hashtags','Hashtag'],['keywords','Từ khóa SEO'],['channel','Kênh phù hợp'],
 ['format','Định dạng'],['duration','Thời lượng'],['notes','Ghi chú']
];
function renderStructured(data){
  lastStructured=data;
  $('analysisState').textContent='Đã phân loại';
  $('analysisState').style.background='#155c40';
  $('structured').innerHTML=fields.map(([k,label])=>`<label class="field"><b>${label}</b><textarea data-structured="${k}">${esc(normalize(data?.[k]))}</textarea></label>`).join('');
}
function collectStructured(){
  const out={};
  document.querySelectorAll('[data-structured]').forEach(el=>out[el.dataset.structured]=el.value.trim());
  return out;
}

$('clearText').onclick=()=>{$('rawText').value=''};
$('analyzeText').onclick=async()=>{
  const text=$('rawText').value.trim(); if(!text)return toast('Hãy dán nội dung trước');
  $('analysisState').textContent='Đang phân tích...';
  try{const j=await api('core31-analyze',{mode:'text',text});renderStructured(j.structured);toast('Đã phân bổ nội dung')}
  catch(e){$('analysisState').textContent='Có lỗi';toast(e.message)}
};

$('imageInput').onchange=async e=>{
  const files=[...e.target.files].slice(0,4);
  imageData=[];$('preview').innerHTML='';
  for(const f of files){
    if(f.size>5*1024*1024){toast('Ảnh quá 5MB: '+f.name);continue}
    const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(f)});
    imageData.push(data);
    const im=document.createElement('img');im.src=data;$('preview').appendChild(im);
  }
};
$('analyzeImage').onclick=async()=>{
  if(!imageData.length)return toast('Hãy chọn ảnh trước');
  $('analysisState').textContent='Đang phân tích ảnh...';
  try{const j=await api('core31-analyze',{mode:'image',images:imageData,text:$('rawText').value.trim()});renderStructured(j.structured);toast('Đã phân tích ảnh')}
  catch(e){$('analysisState').textContent='Có lỗi';toast(e.message)}
};

function getLib(){try{return JSON.parse(localStorage.getItem(CORE31_LIB))||[]}catch{return[]}}
function saveLib(rows){localStorage.setItem(CORE31_LIB,JSON.stringify(rows))}
$('saveStructured').onclick=()=>{
  if(!lastStructured)return toast('Chưa có dữ liệu phân tích');
  const row={id:crypto.randomUUID(),...collectStructured(),createdAt:new Date().toISOString()};
  const rows=getLib();rows.unshift(row);saveLib(rows);renderLibrary();toast('Đã lưu vào kho 3.1')
};
$('sendToCalendar').onclick=()=>{
  if(!lastStructured)return toast('Chưa có dữ liệu phân tích');
  const d=collectStructured();$('calTitle').value=d.title||d.topic||d.product||'Nội dung mới';
  if(d.channel){const opts=[...$('calChannel').options];const hit=opts.find(o=>d.channel.toLowerCase().includes(o.text.toLowerCase().split(' ')[0]));if(hit)$('calChannel').value=hit.value}
  document.querySelector('[data-tab="calendar"]').click();toast('Đã chuyển sang lịch')
};
function renderLibrary(){
  const rows=getLib();
  $('smartLibrary').innerHTML=rows.length?rows.map(x=>`<div class="library-item"><b>${esc(x.title||x.topic||'Nội dung')}</b><small>${esc(x.product||'')} · ${esc(x.style||'')} · ${esc(x.channel||'')}</small><p>${esc((x.content||'').slice(0,300))}</p></div>`).join(''):'<p>Chưa có dữ liệu.</p>';
}
$('clearLibrary').onclick=()=>{if(confirm('Xóa toàn bộ kho CORE 3.1?')){localStorage.removeItem(CORE31_LIB);renderLibrary()}};

function getCal(){try{return JSON.parse(localStorage.getItem(CORE31_CAL))||[]}catch{return[]}}
function saveCal(rows){localStorage.setItem(CORE31_CAL,JSON.stringify(rows))}
function renderCal(){
  const rows=getCal().sort((a,b)=>new Date(a.at)-new Date(b.at));
  $('scheduleList').innerHTML=rows.length?rows.map(x=>`<div class="schedule ${x.done?'done':''}" data-id="${x.id}">
    <div><b>${esc(x.title)}</b><small>${esc(x.channel)} · ${new Date(x.at).toLocaleString('vi-VN')} ${x.rang?' · 🔔 đã báo':''}</small></div>
    <div class="actions"><button class="secondary" onclick="toggleDone('${x.id}')">${x.done?'Mở lại':'Đã đăng'}</button><button class="danger" onclick="removeSchedule('${x.id}')">Xóa</button></div>
  </div>`).join(''):'<p>Chưa có lịch.</p>';
}
window.toggleDone=id=>{const rows=getCal();const x=rows.find(r=>r.id===id);if(x)x.done=!x.done;saveCal(rows);renderCal()};
window.removeSchedule=id=>{saveCal(getCal().filter(x=>x.id!==id));renderCal()};
$('addSchedule').onclick=()=>{
  const title=$('calTitle').value.trim(), date=$('calDate').value, time=$('calTime').value;
  if(!title||!date||!time)return toast('Điền đủ tiêu đề, ngày và giờ');
  const rows=getCal();rows.push({id:crypto.randomUUID(),title,channel:$('calChannel').value,at:new Date(date+'T'+time).toISOString(),done:false,rang:false});
  saveCal(rows);renderCal();toast('Đã thêm lịch')
};

$('notificationBtn').onclick=async()=>{
  if(!('Notification'in window))return toast('Trình duyệt không hỗ trợ Notification');
  const p=await Notification.requestPermission();toast(p==='granted'?'Đã cho phép thông báo':'Chưa cấp quyền thông báo');
};

async function twoChimes(){
  // Chính xác 2 tiếng chuông ngắn, sau đó đóng AudioContext.
  const Ctx=window.AudioContext||window.webkitAudioContext;
  if(!Ctx)return;
  const ctx=new Ctx();
  const ping=(start)=>{
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.type='sine';o.frequency.value=880;
    g.gain.setValueAtTime(0.0001,start);
    g.gain.exponentialRampToValueAtTime(0.22,start+0.01);
    g.gain.exponentialRampToValueAtTime(0.0001,start+0.18);
    o.connect(g);g.connect(ctx.destination);o.start(start);o.stop(start+0.2);
  };
  const t=ctx.currentTime+0.02;ping(t);ping(t+0.42);
  setTimeout(()=>ctx.close(),1100);
}
function checkDue(){
  const now=Date.now();const rows=getCal();let changed=false;
  rows.forEach(x=>{
    if(x.done||x.rang)return;
    const at=new Date(x.at).getTime();
    if(now>=at && now-at<90000){
      x.rang=true;changed=true;twoChimes();
      if(Notification.permission==='granted')new Notification('ĐẾN GIỜ ĐĂNG BÀI',{body:`${x.channel}: ${x.title}`,tag:'pho-core31-'+x.id,renotify:false});
      toast('🔔 Đến giờ đăng: '+x.title);
    }
  });
  if(changed){saveCal(rows);renderCal()}
}
setInterval(checkDue,15000);

const now=new Date();$('calDate').value=now.toISOString().slice(0,10);$('calTime').value=now.toTimeString().slice(0,5);
renderCal();renderLibrary();
