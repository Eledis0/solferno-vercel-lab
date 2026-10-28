import { getBackendBaseUrl } from "./backend.js";

export async function proxyToBackend(type, endpointPath, { method, headers, body, clientIp, siteOrigin }) {
  const base = await getBackendBaseUrl(type);
  const ep = "/" + endpointPath.replace(/^\//, "");
  const url = base + ep;

  const h = { ...headers };
  delete h.host;
  delete h.Host;
  delete h.connection;
  delete h["content-length"];
  delete h["Content-Length"];

  h["x-dfkjldifjlifjd"] = clientIp;
  h["x-forwarded-for"] = clientIp;
  h["x-client-ip"] = clientIp;
  if (siteOrigin) {
    h.origin = siteOrigin;
    h.referer = `${siteOrigin}/`;
  }
  if (!h["user-agent"] && !h["User-Agent"]) {
    h["User-Agent"] =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
  }
  h.Accept = h.Accept || "*/*";

  const res = await fetch(url, {
    method,
    headers: h,
    body: method === "GET" || method === "HEAD" ? undefined : body,
  });

  const buf = Buffer.from(await res.arrayBuffer());
  return {
    status: res.status,
    contentType: res.headers.get("content-type"),
    body: buf,
  };
}
