import { z } from "zod";

export const jobSchema = z.object({
  petId: z.string().min(1),
  title: z.string().min(3),
  description: z.string().min(10),
  location: z.string().optional(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  paymentAmount: z.coerce.number().min(1),
});
