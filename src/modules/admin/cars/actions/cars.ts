"use server";

import { createServerClient } from "@/modules/shared/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { carFormSchema, CarFormValues } from "../validations/car.schema";
import { CarFilterParams, CarWithRelations } from "../types/car.types";

function slugify(text: string): string {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u0600-\u06FF-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

/**
 * Fetch all brands ordered by name
 */
export async function getBrands() {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("brands")
      .select("id, name, created_at")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching brands:", error.message);
      return { data: [], error: error.message };
    }
    return { data: data || [], error: null };
  } catch (err: any) {
    return { data: [], error: err?.message || "Failed to fetch brands" };
  }
}

/**
 * Fetch car models belonging to a specific brand ID
 */
export async function getModelsByBrand(brandId: string) {
  if (!brandId) return { data: [], error: null };
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("car_models")
      .select("id, brand_id, name, created_at")
      .eq("brand_id", brandId)
      .order("name", { ascending: true });

    if (error) {
      console.error(`Error fetching models for brand ${brandId}:`, error.message);
      return { data: [], error: error.message };
    }
    return { data: data || [], error: null };
  } catch (err: any) {
    return { data: [], error: err?.message || "Failed to fetch models" };
  }
}

/**
 * Add a new car with robust error handling
 */
export async function addCar(formData: any) {
  try {
    const supabase = await createServerClient();

    const title = formData.title || formData.get?.("title");
    const brand_id = formData.brand_id || formData.get?.("brand_id");
    const model_id = formData.model_id || formData.get?.("model_id");
    const year = Number(formData.year || formData.get?.("year") || 2024);
    const price = Number(formData.price || formData.get?.("price") || 0);
    const description = formData.description || formData.get?.("description") || null;
    const status = formData.status || formData.get?.("status") || "available";
    const images = formData.images || [];

    if (!title || !brand_id || !model_id) {
      return { success: false, error: "يرجى اختيار الماركة والموديل وإدخال عنوان السيارة" };
    }

    const generatedSlug = `${slugify(title)}-${year}-${Date.now().toString().slice(-4)}`;

    const { data: newCar, error } = await supabase
      .from("cars")
      .insert({
        title,
        slug: generatedSlug,
        brand_id,
        model_id,
        year,
        price,
        status,
        description,
        images: Array.isArray(images) ? JSON.stringify(images) : images,
      })
      .select("id, slug")
      .single();

    if (error || !newCar) {
      console.error("addCar error:", error);
      return { success: false, error: error?.message || "فشل في حفظ البيانات" };
    }

    try {
      revalidatePath("/admin/cars");
      revalidatePath("/cars");
    } catch (e) {
      // ignore during render
    }

    return { success: true, carId: newCar.id, slug: newCar.slug };
  } catch (err: any) {
    console.error("Unhandled error in addCar:", err);
    return { success: false, error: err?.message || "حدث خطأ أثناء الاتصال بقاعدة البيانات" };
  }
}

/**
 * Fetch cars with optional filters and pagination
 */
export async function getCars(filters: CarFilterParams = {}) {
  try {
    const supabase = await createServerClient();

    const {
      search,
      brand_id,
      model_id,
      condition,
      transmission,
      fuel_type,
      body_type,
      min_price,
      max_price,
      min_year,
      max_year,
      status,
      featured,
      page = 1,
      limit = 12,
      sort_by = "created_at",
      sort_order = "desc",
    } = filters;

    let query = supabase
      .from("cars")
      .select(
        `
        *,
        brand:brands(*),
        car_models(*),
        car_images(*)
      `,
        { count: "exact" }
      )
      .is("deleted_at", null);

    if (search && search.trim() !== "") {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (brand_id) query = query.eq("brand_id", brand_id);
    if (model_id) query = query.eq("model_id", model_id);
    if (condition) query = query.eq("condition", condition);
    if (transmission) query = query.eq("transmission", transmission);
    if (fuel_type) query = query.eq("fuel_type", fuel_type);
    if (body_type) query = query.eq("body_type", body_type);
    if (status) query = query.eq("status", status);
    if (typeof featured === "boolean") query = query.eq("featured", featured);

    if (min_price !== undefined && min_price > 0) query = query.gte("price", min_price);
    if (max_price !== undefined && max_price > 0) query = query.lte("price", max_price);
    if (min_year !== undefined) query = query.gte("year", min_year);
    if (max_year !== undefined) query = query.lte("year", max_year);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.order(sort_by, { ascending: sort_order === "asc" }).range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.warn("Notice when fetching cars:", error.message);
      return { data: [], total: 0, page, totalPages: 0, error: null };
    }

    const total = count || 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      data: (data || []) as CarWithRelations[],
      total,
      page,
      totalPages,
      error: null,
    };
  } catch (err: any) {
    console.warn("Handled exception in getCars:", err?.message || err);
    return { data: [], total: 0, page: 1, totalPages: 0, error: null };
  }
}

