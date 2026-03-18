export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { prompt, apiId, apiPass, style = 'cinematic' } = req.body || {};
  if (!prompt || !apiId || !apiPass) return res.status(400).json({ error: '필수 값 누락' });

  try {
    // Higgsfield 인증 토큰 발급
    const authRes = await fetch('https://cloud.higgsfield.ai/api/v1/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_id: apiId, api_secret: apiPass })
    });
    const authData = await authRes.json();
    const token = authData.access_token || authData.token;
    if (!token) throw new Error('인증 실패: ' + JSON.stringify(authData));

    // 이미지 생성
    const imgRes = await fetch('https://cloud.higgsfield.ai/api/v1/images/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        prompt,
        style,
        width: 1024,
        height: 1024
      })
    });
    const imgData = await imgRes.json();
    const imageUrl = imgData.url || imgData.image_url || imgData.images?.[0]?.url;
    if (!imageUrl) throw new Error('이미지 URL 없음: ' + JSON.stringify(imgData));

    res.status(200).json({ url: imageUrl });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
