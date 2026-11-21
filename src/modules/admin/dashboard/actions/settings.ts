"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/modules/shared/lib/supabase/server";
import {
  ShowroomInfo,
  ContactNumbersSettings,
  HeroSettings,
  DEFAULT_SHOWROOM_INFO,
  DEFAULT_CONTACT_NUMBERS,
  DEFAULT_HERO_SETTINGS,
} from "@/modules/shared/lib/settings";

export async function getAdminSettingsData() {
  try {
    const supabase = await createServerClient();

    // 1. Get current logged-in user & profile
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let profileData = {
      id: user?.id || "",
      email: user?.email || "",
      full_name: "المدير العام",
      phone: "01007946824",
      avatar_url: "",
    };

    if (user?.id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, phone, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        profileData = {
          id: profile.id,
          email: user.email || "",
          full_name: profile.full_name || "المدير العام",
          phone: profile.phone || "01007946824",
          avatar_url: profile.avatar_url || "",
        };
      }
    }

    // 2. Fetch company_settings
    const { data: settingsRows } = await supabase
      .from("company_settings")
      .select("key, value")
      .in("key", ["showroom_info", "contact_numbers", "hero_settings"]);

    const map = new Map<string, any>();
    if (settingsRows) {
      for (const row of settingsRows) {
        map.set(row.key, row.value);
      }
    }

    const showroom: ShowroomInfo = {
      ...DEFAULT_SHOWROOM_INFO,
      ...(map.get("showroom_info") || {}),
    };

    const contacts: ContactNumbersSettings = {
      ...DEFAULT_CONTACT_NUMBERS,
      ...(map.get("contact_numbers") || {}),
    };

    const hero: HeroSettings = {
      ...DEFAULT_HERO_SETTINGS,
      ...(map.get("hero_settings") || {}),
    };

    return {
      success: true,
      user,
      profile: profileData,
      showroom,
      contacts,
      hero,
    };
  } catch (error: any) {
    console.error("Error in getAdminSettingsData:", error);
    return {
      success: false,
      error: error?.message || "حدث خطأ أثناء تحميل الإعدادات",
      user: null,
      profile: {
        id: "",
        email: "",
        full_name: "المدير العام",
        phone: "01007946824",
        avatar_url: "",
      },
      showroom: DEFAULT_SHOWROOM_INFO,
      contacts: DEFAULT_CONTACT_NUMBERS,
      hero: DEFAULT_HERO_SETTINGS,
    };
  }
}

export async function updateAdminProfile(data: {
  full_name: string;
  phone?: string;
  avatar_url?: string;
}) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      return { success: false, error: "يجب تسجيل الدخول أولاً" };
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: data.full_name.trim(),
        phone: data.phone?.trim() || null,
        avatar_url: data.avatar_url?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      throw error;
    }

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (err: any) {
    console.error("Error updating profile:", err);
    return { success: false, error: err?.message || "فشل تحديث الملف الشخصي" };
  }
}

export async function saveCompanySetting(
  key: "showroom_info" | "contact_numbers" | "hero_settings",
  value: any,
  description?: string
) {
  try {
    const supabase = await createServerClient();

    const { error } = await supabase.from("company_settings").upsert(
      {
        key,
        value,
        description: description || `Configuration for ${key}`,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );

    if (error) {
      throw error;
    }

    // Live revalidation of storefront & settings
    revalidatePath("/");
    revalidatePath("/admin/settings");
    revalidatePath("/cars");
    revalidatePath("/protection-films");
    revalidatePath("/contact");
    revalidatePath("/about");

    return { success: true };
  } catch (err: any) {
    console.error(`Error saving company setting ${key}:`, err);
    return { success: false, error: err?.message || `فشل حفظ إعدادات ${key}` };
  }
}
