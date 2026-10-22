import { Router } from "express";
import { createHash } from "node:crypto";

// R-06: cacheable read endpoint with ETag / conditional GET.
export function servicesRouter() {
  const data = [
    { id: "data-ai", name: "Data & AI" },
    { id: "workspace", name: "Modern Workspace" },
    { id: "cloud", name: "Hybrid Cloud" },
    { id: "security", name: "Security" },
  ];
  const etag = `"${createHash("sha1").update(JSON.stringify(data)).digest("hex")}"`;
  const r = Router();
  r.get("/", (req, res) => {
    res.set({ ETag: etag, "Cache-Control": "public, max-age=300, stale-while-revalidate=60" });
    if (req.headers["if-none-match"] === etag) return res.status(304).end();
    res.json({ data });
  });
  return r;
}
