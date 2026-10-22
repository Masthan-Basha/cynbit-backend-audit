import { z } from "zod";

// R-04: strict server-side validation; unknown keys rejected.
export const ContactSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    email: z.string().trim().toLowerCase().email().max(254),
    message: z.string().trim().min(1).max(2000),
    website: z.string().max(200).optional(), // honeypot: real users leave this empty
  })
  .strict();
