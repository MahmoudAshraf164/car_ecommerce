"use server";

import { createServerClient } from "@/modules/shared/lib/supabase/server";
import { CarWithRelations } from "@/modules/admin/cars/types/car.types";

export async function getCarByIdOrSlug(identifier: string): Promise<{
  data: CarWithRelations | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    let decodedId = identifier;
    try { decodedId = decodeURIComponent(identifier); } catch {}

    const selectQuery = `
      *,
      brand:brands(*),
      car_models(*),
      car_images(*),
      car_features(feature_id, features(*))
    `;

    const { data, error } = await supabase
      .from("cars")
      .select(selectQuery)
      .is("deleted_at", null)
      .or(`id.eq.${decodedId},slug.eq.${decodedId}`)
      .single();

    if (error) {
      console.warn(`Notice fetching car ${identifier}:`, error.message);
      return { data: null, error: error.message };
    }

    const formattedFeatures = (data.car_features || [])
      .map((cf: any) => cf.features)
      .filter(Boolean);

    return { data: { ...data, features: formattedFeatures } as CarWithRelations, error: null };
  } catch (err: any) {
    return { data: null, error: err?.message || "Failed to fetch car" };
  }
}

export async function getPublicCars(filters: {
  search?: string;
  brand_id?: string;
  model_id?: string;
  condition?: string;
  transmission?: string;
  fuel_type?: string;
  drive_type?: string;
  body_type?: string;
  min_year?: number;
  max_year?: number;
  page?: number;
  limit?: number;
} = {}) {
  try {
    const supabase = await createServerClient();
    const {
      search, brand_id, model_id, condition, transmission,
      fuel_type, drive_type, body_type, min_year, max_year,
      page = 1, limit = 24,
    } = filters;

    let query = supabase
      .from("cars")
      .select(`*, brand:brands(*), car_models(*), car_images(*)`, { count: "exact" })
      .is("deleted_at", null)
      .eq("status", "available");

    if (search?.trim()) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (brand_id) query = query.eq("brand_id", brand_id);
    if (model_id) query = query.eq("model_id", model_id);
    if (condition) query = query.eq("condition", condition);
    if (transmission) query = query.eq("transmission", transmission);
    if (fuel_type) query = query.eq("fuel_type", fuel_type);
    if (drive_type) query = query.eq("drive_type", drive_type);
    if (body_type) query = query.eq("body_type", body_type);
    if (min_year) query = query.gte("year", min_year);
    if (max_year) query = query.lte("year", max_year);

    const from = (page - 1) * limit;
    query = query
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .range(from, from + limit - 1);

    const { data, error, count } = await query;
    if (error) {
      console.warn("Notice fetching public cars:", error.message);
      return { data: [], total: 0, error: null };
    }
    return { data: (data || []) as CarWithRelations[], total: count || 0, error: null };
  } catch (err: any) {
    console.warn("Handled exception in getPublicCars:", err?.message || err);
    return { data: [], total: 0, error: null };
  }
}

export async function getBrandsWithModels(): Promise<{
  id: string; name: string; logo_url: string | null;
  car_models: { id: string; name: string }[];
}[]> {
  try {
    const supabase = await createServerClient();
    const { data } = await supabase
      .from("brands")
      .select("id, name, logo_url, car_models(id, name)")
      .order("name");
    return (data as any) || [];
  } catch {
    return [];
  }
}
