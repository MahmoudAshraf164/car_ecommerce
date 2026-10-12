"use server";

import { createServerClient } from "@/modules/shared/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteProtectionFilm(id: string) {
  try {
    const supabase = await createServerClient();
    // Hard delete since there is no deleted_at column
    const { error } = await supabase
      .from("protection_films")
      .delete()
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/protection-films");
    revalidatePath("/protection-films");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to delete" };
  }
}

export async function createProtectionFilm(payload: any, imageUrl: string) {
  try {
    const supabase = await createServerClient();

    const { data: film, error } = await supabase
      .from("protection_films")
      .insert({
        title: payload.title,
        slug: payload.slug || null,
        brand: payload.brand || "العامة",
        film_type: payload.film_type || "PPF",
        warranty_years: Number(payload.warranty_years) || 0,
        price: Number(payload.price_starting_from || payload.price) || 0,
        price_starting_from: Number(payload.price_starting_from || payload.price) || 0,
        description: payload.description || "",
        features: [],
        status: "available",
      })
      .select("id")
      .single();

    if (error || !film) return { success: false, error: error?.message || "Insert failed" };

    if (imageUrl) {
      const { error: imgError } = await supabase
        .from("protection_film_images")
        .insert({
          film_id: film.id,       // ← correct column name
          image_url: imageUrl,
          is_primary: true,
          display_order: 1,
        });
      if (imgError) console.error("Error inserting protection_film_image:", imgError.message);
    }

    revalidatePath("/admin/protection-films");
    revalidatePath("/protection-films");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function updateProtectionFilm(id: string, payload: any, imageUrl: string) {
  try {
    const supabase = await createServerClient();

    const { error } = await supabase
      .from("protection_films")
      .update({
        title: payload.title,
        slug: payload.slug || null,
        brand: payload.brand || "العامة",
        film_type: payload.film_type || "PPF",
        warranty_years: Number(payload.warranty_years) || 0,
        price: Number(payload.price_starting_from || payload.price) || 0,
        price_starting_from: Number(payload.price_starting_from || payload.price) || 0,
        description: payload.description || "",
        features: [],
        status: "available",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    if (imageUrl) {
      // Check by correct FK column: film_id
      const { data: existing } = await supabase
        .from("protection_film_images")
        .select("id")
        .eq("film_id", id);

      if (existing && existing.length > 0) {
        const { error: imgError } = await supabase
          .from("protection_film_images")
          .update({ image_url: imageUrl })
          .eq("film_id", id);
        if (imgError) console.error("Error updating protection_film_image:", imgError.message);
      } else {
        const { error: imgError } = await supabase
          .from("protection_film_images")
          .insert({
            film_id: id,          // ← correct column name
            image_url: imageUrl,
            is_primary: true,
            display_order: 1,
          });
        if (imgError) console.error("Error inserting protection_film_image:", imgError.message);
      }
    }

    revalidatePath("/admin/protection-films");
    revalidatePath("/protection-films");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}
