"use server";

import { createServerClient } from "@/modules/shared/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addBrand(name: string, logoUrl?: string) {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("brands")
      .insert({ name, logo_url: logoUrl || null, vehicle_type: "car" })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    
    revalidatePath("/admin/brands");
    revalidatePath("/admin/cars");
    return { success: true, brand: data };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to add brand" };
  }
}

export async function deleteBrand(id: string) {
  try {
    const supabase = await createServerClient();
    const { error } = await supabase.from("brands").delete().eq("id", id);
    
    if (error) return { success: false, error: error.message };
    
    revalidatePath("/admin/brands");
    revalidatePath("/admin/cars");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to delete brand" };
  }
}

export async function addModel(brandId: string, name: string) {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("car_models")
      .insert({ brand_id: brandId, name })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    
    revalidatePath("/admin/brands");
    revalidatePath("/admin/cars");
    return { success: true, model: data };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to add model" };
  }
}

export async function deleteModel(id: string) {
  try {
    const supabase = await createServerClient();
    const { error } = await supabase.from("car_models").delete().eq("id", id);
    
    if (error) return { success: false, error: error.message };
    
    revalidatePath("/admin/brands");
    revalidatePath("/admin/cars");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to delete model" };
  }
}
