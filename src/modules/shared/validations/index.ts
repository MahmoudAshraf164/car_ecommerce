import { z } from "zod";

export const leadFormSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب (حرفان على الأقل)"),
  phone: z.string().min(8, "رقم الهاتف غير صحيح"),
  email: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.literal("")),
  interestType: z.enum(["cars", "scooters", "real_estate"]),
  itemId: z.string().optional(),
  notes: z.string().optional(),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;
