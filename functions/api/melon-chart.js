const UPSTREAM_ENDPOINT = "https://gyfhwndqmjmerjvpovmx.supabase.co/functions/v1/melon-chart";

export async function onRequest({ request }) {
  const method = request.method.toUpperCase();

  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "apikey, authorization, content-type, x-client-info",
        "Cache-Control": "no-store"
      }
    });
  }

  if (method !== "GET" && method !== "POST") {
    return Response.json({ error: "허용되지 않은 요청 방식입니다." }, { status: 405 });
  }

  const apikey = request.headers.get("apikey");
  if (!apikey) {
    return Response.json({ error: "차트 서버 키가 없습니다." }, { status: 401 });
  }

  const incomingUrl = new URL(request.url);
  const upstreamUrl = new URL(UPSTREAM_ENDPOINT);
  upstreamUrl.search = incomingUrl.search;

  const headers = new Headers({
    "apikey": apikey,
    "accept": "application/json"
  });
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  const init = {
    method,
    headers,
    cache: "no-store",
    redirect: "follow"
  };
  if (method === "POST") {
    init.body = await request.text();
  }

  try {
    const upstream = await fetch(upstreamUrl.toString(), init);
    const responseHeaders = new Headers({
      "Cache-Control": "no-store",
      "X-Melonitor-Proxy": "pages"
    });
    const upstreamContentType = upstream.headers.get("content-type");
    if (upstreamContentType) responseHeaders.set("content-type", upstreamContentType);
    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders
    });
  } catch (error) {
    return Response.json({
      error: "차트 서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요."
    }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
