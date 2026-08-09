const $=id=>document.getElementById(id);
const names={home:'Trung tâm điều hành',facebook:'Facebook Operations Center',socialhub:'Social Hub',studio:'AI Content Studio',library:'Kho nội dung',knowledge:'Kho tri thức AI',memory:'Memory Engine',advisor:'AI Advisor',learning:'Learning Brain',score:'Content Score',architecture:'Kiến trúc 3.0',planner:'Lịch nội dung',connections:'Kết nối kênh',kpi:'Dữ liệu KPI',brief:'Phân tích OpenAI',strategy:'Strategy Engine',budget:'Chi phí AI',system:'Kiểm tra hệ thống'};
function openPage(id){document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===id));document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===id));$('pageTitle').textContent=names[id];scrollTo({top:0,behavior:'smooth'})}
window.openPage=openPage;
document.querySelectorAll('#nav button').forEach(b=>b.onclick=()=>openPage(b.dataset.page));
const toast=m=>{const t=$('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)};
async function api(name,options){const r=await fetch('/.netlify/functions/'+name,options);const j=await r.json().catch(()=>({error:'Phản hồi không hợp lệ'}));if(!r.ok)throw new Error(j.error||j.message||'Lỗi máy chủ');return j}
function money(v){return '$'+Number(v||0).toFixed(2)}
function metricsHtml(obj={}){const entries=Object.entries(obj);return entries.length?entries.map(([k,v])=>`<div class="metric"><span>${k.replaceAll('_',' ')}</span><b>${typeof v==='number'?v.toLocaleString('vi-VN'):v}</b></div>`).join(''):'<p>Chưa có dữ liệu.</p>'}

const defaultPlan=[
 {day:'Thứ Hai',channel:'Trang cá nhân',angle:'Câu chuyện người làm nghề',time:'20:00'},
 {day:'Thứ Ba',channel:'Group',angle:'Câu hỏi thảo luận',time:'20:00'},
 {day:'Thứ Tư',channel:'Fanpage',angle:'Reel sản phẩm',time:'10:00'},
 {day:'Thứ Năm',channel:'Group',angle:'Mini game hoặc kiến thức',time:'20:00'},
 {day:'Thứ Sáu',channel:'Trang cá nhân',angle:'Góc nhìn và trải nghiệm',time:'20:00'},
 {day:'Thứ Bảy',channel:'Fanpage',angle:'Album hoặc phản hồi khách hàng',time:'10:00'},
 {day:'Chủ Nhật',channel:'Toàn hệ sinh thái',angle:'Tổng kết tuần và chủ đề tuần mới',time:'20:00'}
];
function getPlanner(){try{return JSON.parse(localStorage.getItem('pho-core-24-planner'))||defaultPlan}catch{return defaultPlan}}
function savePlanner(rows){localStorage.setItem('pho-core-24-planner',JSON.stringify(rows))}
function renderPlanner(){
 const rows=getPlanner();
 $('weeklyPlanner').innerHTML=rows.map((x,i)=>`<article class="planner-card">
   <b>${x.day}</b>
   <label>Kênh<select data-pi="${i}" data-field="channel"><option ${x.channel==='Trang cá nhân'?'selected':''}>Trang cá nhân</option><option ${x.channel==='Group'?'selected':''}>Group</option><option ${x.channel==='Fanpage'?'selected':''}>Fanpage</option><option ${x.channel==='Toàn hệ sinh thái'?'selected':''}>Toàn hệ sinh thái</option></select></label>
   <label>Góc nội dung<input data-pi="${i}" data-field="angle" value="${x.angle.replaceAll('"','&quot;')}"></label>
   <label>Giờ đăng<input data-pi="${i}" data-field="time" value="${x.time}"></label>
   <label class="done"><input type="checkbox" data-pi="${i}" data-field="done" ${x.done?'checked':''}> Đã chuẩn bị</label>
 </article>`).join('');
 document.querySelectorAll('[data-pi]').forEach(el=>el.onchange=()=>{
   const data=getPlanner(),i=Number(el.dataset.pi),f=el.dataset.field;
   data[i][f]=el.type==='checkbox'?el.checked:el.value;savePlanner(data);renderToday()
 });
 renderToday()
}
function renderToday(){
 const days=['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'];
 const today=days[new Date().getDay()];
 const tasks=getPlanner().filter(x=>x.day===today&&!x.done);
 $('todayTaskCount').textContent=tasks.length;
 $('todayTasks').innerHTML=tasks.length?tasks.map(x=>`<div class="item warn"><b>${x.channel} · ${x.time}</b><small>${x.angle}</small></div>`).join(''):'<div class="item good"><b>Đã hoàn thành lịch hôm nay</b><small>Hãy chuẩn bị trước nội dung ngày mai.</small></div>'
}
$('resetPlanner').onclick=()=>{localStorage.removeItem('pho-core-24-planner');renderPlanner();toast('Đã khôi phục lịch mẫu')};

document.querySelectorAll('.channel-tab').forEach(b=>b.onclick=()=>{
 document.querySelectorAll('.channel-tab').forEach(x=>x.classList.toggle('active',x===b));
 document.querySelectorAll('.channel-view').forEach(x=>x.classList.toggle('active',x.id===b.dataset.channel))
});
function loadChannelPlan(){
 let data={};try{data=JSON.parse(localStorage.getItem('pho-core-24-channel-plan'))||{}}catch{}
 document.querySelectorAll('[data-plan]').forEach(el=>{const v=data[el.dataset.plan];if(el.type==='checkbox')el.checked=!!v;else el.value=v||''})
}
$('saveChannelPlan').onclick=()=>{
 const data={};document.querySelectorAll('[data-plan]').forEach(el=>data[el.dataset.plan]=el.type==='checkbox'?el.checked:el.value);
 localStorage.setItem('pho-core-24-channel-plan',JSON.stringify(data));toast('Đã lưu kế hoạch 3 kênh')
};
$('generateVariants').onclick=()=>{
 const idea=$('sourceIdea').value.trim();if(!idea)return toast('Hãy nhập ý tưởng gốc');
 const variants=[
  ['Trang cá nhân','Chia sẻ trải nghiệm thật, cảm xúc và bài học cá nhân từ: '+idea],
  ['Group Phố Handmade','Đặt câu hỏi mở để thành viên cùng trao đổi về: '+idea],
  ['Fanpage','Kể câu chuyện sản phẩm, giá trị và lời mời hành động nhẹ nhàng về: '+idea]
 ];
 $('variantOutput').innerHTML=variants.map(([k,v])=>`<article><b>${k}</b><p>${v}</p></article>`).join('')
};

async function loadHealth(){try{const j=await api('system-health');$('healthRaw').textContent=JSON.stringify(j,null,2);const icon={ok:'✅',configured:'🟡',missing:'⚪',error:'❌'};const label={ok:'Hoạt động',configured:'Đã cấu hình',missing:'Chưa cấu hình',error:'Có lỗi'};$('healthGrid').innerHTML=(j.checks||[]).map(x=>`<article class="health-card ${x.status}"><div class="health-card-head"><span>${icon[x.status]||'•'}</span><b>${x.label}</b></div><strong>${label[x.status]||x.status}</strong><p>${x.detail||''}</p><small>${x.action||''}</small></article>`).join('');$('systemPill').textContent=j.ready?'Hệ thống sẵn sàng':j.summary;$('systemPill').className='pill '+(j.ready?'good':'warn');$('healthScore').textContent=j.score;$('healthCenterScore').textContent=j.score;$('healthSummary').textContent=j.summary;$('healthCheckedAt').textContent='Kiểm tra lúc '+new Date(j.checkedAt).toLocaleString('vi-VN');return j}catch(e){$('systemPill').textContent='Backend lỗi';$('systemPill').className='pill bad';toast(e.message)}}
async function loadConnections(){try{const j=await api('connection-status');const rows=j.connections||[];const fb=rows.find(x=>x.provider==='facebook');$('fbStatus').textContent=fb?'Đã kết nối':'Chưa kết nối';$('fbLast').textContent=fb?.last_sync_at?new Date(fb.last_sync_at).toLocaleString('vi-VN'):'—'}catch{}}
async function loadSnapshots(){try{const j=await api('metrics-latest');const rows=j.snapshots||[];const fb=rows.find(x=>x.provider==='facebook');$('fbMetrics').innerHTML=metricsHtml(fb?.metrics);const latest={};rows.forEach(x=>{for(const[k,v]of Object.entries(x.metrics||{}))if(latest[k]===undefined)latest[k]=v});$('kpiCards').innerHTML=Object.entries(latest).slice(0,8).map(([k,v])=>`<article><span>${k.replaceAll('_',' ')}</span><b>${Number(v||0).toLocaleString('vi-VN')}</b><small>KPI mới nhất</small></article>`).join('');$('snapshotTable').innerHTML=rows.length?`<table><thead><tr><th>Kênh</th><th>Thời gian</th><th>Dữ liệu</th></tr></thead><tbody>${rows.map(x=>`<tr><td>${x.provider}</td><td>${new Date(x.captured_at).toLocaleString('vi-VN')}</td><td><code>${JSON.stringify(x.metrics)}</code></td></tr>`).join('')}</tbody></table>`:'<p>Chưa có snapshot.</p>'}catch(e){$('snapshotTable').textContent=e.message}}
async function loadFindings(){try{const j=await api('strategy-findings');const rows=j.findings||[];const html=rows.length?rows.map(x=>`<div class="item ${x.severity==='high'?'danger':x.severity==='medium'?'warn':'good'}"><b>${x.title||x.finding_type}</b><small>${x.summary||''}</small></div>`).join(''):'<p>Chưa có phát hiện. Cần ít nhất hai snapshot.</p>';$('findingList').innerHTML=html;$('homeFindings').innerHTML=rows.slice(0,4).map(x=>`<div class="item ${x.severity==='high'?'danger':'warn'}"><b>${x.title}</b><small>${x.summary}</small></div>`).join('')||'<p>Chưa có cảnh báo.</p>'}catch{}}
async function loadBudget(){try{const j=await api('budget-status');$('budgetUsed').textContent=money(j.usedUsd);$('budgetForecast').textContent=money(j.forecastUsd);$('budgetLimit').textContent=money(j.budgetUsd);$('budgetMode').textContent=j.mode}catch{}}
async function loadBrief(){try{const j=await api('brief-latest');const text=j.brief?.content||'Chưa có báo cáo AI thật.';$('latestBrief').textContent=text;$('briefContent').textContent=text}catch{}}
async function syncProvider(provider){try{toast(`Đang đồng bộ ${provider}...`);await api('sync-provider',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({provider})});toast(`Đồng bộ ${provider} thành công`);await loadAll()}catch(e){toast(e.message)}}
window.checkProvider=async provider=>{const el=$(provider==='facebook'?'facebookCheck':'youtubeCheck');try{el.textContent=JSON.stringify(await api(`connection-status?provider=${provider}`),null,2)}catch(e){el.textContent=e.message}};
$('connectFacebook').onclick=async()=>{try{location.href=(await api('facebook-auth-start')).authorizationUrl}catch(e){toast(e.message)}};
$('connectYoutube').onclick=async()=>{try{location.href=(await api('youtube-auth-start')).authorizationUrl}catch(e){toast(e.message)}};
$('syncAllTop').onclick=async()=>{await syncProvider('facebook');await syncProvider('youtube')};
$('reloadKpi').onclick=loadSnapshots;
$('evaluateStrategy').onclick=async()=>{try{const j=await api('strategy-evaluate',{method:'POST'});toast(`Đã tạo ${j.created||0} phát hiện`);loadFindings()}catch(e){toast(e.message)}};
$('createBrief').onclick=async()=>{try{$('briefContent').textContent='Đang phân tích...';const j=await api('openai-strategy',{method:'POST'});$('briefContent').textContent=j.content||JSON.stringify(j,null,2);toast('Đã tạo Executive Brief');loadBudget()}catch(e){$('briefContent').textContent=e.message;toast(e.message)}};
$('healthBtn').onclick=loadHealth;
$('copyHealth').onclick=async()=>{try{await navigator.clipboard.writeText($('healthRaw').textContent);toast('Đã sao chép kết quả')}catch{toast('Không thể sao chép')}};

function getLibrary(){try{return JSON.parse(localStorage.getItem('pho-core-25-library'))||[]}catch{return[]}}
function saveLibrary(rows){localStorage.setItem('pho-core-25-library',JSON.stringify(rows))}
function renderLibrary(){
 const q=($('librarySearch')?.value||'').toLowerCase();
 const f=$('libraryFilter')?.value||'';
 const rows=getLibrary().filter(x=>(!f||x.platform===f)&&(!q||(x.topic+' '+x.content+' '+x.platform).toLowerCase().includes(q)));
 if(!$('libraryList'))return;
 $('libraryList').innerHTML=rows.length?rows.map((x,i)=>`<article class="library-card"><div class="library-card-head"><span>${platformName(x.platform)}</span><button class="secondary" onclick="removeLibrary(${i})">Xóa</button></div><b>${x.topic}</b><p>${x.content}</p><small>${new Date(x.createdAt).toLocaleString('vi-VN')}</small></article>`).join(''):'<p>Chưa có nội dung đã lưu.</p>'
}
window.removeLibrary=i=>{const rows=getLibrary();rows.splice(i,1);saveLibrary(rows);renderLibrary()}
function platformName(v){return {personal:'Trang cá nhân',group:'Group',fanpage:'Fanpage',tiktok:'TikTok',instagram:'Instagram',youtube:'YouTube'}[v]||v}
function buildContent(platform,topic,goal,tone,template){
 const hooks={
  personal:`Có những điều chỉ khi tự tay làm, ta mới hiểu giá trị của sự kiên nhẫn.`,
  group:`Theo bạn, điều khó nhất khi bắt đầu với ${topic} là gì?`,
  fanpage:`Không chỉ là một sản phẩm, ${topic} còn là câu chuyện của đôi tay và cảm xúc.`,
  tiktok:`Bạn nghĩ một món đồ thủ công cần bao lâu để hoàn thành?`,
  instagram:`Một khoảnh khắc chậm, một sản phẩm có hồn.`,
  youtube:`Hôm nay chúng ta cùng khám phá toàn bộ quá trình tạo nên ${topic}.`
 };
 const ctas={
  personal:'Bạn đã từng có trải nghiệm như vậy chưa?',
  group:'Chia sẻ câu trả lời của bạn dưới phần bình luận.',
  fanpage:'Theo dõi Phố Handmade để khám phá thêm những giá trị thủ công Việt.',
  tiktok:'Xem đến cuối và cho biết bạn ấn tượng nhất bước nào.',
  instagram:'Lưu lại để xem khi cần một chút cảm hứng.',
  youtube:'Đăng ký kênh để không bỏ lỡ những câu chuyện thủ công tiếp theo.'
 };
 const body={
  question:`${hooks[platform]} Đây là câu hỏi dành cho cộng đồng: ${topic} mang lại cho bạn cảm xúc gì?`,
  reel:`HOOK: ${hooks[platform]}\nCẢNH 1: Cận cảnh nguyên liệu.\nCẢNH 2: Đôi tay thao tác.\nCẢNH 3: Chi tiết thành phẩm.\nCTA: ${ctas[platform]}`,
  story:`Khung 1: ${hooks[platform]}\nKhung 2: Hậu trường về ${topic}.\nKhung 3: ${ctas[platform]}`,
  minigame:`MINI GAME: Đoán xem ${topic} được làm trong bao lâu?\nA. 30 phút\nB. 3 giờ\nC. Cả một ngày\n${ctas[platform]}`,
  product:`${hooks[platform]}\n${topic} được tạo nên từ sự tỉ mỉ, tính thẩm mỹ và mong muốn đem lại niềm vui cho người nhận.\n${ctas[platform]}`,
  knowledge:`${hooks[platform]}\n3 điều nên biết về ${topic}: vật liệu, kỹ thuật và câu chuyện văn hóa phía sau.\n${ctas[platform]}`
 };
 return `Mục tiêu: ${goal}\nGiọng điệu: ${tone}\n\n${body[template]||body.product}\n\n#PhoHandmade #HandmadeViet #ThuCongViet #SanPhamThuCong #CamHungSangTao`
}
function selectedPlatforms(){return [...document.querySelectorAll('.platform-picks input:checked')].map(x=>x.value)}
function generateStudio(template='product'){
 const topic=$('studioTopic')?.value.trim();if(!topic)return toast('Hãy nhập chủ đề hoặc sản phẩm');
 const goal=$('studioGoal').value,tone=$('studioTone').value,platforms=selectedPlatforms();
 if(!platforms.length)return toast('Hãy chọn ít nhất một nền tảng');
 const rows=platforms.map(platform=>({platform,topic,content:buildContent(platform,topic,goal,tone,template),createdAt:new Date().toISOString()}));
 $('studioOutput').innerHTML=rows.map((x,i)=>`<article class="studio-card"><div class="studio-card-head"><b>${platformName(x.platform)}</b><button onclick="saveStudioItem(${i})">Lưu</button></div><pre>${x.content}</pre></article>`).join('');
 window.currentStudioRows=rows
}
window.saveStudioItem=i=>{const rows=getLibrary();rows.unshift(window.currentStudioRows[i]);saveLibrary(rows.slice(0,100));renderLibrary();toast('Đã lưu vào kho nội dung')}
if($('studioGenerate'))$('studioGenerate').onclick=()=>generateStudio('product');
document.querySelectorAll('[data-template]').forEach(b=>b.onclick=()=>generateStudio(b.dataset.template));
if($('librarySearch'))$('librarySearch').oninput=renderLibrary;
if($('libraryFilter'))$('libraryFilter').onchange=renderLibrary;
if($('clearLibrary'))$('clearLibrary').onclick=()=>{localStorage.removeItem('pho-core-25-library');renderLibrary();toast('Đã xóa kho nội dung')};
if($('refreshSocialHub'))$('refreshSocialHub').onclick=async()=>{await loadConnections();toast('Đã làm mới Social Hub')};
const oldLoadConnections=loadConnections;
loadConnections=async function(){await oldLoadConnections();try{const j=await api('connection-status');const yt=(j.connections||[]).find(x=>x.provider==='youtube');if($('ytHubStatus')){$('ytHubStatus').textContent=yt?'Đã kết nối':'Chưa kết nối';$('ytHubStatus').className='pill '+(yt?'good':'warn')}}catch{}}


// ================= CORE 2.7 · AI KNOWLEDGE BRAIN =================
const KNOWLEDGE_KEY='pho-core-27-knowledge';
const MEMORY_KEY='pho-core-27-memory';

function safeJson(text,fallback){try{return JSON.parse(text)}catch{return fallback}}
function getKnowledge(){return safeJson(localStorage.getItem(KNOWLEDGE_KEY)||'[]',[])}
function setKnowledge(rows){localStorage.setItem(KNOWLEDGE_KEY,JSON.stringify(rows))}
function normalizeText(s=''){return String(s).replace(/\r/g,'').replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim()}
function tokenize(s=''){
 return normalizeText(s).toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .replace(/[^a-z0-9À-ỹ\s#_-]/gi,' ')
  .split(/\s+/).filter(x=>x.length>2)
}
function guessTopic(text){
 const t=normalizeText(text);
 const first=(t.split(/\n/).find(x=>x.trim().length>4)||'Tri thức mới').trim();
 return first.replace(/^#+\s*/,'').replace(/[*_`]/g,'').slice(0,90)
}
function splitKnowledge(text,maxChars=1500){
 const clean=normalizeText(text); if(!clean)return [];
 const paras=clean.split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean);
 const chunks=[]; let buf='';
 for(const p of paras){
   if((buf+'\n\n'+p).length>maxChars && buf){chunks.push(buf.trim());buf=p}
   else buf=buf?buf+'\n\n'+p:p;
 }
 if(buf)chunks.push(buf.trim());
 return chunks.flatMap(c=>{
   if(c.length<=maxChars*1.4)return [c];
   const out=[];for(let i=0;i<c.length;i+=maxChars)out.push(c.slice(i,i+maxChars));return out
 })
}
function knowledgeScore(item,query){
 const qt=tokenize(query); if(!qt.length)return 0;
 const hay=tokenize([item.topic,item.tags?.join(' '),item.content,item.source,item.type].join(' '));
 const set=new Set(hay); let score=0;
 qt.forEach(w=>{if(set.has(w))score+=3; else if(hay.some(x=>x.includes(w)||w.includes(x)))score+=1});
 if((item.tags||[]).some(t=>qt.includes(tokenize(t)[0])))score+=2;
 return score
}
function retrieveKnowledge(query,limit=6){
 return getKnowledge().map(x=>({...x,_score:knowledgeScore(x,query)}))
   .filter(x=>x._score>0).sort((a,b)=>b._score-a._score).slice(0,limit)
}
function knowledgeStats(){
 const rows=getKnowledge(),sources=new Set(rows.map(x=>x.source)),topics=new Set(rows.map(x=>x.topic));
 const chars=rows.reduce((s,x)=>s+(x.content?.length||0),0);
 if($('knowledgeCount'))$('knowledgeCount').textContent=rows.length.toLocaleString('vi-VN');
 if($('knowledgeSources'))$('knowledgeSources').textContent=sources.size;
 if($('knowledgeTopics'))$('knowledgeTopics').textContent=topics.size;
 if($('knowledgeChars'))$('knowledgeChars').textContent=chars>1e6?(chars/1e6).toFixed(1)+'M':chars>1e3?(chars/1e3).toFixed(1)+'K':chars;
 const tagFreq={};
 rows.flatMap(x=>x.tags||[]).forEach(t=>tagFreq[t]=(tagFreq[t]||0)+1);
 const tags=Object.entries(tagFreq).sort((a,b)=>b[1]-a[1]).slice(0,20);
 if($('topicCloud'))$('topicCloud').innerHTML=tags.length?tags.map(([t,n])=>`<button class="topic-chip" onclick="searchKnowledgeTag('${t.replaceAll("'","&#39;")}')">${t}<small>${n}</small></button>`).join(''):'<span class="muted">Chưa có tags.</span>'
}
window.searchKnowledgeTag=t=>{if($('knowledgeSearch')){$('knowledgeSearch').value=t;renderKnowledge()}};
function renderKnowledge(){
 if(!$('knowledgeList'))return;
 const q=($('knowledgeSearch')?.value||'').trim(),f=$('knowledgeFilter')?.value||'';
 let rows=getKnowledge().filter(x=>!f||x.type===f);
 if(q)rows=rows.map(x=>({...x,_score:knowledgeScore(x,q)})).filter(x=>x._score>0).sort((a,b)=>b._score-a._score);
 rows=rows.slice(0,80);
 $('knowledgeList').innerHTML=rows.length?rows.map(x=>`<article class="knowledge-item">
   <div class="knowledge-item-head"><div><span class="pill good">${x.type}</span> <small>${x.source}</small></div><button class="secondary" onclick="deleteKnowledge('${x.id}')">Xóa</button></div>
   <b>${x.topic}</b>
   <p>${x.content}</p>
   <div class="tag-row">${(x.tags||[]).map(t=>`<span>#${t}</span>`).join('')}</div>
   <small>${new Date(x.createdAt).toLocaleString('vi-VN')}</small>
 </article>`).join(''):'<p>Không có mảnh tri thức phù hợp.</p>';
 knowledgeStats()
}
window.deleteKnowledge=id=>{setKnowledge(getKnowledge().filter(x=>x.id!==id));renderKnowledge();toast('Đã xóa mảnh tri thức')}

async function importKnowledge(){
 let text=normalizeText($('knowledgePaste')?.value||'');
 const file=$('knowledgeFile')?.files?.[0];
 if(file)text=normalizeText(await file.text());
 if(!text)return toast('Hãy chọn file .txt hoặc dán nội dung');
 const source=$('knowledgeSource').value,type=$('knowledgeType').value;
 const defaultTags=($('knowledgeTags').value||'').split(',').map(x=>x.trim().replace(/^#/,'').toLowerCase()).filter(Boolean);
 const chunks=splitKnowledge(text);
 const existing=getKnowledge();
 const created=chunks.map((content,i)=>{
   const words=tokenize(content);
   const auto=[...new Set(words.filter(w=>['facebook','group','fanpage','tiktok','instagram','youtube','origami','handmade','resin','trầm','tram','reel','story','minigame','mini','game','kpi','content','chien','luoc'].includes(w)).slice(0,8))];
   return {
     id:'k_'+Date.now()+'_'+i+'_'+Math.random().toString(36).slice(2,7),
     topic:guessTopic(content),
     content,source,type,
     tags:[...new Set([...defaultTags,...auto])],
     createdAt:new Date().toISOString()
   }
 });
 setKnowledge([...created,...existing].slice(0,5000));
 $('knowledgePaste').value=''; $('knowledgeFile').value='';
 renderKnowledge(); toast(`Đã nhập ${created.length} mảnh tri thức`)
}
if($('importKnowledge'))$('importKnowledge').onclick=importKnowledge;
if($('knowledgeSearch'))$('knowledgeSearch').oninput=renderKnowledge;
if($('knowledgeFilter'))$('knowledgeFilter').onchange=renderKnowledge;
if($('clearKnowledge'))$('clearKnowledge').onclick=()=>{
 if(confirm('Xóa toàn bộ Kho tri thức AI trên thiết bị này?')){localStorage.removeItem(KNOWLEDGE_KEY);renderKnowledge();toast('Đã xóa Kho tri thức')}
};
if($('exportKnowledge'))$('exportKnowledge').onclick=()=>{
 const blob=new Blob([JSON.stringify({version:'2.7',exportedAt:new Date().toISOString(),items:getKnowledge(),memory:getMemory()},null,2)],{type:'application/json'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='pho-ai-knowledge-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();URL.revokeObjectURL(a.href)
};

// Memory Engine
function getMemory(){return safeJson(localStorage.getItem(MEMORY_KEY)||'{}',{})}
function memoryObject(){
 return {
   voice:$('memoryVoice')?.value||'', titleRules:$('memoryTitle')?.value||'',
   cta:$('memoryCTA')?.value||'', hashtags:$('memoryHashtags')?.value||'',
   wins:$('memoryWins')?.value||'', avoid:$('memoryAvoid')?.value||'',
   times:$('memoryTimes')?.value||'', goals:$('memoryGoals')?.value||'',
   updatedAt:new Date().toISOString()
 }
}
function renderMemory(){
 if(!$('memoryVoice'))return;
 const m=getMemory();
 $('memoryVoice').value=m.voice||'';$('memoryTitle').value=m.titleRules||'';
 $('memoryCTA').value=m.cta||'';$('memoryHashtags').value=m.hashtags||'';
 $('memoryWins').value=m.wins||'';$('memoryAvoid').value=m.avoid||'';
 $('memoryTimes').value=m.times||'';$('memoryGoals').value=m.goals||'';
 $('memoryPreview').textContent=Object.keys(m).length?JSON.stringify(m,null,2):'Chưa có bộ nhớ.'
}
if($('saveMemory'))$('saveMemory').onclick=()=>{
 const m=memoryObject();localStorage.setItem(MEMORY_KEY,JSON.stringify(m));$('memoryPreview').textContent=JSON.stringify(m,null,2);
 // also creates a compact brand-memory knowledge item
 const rows=getKnowledge().filter(x=>x.id!=='memory_snapshot');
 rows.unshift({id:'memory_snapshot',topic:'Bộ nhớ phong cách và kinh nghiệm vận hành',content:JSON.stringify(m,null,2),source:'Memory Engine',type:'brand',tags:['memory','brand','phong-cach','kinh-nghiem'],createdAt:new Date().toISOString()});
 setKnowledge(rows);renderKnowledge();toast('Đã lưu Memory Engine')
};

// AI Advisor
function advisorContext(question){
 const rows=retrieveKnowledge(question,6),m=getMemory();
 return {rows,m}
}
function renderAdvisorSources(rows){
 if(!$('advisorSources'))return;
 $('advisorContextCount').textContent=`${rows.length} nguồn liên quan`;
 $('advisorSources').innerHTML=rows.length?rows.map((x,i)=>`<div class="advisor-source"><b>${i+1}. ${x.topic}</b><small>${x.source} · ${x.type} · điểm ${x._score}</small><p>${x.content.slice(0,260)}${x.content.length>260?'…':''}</p></div>`).join(''):'<p>Không tìm thấy dữ liệu liên quan. AI vẫn có thể trả lời nhưng sẽ ít cá nhân hóa hơn.</p>'
}
async function askAdvisor(){
 const q=$('advisorQuestion').value.trim();if(!q)return toast('Hãy nhập câu hỏi');
 const {rows,m}=advisorContext(q);renderAdvisorSources(rows);
 $('advisorAnswer').textContent='Đang phân tích bằng tri thức nội bộ...';
 try{
   const j=await api('knowledge-advisor',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({
     question:q,
     memory:m,
     knowledge:rows.map(({topic,content,source,type,tags})=>({topic,content,source,type,tags}))
   })});
   $('advisorAnswer').textContent=j.answer||'Không có câu trả lời';
 }catch(e){
   // Local fallback remains useful if OpenAI is unavailable
   const local=rows.length
     ?`Tìm thấy ${rows.length} nguồn liên quan trong Kho tri thức. Gợi ý xử lý trước: ${rows[0].topic}. ${rows[0].content.slice(0,650)}`
     :`Chưa có nguồn nội bộ phù hợp. Hãy bổ sung file .txt vào Kho tri thức AI rồi hỏi lại.`;
   $('advisorAnswer').textContent=e.message+'\n\nGợi ý cục bộ:\n'+local
 }
}
if($('askAdvisor'))$('askAdvisor').onclick=askAdvisor;
document.querySelectorAll('.advisor-prompt').forEach(b=>b.onclick=()=>{$('advisorQuestion').value=b.textContent;askAdvisor()});

// Make Content Studio use retrieved knowledge + memory hints
const generateStudio25=generateStudio;
generateStudio=function(template='product'){
 const topic=$('studioTopic')?.value.trim();if(!topic)return toast('Hãy nhập chủ đề hoặc sản phẩm');
 const related=retrieveKnowledge(topic,3),m=getMemory();
 generateStudio25(template);
 if(window.currentStudioRows){
   window.currentStudioRows=window.currentStudioRows.map(x=>{
     const hint=related.length?`\n\nGỢI Ý TỪ KHO TRI THỨC:\n${related.map(r=>'- '+r.content.slice(0,220)).join('\n')}`:'';
     const mem=(m.voice||m.titleRules||m.cta)?`\n\nBỘ NHỚ PHONG CÁCH:\n${[m.voice,m.titleRules,m.cta,m.hashtags].filter(Boolean).join(' | ')}`:'';
     return {...x,content:x.content+hint+mem}
   });
   $('studioOutput').innerHTML=window.currentStudioRows.map((x,i)=>`<article class="studio-card"><div class="studio-card-head"><b>${platformName(x.platform)}</b><button onclick="saveStudioItem(${i})">Lưu</button></div><pre>${x.content}</pre></article>`).join('')
 }
}
if($('studioGenerate'))$('studioGenerate').onclick=()=>generateStudio('product');
document.querySelectorAll('[data-template]').forEach(b=>b.onclick=()=>generateStudio(b.dataset.template));



// ================= CORE 2.8 · LEARNING BRAIN =================
const EXPERIENCE_KEY='pho-core-28-experiences';

function getExperiences(){return safeJson(localStorage.getItem(EXPERIENCE_KEY)||'[]',[])}
function setExperiences(rows){localStorage.setItem(EXPERIENCE_KEY,JSON.stringify(rows))}
function nval(id){return Math.max(0,Number($(id)?.value||0))}
function engagementScore(x){
 const reach=Math.max(1,Number(x.reach||x.views||1));
 const interactions=Number(x.likes||0)+Number(x.comments||0)*3+Number(x.shares||0)*5+Number(x.clicks||0)*2;
 const rate=Math.min(1,interactions/reach);
 const rating=(Number(x.rating||3)-1)/4;
 return Math.round(Math.min(100, rate*7000*0.7 + rating*100*0.3))
}
function expLabel(v){return {group:'Group',fanpage:'Fanpage',personal:'Trang cá nhân',tiktok:'TikTok',instagram:'Instagram',youtube:'YouTube'}[v]||v}
function typeLabel(v){return {question:'Câu hỏi',reel:'Reel',story:'Story',minigame:'Mini game',product:'Sản phẩm',knowledge:'Kiến thức',other:'Khác'}[v]||v}

function aggregateExperiences(rows=getExperiences()){
 const byPlatform={},byType={},byTime={};
 rows.forEach(x=>{
   const s=engagementScore(x);
   ;[[byPlatform,x.platform],[byType,x.contentType],[byTime,x.time||'--:--']].forEach(([obj,key])=>{
     if(!obj[key])obj[key]={count:0,sum:0,comments:0,shares:0};
     obj[key].count++;obj[key].sum+=s;obj[key].comments+=Number(x.comments||0);obj[key].shares+=Number(x.shares||0)
   })
 });
 const rank=obj=>Object.entries(obj).map(([key,v])=>({key,...v,avg:Math.round(v.sum/v.count)})).sort((a,b)=>b.avg-a.avg);
 return {platforms:rank(byPlatform),types:rank(byType),times:rank(byTime)}
}
function renderLearningInsights(){
 if(!$('learningInsights'))return;
 const rows=getExperiences(),agg=aggregateExperiences(rows);
 const cards=[];
 if(agg.platforms[0])cards.push(`Nền tảng đang có điểm tốt nhất: <b>${expLabel(agg.platforms[0].key)}</b> · ${agg.platforms[0].avg}/100`);
 if(agg.types[0])cards.push(`Loại nội dung đang hiệu quả nhất: <b>${typeLabel(agg.types[0].key)}</b> · ${agg.types[0].avg}/100`);
 if(agg.times[0])cards.push(`Khung giờ đang cho kết quả tốt nhất: <b>${agg.times[0].key}</b> · ${agg.times[0].avg}/100`);
 const bestComment=agg.types.slice().sort((a,b)=>b.comments-a.comments)[0];
 if(bestComment)cards.push(`Loại tạo nhiều bình luận nhất trong dữ liệu đã nhập: <b>${typeLabel(bestComment.key)}</b>`);
 $('learningInsights').innerHTML=cards.length?cards.map(x=>`<div class="learning-card">${x}</div>`).join(''):'<p class="muted">Chưa đủ dữ liệu. Hãy lưu vài kết quả bài đăng để Learning Brain bắt đầu rút kinh nghiệm.</p>';
 const score=Math.min(100,Math.round(rows.length*4 + new Set(rows.map(x=>x.platform)).size*6 + new Set(rows.map(x=>x.contentType)).size*4));
 if($('learningScore'))$('learningScore').textContent=score
}
function renderExperiences(){
 if(!$('experienceList'))return;
 const q=($('expSearch')?.value||'').toLowerCase(),f=$('expFilter')?.value||'';
 let rows=getExperiences().filter(x=>(!f||x.platform===f)&&(!q||(x.topic+' '+x.lesson+' '+x.platform+' '+x.contentType).toLowerCase().includes(q)));
 $('experienceList').innerHTML=rows.length?rows.slice(0,100).map(x=>`<article class="experience-card">
  <div class="experience-head"><div><b>${x.topic||'Không tên'}</b><small>${expLabel(x.platform)} · ${typeLabel(x.contentType)} · ${x.time||'--:--'}</small></div><span class="score-pill">${engagementScore(x)}</span></div>
  <div class="exp-metrics"><span>Reach <b>${Number(x.reach||0).toLocaleString('vi-VN')}</b></span><span>Comment <b>${x.comments||0}</b></span><span>Share <b>${x.shares||0}</b></span><span>View <b>${Number(x.views||0).toLocaleString('vi-VN')}</b></span></div>
  ${x.lesson?`<p>${x.lesson}</p>`:''}
  <button class="secondary" onclick="deleteExperience('${x.id}')">Xóa</button>
 </article>`).join(''):'<p>Chưa có kinh nghiệm phù hợp.</p>';
 const all=getExperiences();
 if($('expCount'))$('expCount').textContent=all.length;
 if($('expPlatforms'))$('expPlatforms').textContent=new Set(all.map(x=>x.platform)).size;
 if($('expTypes'))$('expTypes').textContent=new Set(all.map(x=>x.contentType)).size;
 renderLearningInsights()
}
window.deleteExperience=id=>{setExperiences(getExperiences().filter(x=>x.id!==id));renderExperiences();toast('Đã xóa kinh nghiệm')}

function saveExperience(){
 const topic=$('expTopic').value.trim();if(!topic)return toast('Hãy nhập chủ đề');
 const x={
   id:'e_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),
   platform:$('expPlatform').value,contentType:$('expType').value,topic,
   reach:nval('expReach'),likes:nval('expLikes'),comments:nval('expComments'),shares:nval('expShares'),
   views:nval('expViews'),clicks:nval('expClicks'),time:$('expTime').value,
   rating:Number($('expRating').value),lesson:$('expLesson').value.trim(),createdAt:new Date().toISOString()
 };
 const rows=getExperiences();rows.unshift(x);setExperiences(rows.slice(0,3000));
 const k=getKnowledge().filter(i=>i.id!=='exp_'+x.id);
 k.unshift({id:'exp_'+x.id,topic:`Kinh nghiệm: ${topic}`,content:`Nền tảng: ${expLabel(x.platform)}\nLoại: ${typeLabel(x.contentType)}\nGiờ: ${x.time}\nĐiểm hiệu quả: ${engagementScore(x)}/100\nReach: ${x.reach}\nComment: ${x.comments}\nShare: ${x.shares}\nView: ${x.views}\nBài học: ${x.lesson||'Chưa ghi chú'}`,source:'Learning Brain',type:'kpi',tags:['learning',x.platform,x.contentType,topic.toLowerCase()],createdAt:x.createdAt});
 setKnowledge(k.slice(0,5000));renderKnowledge();
 renderExperiences();toast('Đã lưu và cập nhật Learning Brain')
}
if($('saveExperience'))$('saveExperience').onclick=saveExperience;
if($('expSearch'))$('expSearch').oninput=renderExperiences;
if($('expFilter'))$('expFilter').onchange=renderExperiences;
if($('clearExperiences'))$('clearExperiences').onclick=()=>{
 if(confirm('Xóa toàn bộ dữ liệu học trên thiết bị này?')){localStorage.removeItem(EXPERIENCE_KEY);renderExperiences();toast('Đã xóa dữ liệu học')}
};
if($('exportLearning'))$('exportLearning').onclick=()=>{
 const blob=new Blob([JSON.stringify({version:'2.8',exportedAt:new Date().toISOString(),experiences:getExperiences()},null,2)],{type:'application/json'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='pho-ai-learning-'+new Date().toISOString().slice(0,10)+'.json';a.click();URL.revokeObjectURL(a.href)
};

function clamp(n,min=0,max=100){return Math.max(min,Math.min(max,Math.round(n)))}
function scoreDraft(){
 const platform=$('scorePlatform').value,type=$('scoreType').value,hook=$('scoreHook').value.trim(),body=$('scoreBody').value.trim(),time=$('scoreTime').value;
 if(!hook&&!body)return toast('Hãy nhập tiêu đề hoặc nội dung');
 const text=(hook+' '+body).toLowerCase();
 let hookS=45;
 if(hook.length>=15&&hook.length<=90)hookS+=20;
 if(/[?？]/.test(hook))hookS+=12;
 if(/\b(vì sao|bạn|điều gì|bao nhiêu|đoán|bí quyết|không ngờ|thử)\b/i.test(hook))hookS+=10;
 if(hook.length>120)hookS-=15;
 let commentS=35;
 if(/[?？]/.test(text))commentS+=20;
 if(/\b(bình luận|chia sẻ|theo bạn|bạn chọn|a\.|b\.|c\.)\b/i.test(text))commentS+=20;
 if(type==='question'||type==='minigame')commentS+=15;
 let shareS=30;
 if(/\b(hướng dẫn|mẹo|bí quyết|cách làm|kiến thức|lưu lại)\b/i.test(text))shareS+=30;
 if(type==='knowledge'||type==='reel')shareS+=10;
 let fitS=65;
 if(platform==='group'&&(type==='question'||type==='minigame'))fitS+=25;
 if(platform==='fanpage'&&(type==='reel'||type==='product'||type==='knowledge'))fitS+=20;
 if(platform==='tiktok'&&type==='reel')fitS+=25;
 if(platform==='instagram'&&(type==='reel'||type==='story'))fitS+=25;
 if(platform==='youtube'&&(type==='reel'||type==='knowledge'))fitS+=15;
 const relevant=getExperiences().filter(x=>x.platform===platform && x.contentType===type);
 let learnS=50;
 if(relevant.length){
   learnS=clamp(relevant.reduce((s,x)=>s+engagementScore(x),0)/relevant.length);
   const sameTime=relevant.filter(x=>x.time===time);
   if(sameTime.length)learnS=clamp(learnS*0.7+(sameTime.reduce((s,x)=>s+engagementScore(x),0)/sameTime.length)*0.3)
 }
 hookS=clamp(hookS);commentS=clamp(commentS);shareS=clamp(shareS);fitS=clamp(fitS);learnS=clamp(learnS);
 const total=clamp(hookS*.24+commentS*.22+shareS*.18+fitS*.18+learnS*.18);
 const pairs=[['scoreHookBar','scoreHookVal',hookS],['scoreCommentBar','scoreCommentVal',commentS],['scoreShareBar','scoreShareVal',shareS],['scoreFitBar','scoreFitVal',fitS],['scoreLearnBar','scoreLearnVal',learnS]];
 pairs.forEach(([bar,val,n])=>{$(bar).value=n;$(val).textContent=n});
 $('scoreTotal').textContent=total;
 const tips=[];
 if(hookS<70)tips.push('Rút gọn Hook và tăng yếu tố tò mò/câu hỏi.');
 if(commentS<70)tips.push('Thêm một câu hỏi cụ thể để người xem dễ trả lời.');
 if(shareS<65)tips.push('Thêm giá trị có thể lưu/chia sẻ như mẹo, hướng dẫn hoặc checklist.');
 if(fitS<75)tips.push('Đổi định dạng để phù hợp hơn với nền tảng đã chọn.');
 if(learnS<60)tips.push('Dữ liệu cũ chưa ủng hộ mạnh định dạng này; nên thử A/B nhỏ trước.');
 if(!tips.length)tips.push('Cấu trúc đang tốt. Có thể đăng thử và nhớ nhập KPI sau đó để Learning Brain tiếp tục học.');
 $('scoreAdvice').innerHTML=`<b>Điểm dự kiến: ${total}/100</b><br>${tips.map((x,i)=>`${i+1}. ${x}`).join('<br>')}`
}
if($('scoreContent'))$('scoreContent').onclick=scoreDraft;

const advisorContext27=advisorContext;
advisorContext=function(question){
 const base=advisorContext27(question);
 const exp=getExperiences().map(x=>({...x,_score:knowledgeScore({topic:x.topic,tags:[x.platform,x.contentType],content:x.lesson||'',source:'Learning Brain',type:'kpi'},question)}))
   .filter(x=>x._score>0).sort((a,b)=>b._score-a._score).slice(0,4);
 if(exp.length){
   const learned=exp.map(x=>({topic:`Kinh nghiệm ${x.topic}`,content:`${expLabel(x.platform)} · ${typeLabel(x.contentType)} · ${x.time} · điểm ${engagementScore(x)}/100 · ${x.lesson||'không có ghi chú'}`,source:'Learning Brain',type:'kpi',tags:[x.platform,x.contentType],_score:x._score+2}));
   base.rows=[...learned,...base.rows].slice(0,8)
 }
 return base
}

async function loadAll(){renderPlanner();loadChannelPlan();renderLibrary();renderKnowledge();renderMemory();renderExperiences();await loadHealth();await Promise.all([loadConnections(),loadSnapshots(),loadFindings(),loadBudget(),loadBrief()])}
loadAll();
if('serviceWorker'in navigator)navigator.serviceWorker.register('/sw.js');