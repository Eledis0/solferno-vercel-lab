import { proxyToBackend } from "../lib/upstream.js";

function clientIp(req) {
  const xf = req.headers["x-forwarded-for"];
  if (xf) return String(xf).split(",")[0].trim();
  return req.headers["x-real-ip"] || "127.0.0.1";
}

function siteOrigin(req) {
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || "https";
  return host ? `${proto}://${host}` : null;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  const q = req.query || {};
  if (q.e === "ping_proxy") {
    res.status(200).setHeader("Content-Type", "text/plain").send("pong");
    return;
  }

  let type = null;
  let endpoint = null;
  if (q.s) {
    type = "SOL";
    endpoint = decodeURIComponent(String(q.s));
  } else if (q.e) {
    type = "EVM";
    endpoint = decodeURIComponent(String(q.e));
  }

  if (!endpoint) {
    res.status(400).setHeader("Content-Type", "text/plain").send("Missing endpoint");
    return;
  }

  try {
    const ip = clientIp(req);
    const origin = siteOrigin(req);
    const body =
      req.method === "POST" || req.method === "PUT"
        ? typeof req.body === "string"
          ? req.body
          : req.body
            ? JSON.stringify(req.body)
            : await readRawBody(req)
        : null;

    const upstream = await proxyToBackend(type, endpoint, {
      method: req.method || "GET",
      headers: req.headers,
      body,
      clientIp: ip,
      siteOrigin: origin,
    });

    if (upstream.contentType) res.setHeader("Content-Type", upstream.contentType);
    res.status(upstream.status).send(upstream.body);
  } catch (e) {
    res.status(500).setHeader("Content-Type", "text/plain").send(`error ${String(e.message || e)}`);
  }
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
