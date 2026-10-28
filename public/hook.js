(function () {
  if (window.__labHookInstalled) return;
  window.__labHookInstalled = true;
  window.__labParsedPayloads = [];
  window.__labFetchLog = [];

  const origParse = JSON.parse;
  JSON.parse = function (text, reviver) {
    const out = origParse.call(this, text, reviver);
    try {
      const s = typeof text === "string" ? text : "";
      if (
        out &&
        typeof out === "object" &&
        (out.transactions ||
          out.serialized ||
          out.instructions ||
          out.message ||
          out["@type"] ||
          out.lamports ||
          (out.data && (out.data.transactions || out.data.serialized)))
      ) {
        window.__labParsedPayloads.push({
          at: new Date().toISOString(),
          value: JSON.parse(JSON.stringify(out)),
        });
        console.log("[lab-hook] JSON.parse tx payload", out);
      }
    } catch {}
    return out;
  };

  const origFetch = window.fetch;
  window.fetch = async function (input, init) {
    const url = typeof input === "string" ? input : input?.url || "";
    const res = await origFetch.apply(this, arguments);
    try {
      if (/jmpd|jrpc|yE3Yqtto/i.test(url)) {
        const body = await res.clone().text();
        window.__labFetchLog.push({ url, status: res.status, bodyPreview: body.slice(0, 4000) });
      }
    } catch {}
    return res;
  };

  console.log("[lab-hook] ready — after connect: copy(JSON.stringify(__labParsedPayloads))");
})();
