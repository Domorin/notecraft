import { z } from "zod";

export const titleLimiter = z.string().min(1).max(128);
