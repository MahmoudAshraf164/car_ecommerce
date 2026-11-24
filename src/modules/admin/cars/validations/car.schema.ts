import { z } from "zod";

export const carConditionEnum = z.enum(["new", "used"]);
export const transmissionTypeEnum = z.enum(["manual", "automatic", "cvt", "dual_clutch"]);
export const fuelTypeEnum = z.enum(["petrol", "diesel", "electric", "hybrid", "plugin_hybrid", "gas"]);
export const driveTypeEnum = z.enum(["fwd", "rwd", "awd", "4wd"]);
export const bodyTypeEnum = z.enum(["sedan", "suv", "hatchback", "coupe", "convertible", "van", "truck", "crossover", "other"]);
export const listingStatusEnum = z.enum(["draft", "available", "reserved", "sold", "archived"]);

export const extraSpecItemSchema = z.object({
  key: z.string().min(1, "اسم الميزة مطلوب"),
  value: z.string().min(1, "قيمة الميزة مطلوبة"),
});

export const carImageSchema = z.object({
  id: z.string().optional(),
  image_url: z.string().url("رابط الصورة غير صالح"),
  display_order: z.number().default(0),
  is_primary: z.boolean().default(false),
});

export const carFormSchema = z.object({
  title: z.string().min(3, "اسم السيارة يجب أن يكون 3 حروف على الأقل"),
  slug: z.string().optional().or(z.literal("")),
  brand_id: z.string().min(1, "يرجى اختيار الماركة"),
  model_id: z.string().optional().nullable().default(null),
  origin: z.string().optional().nullable().default(""),
  trim_level: z.string().optional().nullable().default(""),
  year: z.coerce
    .number()
    .min(1900, "السنة غير صالحة")
    .max(new Date().getFullYear() + 1, "السنة غير صالحة"),
  price: z.coerce
    .number()
    .min(0, "السعر يجب أن يكون 0 أو أكثر"),
  condition: carConditionEnum.default("used"),
  transmission: transmissionTypeEnum.default("automatic"),
  fuel_type: fuelTypeEnum.default("petrol"),
  drive_type: driveTypeEnum.optional().nullable().default("fwd"),
  body_type: bodyTypeEnum.default("sedan"),
  mileage: z.coerce
    .number()
    .min(0, "عدد الكيلومترات لا يمكن أن يكون سالباً")
    .default(0),
  engine_capacity: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
    z.number().nullable().optional()
  ),
  color: z.string().optional().nullable(),
  status: listingStatusEnum.default("available"),
  featured: z.boolean().default(false),
  description: z.string().optional().nullable(),
  features: z.array(z.string()).default([]),
  extra_specs: z.array(extraSpecItemSchema).default([]),
  images: z.array(carImageSchema).default([]),
});


export type CarFormValues = z.infer<typeof carFormSchema>;