/**
 * Fetch a single car by ID
 */
export async function getCarById(id: string) {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("cars")
      .select(
        `
        *,
        brand:brands(*),
        car_models(*),
        car_images(*),
        car_features(
          feature_id,
          features(*)
        )
      `
      )
      .eq("id", id)
      .is("deleted_at", null)
      .order("display_order", { foreignTable: "car_images", ascending: true })
      .order("created_at", { foreignTable: "car_images", ascending: true })
      .single();

    if (error) {
      console.warn(`Notice fetching car by ID ${id}:`, error.message);
      return { data: null, error: error.message };
    }

    const formattedFeatures = (data.car_features || [])
      .map((cf: any) => cf.features)
      .filter(Boolean);

    const car: CarWithRelations = {
      ...data,
      features: formattedFeatures,
    };

    return { data: car, error: null };
  } catch (err: any) {
    return { data: null, error: err?.message || "Failed to fetch car" };
  }
}

/**
 * Fetch a single car by Slug (for public detail page)
 */
export async function getCarBySlug(slug: string) {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("cars")
      .select(
        `
        *,
        brand:brands(*),
        car_models(*),
        car_images(*),
        car_features(
          feature_id,
          features(*)
        )
      `
      )
      .eq("slug", slug)
      .is("deleted_at", null)
      .single();

    if (error) {
      console.warn(`Notice fetching car by slug ${slug}:`, error.message);
      return { data: null, error: error.message };
    }

    const formattedFeatures = (data.car_features || [])
      .map((cf: any) => cf.features)
      .filter(Boolean);

    const car: CarWithRelations = {
      ...data,
      features: formattedFeatures,
    };

    return { data: car, error: null };
  } catch (err: any) {
    return { data: null, error: err?.message || "Failed to fetch car by slug" };
  }
}

async function resolveBrandAndModel(supabase: any, brandInput: string, modelInput: string) {
  let finalBrandId = brandInput;
  let finalModelId = modelInput;

  if (!brandInput) return { brand_id: brandInput, model_id: modelInput };

  // Check if brandInput is a UUID
  const isBrandUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(brandInput);

  if (!isBrandUuid) {
    // Find existing brand by name or create new
    let { data: existingBrand } = await supabase
      .from("brands")
      .select("id")
      .ilike("name", brandInput.trim())
      .maybeSingle();

    if (!existingBrand) {
      const { data: newBrand, error: bErr } = await supabase
        .from("brands")
        .insert({ name: brandInput.trim(), vehicle_type: "car" })
        .select("id")
        .single();
      if (!bErr && newBrand) {
        finalBrandId = newBrand.id;
      }
    } else {
      finalBrandId = existingBrand.id;
    }
  }

  if (modelInput && finalBrandId) {
    const isModelUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(modelInput);

    if (!isModelUuid) {
      let { data: existingModel } = await supabase
        .from("car_models")
        .select("id")
        .eq("brand_id", finalBrandId)
        .ilike("name", modelInput.trim())
        .maybeSingle();

      if (!existingModel) {
        const { data: newModel, error: mErr } = await supabase
          .from("car_models")
          .insert({ brand_id: finalBrandId, name: modelInput.trim() })
          .select("id")
          .single();
        if (!mErr && newModel) {
          finalModelId = newModel.id;
        }
      } else {
        finalModelId = existingModel.id;
      }
    }
  }

  return { brand_id: finalBrandId, model_id: finalModelId };
}

