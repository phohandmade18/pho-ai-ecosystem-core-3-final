import{json,err}from'./lib/http.mjs';
import{sb}from'./lib/supabase.mjs';
import{log}from'./lib/log.mjs';

export default async req=>{
  try{
    if(req.method!=='POST')return err('Method Not Allowed',405);
    if(!process.env.OPENAI_API_KEY)return err('OPENAI_API_KEY chưa cấu hình',500);

    const body=await req.json().catch(()=>({}));
    const question=String(body.question||'').trim();
    if(!question)return err('Thiếu câu hỏi',400);

    const knowledge=Array.isArray(body.knowledge)?body.knowledge.slice(0,8):[];
    const memory=body.memory&&typeof body.memory==='object'?body.memory:{};

    const start=new Date();start.setDate(1);start.setHours(0,0,0,0);
    let used=0;
    try{
      const usage=await sb(`ai_usage?created_at=gte.${start.toISOString()}&select=estimated_cost_usd`);
      used=usage.reduce((s,x)=>s+Number(x.estimated_cost_usd||0),0);
    }catch{}
    const limit=Number(process.env.MONTHLY_AI_BUDGET_USD||5);
    if(used>=limit)return err('Đã đạt giới hạn chi phí AI tháng',429);

    const model=process.env.OPENAI_MODEL||'gpt-4.1-mini';
    const prompt=`Bạn là AI Advisor của PHỐ AI ECOSYSTEM, chuyên hỗ trợ vận hành hệ sinh thái mạng xã hội Phố Handmade.
YÊU CẦU:
- Trả lời bằng tiếng Việt, rõ ràng, thực dụng.
- Ưu tiên dữ liệu nội bộ được cung cấp.
- Không bịa số liệu hoặc kết quả KPI.
- Nếu dữ liệu chưa đủ, nói rõ điều gì còn thiếu.
- Đưa ra tối đa 5 hành động ưu tiên.
- Phân biệt dữ liệu thực tế, kinh nghiệm nội bộ và suy luận.

CÂU HỎI:
${question}

MEMORY ENGINE:
${JSON.stringify(memory)}

TRI THỨC LIÊN QUAN:
${JSON.stringify(knowledge)}

Hãy trả lời theo cấu trúc: Nhận định → Vì sao → Hành động ưu tiên → Nội dung gợi ý (nếu phù hợp).`;

    const r=await fetch('https://api.openai.com/v1/responses',{
      method:'POST',
      headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'content-type':'application/json'},
      body:JSON.stringify({model,input:prompt,max_output_tokens:1100})
    });
    const j=await r.json();
    if(!r.ok)throw new Error(j.error?.message||JSON.stringify(j));

    const answer=j.output_text||j.output?.flatMap(x=>x.content||[]).map(x=>x.text||'').join('\n')||'Không có nội dung';
    const cost=Number(process.env.AI_ESTIMATED_COST_PER_BRIEF_USD||0.03);
    try{await sb('ai_usage',{method:'POST',body:{task_type:'knowledge_advisor',model,estimated_cost_usd:cost}})}catch{}
    await log('knowledge-advisor','success','AI Advisor trả lời',{model,cost,knowledgeCount:knowledge.length});
    return json({ok:true,answer,knowledgeCount:knowledge.length,estimatedCostUsd:cost});
  }catch(e){
    try{await log('knowledge-advisor','error',e.message)}catch{}
    return err(e.message,500)
  }
};