// Vercel serverless function: GET /api/facebook-feed
//
// Fetches recent posts from the RCFS Facebook Page via the Graph API and
// returns clean, trimmed JSON to the frontend. Credentials come only from
// environment variables (FB_PAGE_ID, FB_PAGE_TOKEN) set in the Vercel
// project dashboard -- never hardcoded, never echoed back in a response
// or error message.
//
// Caching: Vercel serverless functions are stateless between invocations
// (cold starts and multiple concurrent instances don't share memory), so
// an in-memory cache can't reliably cut down on Graph API calls. Instead
// this sets Cache-Control: s-maxage, which lets Vercel's own edge network
// cache the response for real -- repeat requests within the window are
// served from the edge without this function (or the Graph API) being hit
// again at all.
const CACHE_SECONDS = 3600; // 1 hour

export default async function handler(req, res) {
  const pageId = process.env.FB_PAGE_ID;
  const pageToken = process.env.FB_PAGE_TOKEN;

  if (!pageId || !pageToken) {
    res.status(500).json({ error: 'Facebook feed is not configured on the server.' });
    return;
  }

  const url =
    `https://graph.facebook.com/v21.0/${encodeURIComponent(pageId)}/posts` +
    `?fields=message,created_time,full_picture,permalink_url&access_token=${encodeURIComponent(pageToken)}`;

  try {
    const fbRes = await fetch(url);
    const data = await fbRes.json();

    if (!fbRes.ok || data.error) {
      // Log server-side for debugging, but never forward Graph API error
      // details (which can include revealing account/app info) to the client.
      console.error('Facebook Graph API error:', data.error || `HTTP ${fbRes.status}`);
      res.status(502).json({ error: 'Could not load Facebook posts right now.' });
      return;
    }

    const posts = (Array.isArray(data.data) ? data.data : [])
      .filter((p) => p.message || p.full_picture)
      .slice(0, 12)
      .map((p) => ({
        id: p.id,
        message: p.message || null,
        imageUrl: p.full_picture || null,
        permalink: p.permalink_url || null,
        createdTime: p.created_time || null
      }));

    res.setHeader('Cache-Control', `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=86400`);
    res.status(200).json({ posts });
  } catch (err) {
    console.error('Facebook feed fetch failed:', err);
    res.status(502).json({ error: 'Could not load Facebook posts right now.' });
  }
}
