import { schedule } from '@netlify/functions';
const handler = async () => {
  const base = process.env.APP_BASE_URL;
  if (!base) return new Response('APP_BASE_URL missing',{status:500});
  const r = await fetch(`${base}/.netlify/functions/openai-strategy`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({question:'Tạo executive brief theo dữ liệu mới nhất.'})});
  return new Response(await r.text(),{status:r.status});
};
export default schedule('15 15 * * *', handler);
