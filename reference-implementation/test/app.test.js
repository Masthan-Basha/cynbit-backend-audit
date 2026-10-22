import test from "node:test";
import assert from "node:assert/strict";
import { createApp, memoryQueue } from "../src/app.js";
import { loadConfig } from "../src/config.js";

const silent = { error() {}, log() {} };

async function start() {
  const queue = memoryQueue();
  const config = loadConfig({ ALLOWED_ORIGINS: "https://ok.example" });
  const server = createApp({ config, queue, logger: silent }).listen(0);
  const base = `http://127.0.0.1:${server.address().port}`;
  return { base, queue, close: () => server.close() };
}

const post = (url, body, headers = {}) =>
  fetch(url, { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body) });

test("security headers present, x-powered-by absent", async () => {
  const s = await start();
  const r = await fetch(`${s.base}/healthz`);
  assert.ok(r.headers.get("content-security-policy"));
  assert.ok(r.headers.get("strict-transport-security"));
  assert.equal(r.headers.get("x-powered-by"), null);
  assert.ok(r.headers.get("x-request-id"));
  s.close();
});

test("CORS: allowed origin echoed, unknown origin not", async () => {
  const s = await start();
  const ok = await fetch(`${s.base}/healthz`, { headers: { Origin: "https://ok.example" } });
  const bad = await fetch(`${s.base}/healthz`, { headers: { Origin: "https://evil.example" } });
  assert.equal(ok.headers.get("access-control-allow-origin"), "https://ok.example");
  assert.equal(bad.headers.get("access-control-allow-origin"), null);
  s.close();
});

test("contact: valid input is queued with 202", async () => {
  const s = await start();
  const r = await post(`${s.base}/v1/contact`, { name: "A", email: "a@b.co", message: "hi" });
  assert.equal(r.status, 202);
  assert.equal(s.queue.items.length, 1);
  s.close();
});

test("contact: invalid input -> 422 with uniform error shape", async () => {
  const s = await start();
  const r = await post(`${s.base}/v1/contact`, { name: "", email: "nope", message: "x", extra: 1 });
  const body = await r.json();
  assert.equal(r.status, 422);
  assert.equal(body.error.code, "validation_failed");
  assert.ok(body.error.requestId);
  s.close();
});

test("contact: honeypot filled -> accepted but not queued", async () => {
  const s = await start();
  const r = await post(`${s.base}/v1/contact`, { name: "A", email: "a@b.co", message: "hi", website: "spam" });
  assert.equal(r.status, 202);
  assert.equal(s.queue.items.length, 0);
  s.close();
});

test("oversized body rejected with 413", async () => {
  const s = await start();
  const r = await post(`${s.base}/v1/contact`, { name: "A", email: "a@b.co", message: "x".repeat(20000) });
  assert.equal(r.status, 413);
  s.close();
});

test("auth: protected route needs cookie; cookie flags are safe", async () => {
  const s = await start();
  assert.equal((await fetch(`${s.base}/v1/me`)).status, 401);
  const login = await post(`${s.base}/v1/auth/login`, {});
  const cookie = login.headers.get("set-cookie");
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /SameSite=Strict/i);
  const me = await fetch(`${s.base}/v1/me`, { headers: { cookie: cookie.split(";")[0] } });
  assert.equal(me.status, 200);
  s.close();
});

test("services: ETag enables 304", async () => {
  const s = await start();
  const first = await fetch(`${s.base}/v1/services`);
  const etag = first.headers.get("etag");
  assert.ok(first.headers.get("cache-control"));
  const second = await fetch(`${s.base}/v1/services`, { headers: { "if-none-match": etag } });
  assert.equal(second.status, 304);
  s.close();
});

test("unknown route -> uniform 404", async () => {
  const s = await start();
  const r = await fetch(`${s.base}/nope`);
  assert.equal(r.status, 404);
  assert.equal((await r.json()).error.code, "not_found");
  s.close();
});

test("rate limit on contact endpoint -> 429", async () => {
  const s = await start();
  let last;
  for (let i = 0; i < 7; i++) last = await post(`${s.base}/v1/contact`, { name: "A", email: "a@b.co", message: "hi" });
  assert.equal(last.status, 429);
  s.close();
});
