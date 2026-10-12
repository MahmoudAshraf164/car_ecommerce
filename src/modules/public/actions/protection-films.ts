"use server";

import { createServerClient } from "@/modules/shared/lib/supabase/server";

export interface ProtectionFilmRow {
  id: string;
  title: string;
  slug?: string | null;
  brand?: any;
  badge?: string;
  warranty_years?: number;
  coverage?: string;
  price?: number;
  price_starting_from?: number;
  description?: string;
  features?: string[];
  film_type?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface ProtectionFilmImageRow {
  id: string;
  film_id: string;             // ← actual DB column
  image_url: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface ProtectionFilmWithImages extends ProtectionFilmRow {
  protection_film_images?: ProtectionFilmImageRow[];
}

/**
 * Fetch all active (status = 'available') protection films with their images.
 */
export async function getProtectionFilms(): Promise<{
  data: ProtectionFilmWithImages[];
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("protection_films")
      .select(`*, protection_film_images(*)`)
      .eq("status", "available")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Notice fetching protection films:", error.message);
      return { data: [], error: null };
    }

    return { data: (data as ProtectionFilmWithImages[]) || [], error: null };
  } catch (err: any) {
    console.warn("Exception in getProtectionFilms:", err?.message || err);
    return { data: [], error: null };
  }
}

/**
 * Fetch a single protection film by UUID or slug with all images.
 */
export async function getProtectionFilmByIdOrSlug(identifier: string): Promise<{
  data: ProtectionFilmWithImages | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();

    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

    let query = supabase
      .from("protection_films")
      .select(`*, protection_film_images(*)`);

    if (isUuid) {
      query = query.eq("id", identifier);
    } else {
      query = query.eq("slug", identifier);
    }

    const { data, error } = await query.single();

    if (error) {
      console.warn(
        `Notice fetching protection film by ${isUuid ? "ID" : "slug"} "${identifier}":`,
        error.message
      );
      return { data: null, error: error.message };
    }

    return { data: data as ProtectionFilmWithImages, error: null };
  } catch (err: any) {
    console.warn("Exception in getProtectionFilmByIdOrSlug:", err?.message || err);
    return { data: null, error: err?.message || "Failed to fetch protection film" };
  }
}
