const headers = {
  "content-type": "application/json; charset=utf-8"
};

const json = (status, body) => ({
  statusCode: status,
  headers,
  body: JSON.stringify(body)
});

function extractOutputText(data) {
  if (data?.output_text) return data.output_text;

  const chunks = [];

  for (const item of data?.output || []) {
    for (const c of item?.content || []) {
      if (c?.text) chunks.push(c.text);
    }
  }

  return chunks.join("\n");
}

function parseJsonLoose(s) {
  const clean = String(s || "")
    .replace(/^```json\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  const a = clean.indexOf("{");
  const b = clean.lastIndexOf("}");

  return JSON.parse(clean.slice(a, b + 1));
}

const schema = `{
  "topic":"",
  "product":"",
  "style":"",
  "title":"",
  "hook":"",
  "content":"",
  "story":"",
  "insight":"",
  "cta":"",
  "hashtags":[],
  "keywords":[],
  "channel":"",
  "format":"",
  "duration":"",
  "notes":""
}`;

export default async (req) => {
  try {

    if (req.method !== "POST") {
      return json(405, {
        error: "Method not allowed"
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return json(500, {
        error: "Thiếu OPENAI_API_KEY trong Netlify"
      });
    }

    const body = JSON.parse(req.body || "{}");

    const mode =
      body.mode === "image"
        ? "image"
        : "text";

    const prompt = `
Bạn là bộ Semantic Router của PHỐ AI ECOSYSTEM CORE 3.1.

Nhiệm vụ:
Đọc dữ liệu người dùng cung cấp và tự động phân loại nội dung.

Chỉ trả về DUY NHẤT một JSON hợp lệ theo cấu trúc sau:

${schema}

Ý nghĩa các trường:

topic = chủ đề chính
product = sản phẩm
style = phong cách nội dung
title = tiêu đề
hook = câu mở đầu thu hút
content = nội dung chính
story = câu chuyện
insight = insight khách hàng
cta = lời kêu gọi hành động
hashtags = danh sách hashtag
keywords = từ khóa SEO
channel = kênh phù hợp
format = định dạng nội dung
duration = thời lượng
notes = ghi chú và đề xuất AI

QUY TẮC:

1. Hiểu ngữ nghĩa, không chỉ tìm từ khóa.
2. Không bịa thông tin không có trong dữ liệu.
3. Nếu thiếu trường thì để chuỗi rỗng.
4. Nếu có nhiều hashtag hoặc keyword thì dùng mảng.
5. channel ưu tiên một hoặc nhiều kênh:
   - Trang cá nhân
   - Group Phố Handmade
   - Fanpage
   - YouTube
   - TikTok
   - Pinterest
6. format có thể là:
   - Facebook Post
   - Reel
   - Story
   - Audio
   - YouTube Short
   - Pinterest Pin
7. Nếu đầu vào là ảnh:
   - nhận diện sản phẩm
   - chất liệu nhìn thấy được
   - màu sắc
   - phong cách
   - bối cảnh
   - cảm xúc
   - nhóm khách hàng
   - góc kể chuyện
   - đề xuất nội dung
8. Viết bằng tiếng Việt.
9. Không thêm markdown.
10. Chỉ trả JSON.
`;

    const content = [
      {
        type: "input_text",
        text:
          prompt +
          "\n\nTEXT BỔ SUNG:\n" +
          (body.text || "")
      }
    ];

    if (mode === "image") {

      for (const img of (body.images || []).slice(0, 4)) {

        if (
          typeof img === "string" &&
          img.startsWith("data:image/")
        ) {
          content.push({
            type: "input_image",
            image_url: img,
            detail: "auto"
          });
        }
      }

    } else {

      content.push({
        type: "input_text",
        text:
          "NỘI DUNG CẦN PHÂN LOẠI:\n" +
          (body.text || "")
      });

    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",

        headers: {
          authorization:
            `Bearer ${process.env.OPENAI_API_KEY}`,

          "content-type":
            "application/json"
        },

        body: JSON.stringify({

          model:
            process.env.OPENAI_MODEL ||
            "gpt-5-mini",

          input: [
            {
              role: "user",
              content
            }
          ]

        })
      }
    );

    const data = await response.json();

    if (!response.ok) {

      return json(
        response.status,
        {
          error:
            data?.error?.message ||
            "OpenAI API error"
        }
      );

    }

    const text =
      extractOutputText(data);

    let structured;

    try {

      structured =
        parseJsonLoose(text);

    } catch {

      return json(502, {
        error:
          "AI trả về JSON chưa hợp lệ",

        raw:
          text.slice(0, 1200)
      });

    }

    return json(200, {
      ok: true,
      structured
    });

  } catch (e) {

    return json(500, {
      error:
        e.message
    });

  }
};=
