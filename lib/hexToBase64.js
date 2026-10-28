export function hexToBase64(hex) {
  let h = hex.replace(/^0x/, "");
  h = h.slice(64);
  const lengthHex = h.slice(0, 64);
  const length = Number.parseInt(lengthHex, 16);
  const dataHex = h.slice(64, 64 + length * 2);
  return Buffer.from(dataHex, "hex").toString("base64");
}
