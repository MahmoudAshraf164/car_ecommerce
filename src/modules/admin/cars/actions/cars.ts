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
    const model_id = formData.model_id || formData.get?.("model_id") || null;
    const origin = formData.origin || formData.get?.("origin") || null;
    const trim_level = formData.trim_level || formData.get?.("trim_level") || null;
    const year = Number(formData.year || formData.get?.("year") || 2024);
    const price = Number(formData.price || formData.get?.("price") || 0);
    const description = formData.description || formData.get?.("description") || null;
    const status = formData.status || formData.get?.("status") || "available";
    const images = formData.images || [];

    if (!title || !brand_id) {
      return { success: false, error: "يرجى اختيار الماركة وإدخال اسم السيارة" };
    }

    const generatedSlug = `${slugify(title)}-${year}-${Date.now().toString().slice(-4)}`;

    const { data: newCar, error } = await supabase
      .from("cars")
      .insert({
        title,
        slug: generatedSlug,
        brand_id,
        model_id,
        origin,
        trim_level,
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

async function resolveBrandAndModel(supabase: any, brandInput: string, modelInput?: string) {
  let finalBrandId = brandInput;
  let finalModelId = modelInput || null;

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
    origin,
    trim_level,
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
  const resolved = await resolveBrandAndModel(supabase, brand_id, model_id || undefined);

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
      model_id: resolved.model_id || null,
      origin: origin || null,
      trim_level: trim_level || null,
      year,
      price,
      condition,
      transmission,
      fuel_type,
      drive_type: drive_type || null,
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
    origin,
    trim_level,
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
  const resolved = await resolveBrandAndModel(supabase, brand_id, model_id || undefined);

  const generatedSlug = slug && slug.trim() !== "" ? slugify(slug) : slugify(title);

  const { error: updateError } = await supabase
    .from("cars")
    .update({
      title,
      slug: generatedSlug,
      brand_id: resolved.brand_id,
      model_id: resolved.model_id || null,
      origin: origin || null,
      trim_level: trim_level || null,
      year,
      price,
      condition,
      transmission,
      fuel_type,
      drive_type: drive_type || null,
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

    const { data: brands } = await supabase
      .from("brands")
      .select("*, car_models(*)")
      .order("name", { ascending: true });

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

