export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { keywords, clientId, clientSecret } = req.body || {};
  if (!keywords || !clientId || !clientSecret) return res.status(400).json({ error: '필수 값 누락' });

  try {
    const body = JSON.stringify({
      startDate: getDateMonthsAgo(3),
      endDate: getToday(),
      timeUnit: 'week',
      keywordGroups: keywords.map(kw => ({
        groupName: kw,
        keywords: [kw]
      }))
    });

    const r = await fetch('https://openapi.naver.com/v1/datalab/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret
      },
      body
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}
function getDateMonthsAgo(months) {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString().slice(0, 10);
}
