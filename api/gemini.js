export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { prompt, apiKey, size = '1:1' } = req.body || {};
  if (!prompt || !apiKey) return res.status(400).json({ error: '필수 값 누락' });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
        })
      }
    );
    const data = await response.json();
    const imgPart = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (imgPart) {
      const b64 = imgPart.inlineData.data;
      const mime = imgPart.inlineData.mimeType || 'image/png';
      res.status(200).json({ imageData: b64, mimeType: mime });
    } else {
      res.status(400).json({ error: '이미지 생성 실패', raw: data });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
