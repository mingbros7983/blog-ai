export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { siteUrl, username, password, title, content, status = 'publish' } = req.body || {};
  if (!siteUrl || !username || !password || !title) 
    return res.status(400).json({ error: '필수 값 누락' });

  try {
    const credentials = Buffer.from(`${username}:${password}`).toString('base64');
    const r = await fetch(`${siteUrl}/wp-json/wp/v2/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify({ title, content, status })
    });
    const data = await r.json();
    if (data.code) throw new Error(data.message || JSON.stringify(data));
    res.status(200).json({ success: true, url: data.link, id: data.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
