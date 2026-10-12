"use server";

import { createServerClient } from "@/modules/shared/lib/supabase/server";

// ────── Types ──────

export interface ScooterImageRow {
  id: string;
  scooter_id: string;
  image_url: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface ScooterFeatureRow {
  id: string;
  name: string;
  category: string;
}

export interface ScooterBrandRow {
  id: string;
  name: string;
  logo_url: string | null;
}

export interface ScooterModelRow {
  id: string;
  brand_id: string;
  name: string;
}

export interface ScooterWithRelations {
  id: string;
  title: string;
  slug: string;
  brand_id: string;
  model_id: string | null;
  year: number;
  price: number;
  condition: "new" | "used";
  engine_capacity: number | null;
  color: string | null;
  status: string;
  featured: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  brand?: ScooterBrandRow | null;
  car_models?: ScooterModelRow | null;
  scooter_images?: ScooterImageRow[];
  features?: ScooterFeatureRow[];
}

// ────── Fetch scooter by ID or slug ──────

export async function getScooterByIdOrSlug(identifier: string): Promise<{
  data: ScooterWithRelations | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();

    // Check if identifier is a UUID
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        identifier
      );

    const selectQuery = `
      *,
      brand:brands(*),
      car_models:car_models(*),
      scooter_images(*),
      scooter_features(
        feature_id,
        features(*)
      )
    `;

    let query = supabase
      .from("scooters")
      .select(selectQuery)
      .is("deleted_at", null);

    if (isUuid) {
      query = query.eq("id", identifier);
    } else {
      query = query.eq("slug", identifier);
    }

    const { data, error } = await query.single();

    if (error) {
      console.warn(
        `Notice fetching scooter by ${isUuid ? "ID" : "slug"} ${identifier}:`,
        error.message
      );
      return { data: null, error: error.message };
    }

    const formattedFeatures = (data.scooter_features || [])
      .map((sf: any) => sf.features)
      .filter(Boolean);

    const scooter: ScooterWithRelations = {
      ...data,
      features: formattedFeatures,
    };

    return { data: scooter, error: null };
  } catch (err: any) {
    return { data: null, error: err?.message || "Failed to fetch scooter" };
  }
}

// ────── Fetch all scooters for public listing ──────

export interface ScooterFilterParams {
  search?: string;
  brand_id?: string;
  condition?: string;
  min_price?: number;
  max_price?: number;
  page?: number;
  limit?: number;
  sort_by?: "created_at" | "price" | "year";
  sort_order?: "asc" | "desc";
}

export async function getPublicScooters(filters: ScooterFilterParams = {}) {
  try {
    const supabase = await createServerClient();

    const {
      search,
      brand_id,
      condition,
      min_price,
      max_price,
      page = 1,
      limit = 12,
      sort_by = "created_at",
      sort_order = "desc",
    } = filters;

    let query = supabase
      .from("scooters")
      .select(
        `
        *,
        brand:brands(*),
        car_models:car_models(*),
        scooter_images(*)
      `,
        { count: "exact" }
      )
      .is("deleted_at", null)
      .eq("status", "available");

    if (search && search.trim() !== "") {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%`
      );
    }
    if (brand_id) query = query.eq("brand_id", brand_id);
    if (condition) query = query.eq("condition", condition);
    if (min_price !== undefined && min_price > 0)
      query = query.gte("price", min_price);
    if (max_price !== undefined && max_price > 0)
      query = query.lte("price", max_price);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query
      .order(sort_by, { ascending: sort_order === "asc" })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.warn("Notice when fetching scooters:", error.message);
      return { data: [], total: 0, page, totalPages: 0, error: null };
    }

    const total = count || 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      data: (data || []) as ScooterWithRelations[],
      total,
      page,
      totalPages,
      error: null,
    };
  } catch (err: any) {
    console.warn("Handled exception in getPublicScooters:", err?.message || err);
    return { data: [], total: 0, page: 1, totalPages: 0, error: null };
  }
}