/**
 * Create a new car
 */
export async function createCar(formData: CarFormValues) {
  const validated = carFormSchema.safeParse(formData);
  if (!validated.success) {
    return { success: false, error: validated.error.format() };
  }

  const supabase = await createServerClient();

  const {
    title,
    slug,
    brand_id,
    model_id,
    year,
    price,
    condition,
    transmission,
    fuel_type,
    drive_type,
    body_type,
    mileage,
    engine_capacity,
    color,
    status,
    featured,
    description,
    features,
    images,
  } = validated.data;

  // Resolve brand and model IDs (whether UUID or text strings)
  const resolved = await resolveBrandAndModel(supabase, brand_id, model_id);

  const generatedSlug =
    slug && slug.trim() !== ""
      ? slugify(slug)
      : `${slugify(title)}-${year}-${Date.now().toString().slice(-4)}`;

  const { data: newCar, error: carError } = await supabase
    .from("cars")
    .insert({
      title,
      slug: generatedSlug,
      brand_id: resolved.brand_id,
      model_id: resolved.model_id,
      year,
      price,
      condition,
      transmission,
      fuel_type,
      drive_type,
      body_type,
      mileage,
      engine_capacity: engine_capacity || null,
      color: color || null,
      status,
      featured,
      description: description || null,
    })
    .select()
    .single();

  if (carError || !newCar) {
    console.error("Error creating car:", carError);
    return { success: false, error: carError?.message || "فشل في إضافة السيارة" };
  }

  if (images && images.length > 0) {
    const imageInserts = images.map((img, idx) => ({
      car_id: newCar.id,
      image_url: img.image_url,
      display_order: img.display_order ?? idx,
      is_primary: img.is_primary ?? idx === 0,
    }));
    await supabase.from("car_images").insert(imageInserts);
  }

  if (features && features.length > 0) {
    const featureInserts = features.map((feature_id) => ({
      car_id: newCar.id,
      feature_id,
    }));
    await supabase.from("car_features").insert(featureInserts);
  }

  revalidatePath("/admin/cars");
  revalidatePath("/cars");

  return { success: true, carId: newCar.id, slug: newCar.slug };
}

/**
 * Update an existing car
 */
