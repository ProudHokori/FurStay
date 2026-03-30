import { z } from "zod";

export const petSchema = z.object({
  name: z.string().min(1, "Pet name is required"),
  type: z.string().min(1, "Pet type is required"),
  breed: z.string().optional(),
  age: z.coerce.number().int().min(0).optional(),
  notes: z.string().optional(),
});
