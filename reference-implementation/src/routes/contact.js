import { Router } from "express";
import { ContactSchema } from "../schemas/contact.js";

// Replace `queue` with SQS / BullMQ / etc. A worker delivers to CRM/email asynchronously.
export function contactRouter({ queue, limiter }) {
  const r = Router();
  r.post("/", limiter, async (req, res, next) => {
    try {
      if (!req.is("application/json")) {
        return next({ status: 415, code: "unsupported_media_type", message: "Use application/json" });
      }
      const parsed = ContactSchema.safeParse(req.body);
      if (!parsed.success) {
        return next({
          status: 422,
          code: "validation_failed",
          message: "Invalid input",
          details: parsed.error.flatten().fieldErrors,
        });
      }
      if (parsed.data.website) return res.status(202).json({ status: "accepted" }); // silently drop bots
      await queue.enqueue({ type: "contact", ...parsed.data, receivedAt: new Date().toISOString() });
      res.status(202).json({ status: "accepted" });
    } catch (e) {
      next(e);
    }
  });
  return r;
}