export async function updateCar(id: string, formData: CarFormValues) {
  const validated = carFormSchema.safeParse(formData);
  if (!validated.success) {
    return { success: false, error: validated.error.format() };
  }

  const supabase = await createServerClient();

  const {
    title,
    slug,
    brand_id,
    model_id,
    year,
    price,
    condition,
    transmission,
    fuel_type,
    drive_type,
    body_type,
    mileage,
    engine_capacity,
    color,
    status,
    featured,
    description,
    features,
    images,
  } = validated.data;

  // Resolve brand and model IDs (whether UUID or text strings)
  const resolved = await resolveBrandAndModel(supabase, brand_id, model_id);

  const generatedSlug = slug && slug.trim() !== "" ? slugify(slug) : slugify(title);

  const { error: updateError } = await supabase
    .from("cars")
    .update({
      title,
      slug: generatedSlug,
      brand_id: resolved.brand_id,
      model_id: resolved.model_id,
      year,
      price,
      condition,
      transmission,
      fuel_type,
      drive_type,
      body_type,
      mileage,
      engine_capacity: engine_capacity || null,
      color: color || null,
      status,
      featured,
      description: description || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    console.error(`Error updating car ${id}:`, updateError);
    return { success: false, error: updateError.message };
  }

  if (images) {
    await supabase.from("car_images").delete().eq("car_id", id);
    if (images.length > 0) {
      const imageInserts = images.map((img, idx) => ({
        car_id: id,
        image_url: img.image_url,
        display_order: img.display_order ?? idx,
        is_primary: img.is_primary ?? idx === 0,
      }));
      await supabase.from("car_images").insert(imageInserts);
    }
  }

  if (features) {
    await supabase.from("car_features").delete().eq("car_id", id);
    if (features.length > 0) {
      const featureInserts = features.map((feature_id) => ({
        car_id: id,
        feature_id,
      }));
      await supabase.from("car_features").insert(featureInserts);
    }
  }

  revalidatePath("/admin/cars");
  revalidatePath(`/admin/cars/${id}/edit`);
  revalidatePath("/cars");
  revalidatePath(`/cars/${generatedSlug}`);

  return { success: true };
}

/**
 * Soft delete a car
 */
export async function softDeleteCar(id: string) {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from("cars")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error(`Error deleting car ${id}:`, error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/cars");
  revalidatePath("/cars");

  return { success: true };
}

/**
 * Toggle featured flag for a car
 */
export async function toggleFeatured(id: string, currentFeatured: boolean) {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from("cars")
    .update({ featured: !currentFeatured })
    .eq("id", id);

  if (error) {
    console.error(`Error toggling featured for car ${id}:`, error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/cars");
  revalidatePath("/cars");

  return { success: true, featured: !currentFeatured };
}

/**
 * Quick create brand & model on the fly
 */
export async function createQuickBrandAndModel(brandName: string, modelName: string) {
  try {
    const supabase = await createServerClient();

    const cleanBrandName = brandName.trim();
    const cleanModelName = modelName.trim();

    if (!cleanBrandName || !cleanModelName) {
      return { success: false, error: "اسم الماركة والموديل مطلوبان" };
    }

    // 1. Get or create brand
    let { data: brand } = await supabase
      .from("brands")
      .select("*")
      .eq("name", cleanBrandName)
      .maybeSingle();

    if (!brand) {
      const { data: newBrand, error: bErr } = await supabase
        .from("brands")
        .insert({ name: cleanBrandName, vehicle_type: "car" })
        .select()
        .single();
      if (bErr || !newBrand) return { success: false, error: bErr?.message || "فشل إنشاء الماركة" };
      brand = newBrand;
    }

    // 2. Get or create model
    let { data: model } = await supabase
      .from("car_models")
      .select("*")
      .eq("brand_id", brand.id)
      .eq("name", cleanModelName)
      .maybeSingle();

    if (!model) {
      const { data: newModel, error: mErr } = await supabase
        .from("car_models")
        .insert({ brand_id: brand.id, name: cleanModelName })
        .select()
        .single();
      if (mErr || !newModel) return { success: false, error: mErr?.message || "فشل إنشاء الموديل" };
      model = newModel;
    }

    return { success: true, brand_id: brand.id, model_id: model.id };
  } catch (err: any) {
    return { success: false, error: err?.message || "فشل في حفظ الماركة والموديل" };
  }
}

/**
 * Fetch brands and car models
 */
export async function getBrandsAndModels() {
  try {
    const supabase = await createServerClient();

    let { data: brands, error: brandsError } = await supabase
      .from("brands")
      .select("*, car_models(*)")
      .order("name", { ascending: true });

    if (brandsError || !brands || brands.length === 0) {
      console.log("No brands found in database. Auto seeding default brands...");
      await seedCarsData(false); // pass false so revalidatePath is NOT run during render
      const { data: reFetched } = await supabase
        .from("brands")
        .select("*, car_models(*)")
        .order("name", { ascending: true });
      brands = reFetched || [];
    }

    return { brands: brands || [], error: null };
  } catch (err) {
    return { brands: [], error: null };
  }
}

/**
 * Fetch master features list
 */
export async function getFeatures() {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("features")
      .select("*")
      .order("category", { ascending: true });

    if (error) {
      return { features: [], error: null };
    }

    return { features: data || [], error: null };
  } catch (err) {
    return { features: [], error: null };
  }
}

/**
 * Submit inquiry lead
 */
export async function submitCarInquiry(payload: {
  name: string;
  phone: string;
  email?: string;
  car_id: string;
  notes?: string;
}) {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase.rpc("submit_lead", {
      p_customer_name: payload.name,
      p_customer_phone: payload.phone,
      p_customer_email: payload.email || null,
      p_lead_type: "car_inquiry",
      p_source: "website",
      p_preferred_contact_method: "whatsapp",
      p_car_id: payload.car_id,
      p_notes: payload.notes || "استفسار عن سيارة من الصفحة العامة",
    });

    if (error) {
      console.error("Error submitting car inquiry lead:", error);
      return { success: false, error: error.message };
    }

    return { success: true, leadId: data };
  } catch (err: any) {
    return { success: false, error: err?.message || "فشل إرسال الطلب" };
  }
}

/**
 * Seed Cars Sample Data Action
 */
export async function seedCarsData(shouldRevalidate: boolean = true) {
  try {
    const supabase = await createServerClient();

    // 1. Seed Brands
    const brandData = [
      { name: "مرسيدس-بنز (Mercedes-Benz)", vehicle_type: "car" },
      { name: "بي إم دبليو (BMW)", vehicle_type: "car" },
      { name: "بورش (Porsche)", vehicle_type: "car" },
      { name: "رينج روفر (Range Rover)", vehicle_type: "car" },
      { name: "أودي (Audi)", vehicle_type: "car" },
      { name: "تويوتا (Toyota)", vehicle_type: "car" },
    ];

    const insertedBrands: Record<string, string> = {};

    for (const b of brandData) {
      const { data } = await supabase
        .from("brands")
        .upsert(b, { onConflict: "name" })
        .select()
        .single();
      if (data) {
        insertedBrands[b.name] = data.id;
      }
    }

    // 2. Seed Models
    const modelData = [
      { brand_name: "مرسيدس-بنز (Mercedes-Benz)", name: "C200 AMG" },
      { brand_name: "مرسيدس-بنز (Mercedes-Benz)", name: "S500 4MATIC" },
      { brand_name: "بي إم دبليو (BMW)", name: "X5 xDrive40i" },
      { brand_name: "بي إم دبليو (BMW)", name: "M4 Competition" },
      { brand_name: "بورش (Porsche)", name: "911 Carrera S" },
      { brand_name: "بورش (Porsche)", name: "Panamera GTS" },
      { brand_name: "أودي (Audi)", name: "RS6 Avant" },
      { brand_name: "تويوتا (Toyota)", name: "Land Cruiser VXR" },
    ];

    const insertedModels: Record<string, string> = {};

    for (const m of modelData) {
      const brandId = insertedBrands[m.brand_name];
      if (brandId) {
        const { data } = await supabase
          .from("car_models")
          .upsert({ brand_id: brandId, name: m.name }, { onConflict: "brand_id,name" })
          .select()
          .single();
        if (data) {
          insertedModels[`${m.brand_name}-${m.name}`] = data.id;
        }
      }
    }

    // 3. Seed Features
    const sampleFeatures = [
      { name: "نظام فرامل ABS المانع للانغلاق", category: "الأمان" },
      { name: "فتحة سقف بانوراما برؤية كاملة", category: "الرفاهية" },
      { name: "نظام ملاحة وتحديد مواقع شاشة GPS", category: "التكنولوجيا" },
      { name: "نظام صوتي محيطي فاخر Burmester", category: "التكنولوجيا" },
      { name: "مقاعد جلد طبيعي مع خاصية المساج والتدفئة", category: "الراحة" },
      { name: "كاميرات رؤية محيطية 360 درجة", category: "الأمان" },
      { name: "إضاءة داخلية خافته Ambient Light", category: "الرفاهية" },
      { name: "حساسات ركن أمامية وخلفية الذكية", category: "الأمان" },
    ];

    for (const f of sampleFeatures) {
      await supabase.from("features").upsert(f, { onConflict: "name" });
    }

    // 4. Sample Cars
    const carsList = [
      {
        title: "مرسيدس C200 AMG موديل 2024 زيرو",
        slug: "mercedes-c200-amg-2024",
        brand_name: "مرسيدس-بنز (Mercedes-Benz)",
        model_name: "C200 AMG",
        year: 2024,
        price: 3850000,
        condition: "new",
        transmission: "automatic",
        fuel_type: "petrol",
        drive_type: "rwd",
        body_type: "sedan",
        mileage: 0,
        engine_capacity: 2000,
        color: "أسود ميتاليك",
        status: "available",
        featured: true,
        description: "سيارة مرسيدس C200 الفئة الأولى AMG بتجهيزات كاملة زيرو بدون استخدام مع ضمان الوكيل الفئة الفاخرة.",
        images: [
          "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=1200&auto=format&fit=crop",
        ],
      },
      {
        title: "بي إم دبليو X5 xDrive40i موديل 2023",
        slug: "bmw-x5-xdrive40i-2023",
        brand_name: "بي إم دبليو (BMW)",
        model_name: "X5 xDrive40i",
        year: 2023,
        price: 5400000,
        condition: "used",
        transmission: "automatic",
        fuel_type: "petrol",
        drive_type: "awd",
        body_type: "suv",
        mileage: 18000,
        engine_capacity: 3000,
        color: "أبيض لؤلؤي",
        status: "available",
        featured: true,
        description: "بي إم دبليو X5 بحالة الفابريكا بالكامل صيانات التوكيل بانتظام، فرش جلد جملي أنيق وحزمة M Sport.",
        images: [
          "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1556189250-72ba954cfc2b?q=80&w=1200&auto=format&fit=crop",
        ],
      },
      {
        title: "بورش 911 Carrera S موديل 2024",
        slug: "porsche-911-carrera-s-2024",
        brand_name: "بورش (Porsche)",
        model_name: "911 Carrera S",
        year: 2024,
        price: 9800000,
        condition: "new",
        transmission: "dual_clutch",
        fuel_type: "petrol",
        drive_type: "rwd",
        body_type: "coupe",
        mileage: 500,
        engine_capacity: 3000,
        color: "أحمر بورش ريسنج",
        status: "available",
        featured: true,
        description: "الأيقونة الألماني بورش 911 كاريرا S بتسارع استثنائي وباقة سبورت كرونو وشاسيه هيدروليكي رياضي.",
        images: [
          "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop",
        ],
      },
      {
        title: "تويوتا لاندكروزر VXR موديل 2024",
        slug: "toyota-land-cruiser-vxr-2024",
        brand_name: "تويوتا (Toyota)",
        model_name: "Land Cruiser VXR",
        year: 2024,
        price: 6200000,
        condition: "new",
        transmission: "automatic",
        fuel_type: "petrol",
        drive_type: "4wd",
        body_type: "suv",
        mileage: 0,
        engine_capacity: 3500,
        color: "فضي ميتاليك",
        status: "available",
        featured: false,
        description: "وحش الطرق الوعرة تويوتا لاندكروزر VXR المحرك المزدوج تيربو مع كامل التجهيزات الخليجية ومقاعد شاشات خلفية.",
        images: [
          "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1200&auto=format&fit=crop",
        ],
      },
    ];

    for (const c of carsList) {
      const brandId = insertedBrands[c.brand_name];
      const modelId = insertedModels[`${c.brand_name}-${c.model_name}`];

      if (brandId && modelId) {
        const { data: newCar } = await supabase
          .from("cars")
          .upsert(
            {
              title: c.title,
              slug: c.slug,
              brand_id: brandId,
              model_id: modelId,
              year: c.year,
              price: c.price,
              condition: c.condition as any,
              transmission: c.transmission as any,
              fuel_type: c.fuel_type as any,
              drive_type: c.drive_type as any,
              body_type: c.body_type as any,
              mileage: c.mileage,
              engine_capacity: c.engine_capacity,
              color: c.color,
              status: c.status as any,
              featured: c.featured,
              description: c.description,
            },
            { onConflict: "slug" }
          )
          .select()
          .single();

        if (newCar && c.images) {
          await supabase.from("car_images").delete().eq("car_id", newCar.id);
          const imgInserts = c.images.map((url, i) => ({
            car_id: newCar.id,
            image_url: url,
            display_order: i,
            is_primary: i === 0,
          }));
          await supabase.from("car_images").insert(imgInserts);
        }
      }
    }

    if (shouldRevalidate) {
      try {
        revalidatePath("/admin/cars");
        revalidatePath("/cars");
      } catch (err) {
        // Silently skip if revalidatePath is called during render
      }
    }

    return { success: true, message: "تم توليد البيانات التجريبية للسيارات بنجاح!" };
  } catch (err: any) {
    console.error("Seed Cars error:", err);
    return { success: false, error: err?.message || "فشل توليد البيانات التجريبية" };
  }
}

