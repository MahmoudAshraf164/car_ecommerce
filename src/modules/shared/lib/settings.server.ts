import { createServerClient } from "@/modules/shared/lib/supabase/server";
import {
  ShowroomInfo,
  ContactNumbersSettings,
  HeroSettings,
  PublicCompanySettings,
  DEFAULT_SHOWROOM_INFO,
  DEFAULT_CONTACT_NUMBERS,
  DEFAULT_HERO_SETTINGS,
} from "./settings.types";

export * from "./settings.types";

/**
 * Server-only fetch of company settings from Supabase.
 * MUST ONLY be imported in Server Components, Server Actions, or Route Handlers.
 */
export async function getCompanySettings(): Promise<PublicCompanySettings> {
  try {
    const supabase = await createServerClient();
    const { data } = await supabase
      .from("company_settings")
      .select("key, value")
      .in("key", ["showroom_info", "contact_numbers", "hero_settings"]);

    const map = new Map<string, any>();
    if (data) {
      for (const row of data) {
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

    if (!hero.bannerUrl || hero.bannerUrl.trim() === "") {
      hero.bannerUrl = DEFAULT_HERO_SETTINGS.bannerUrl;
    }

    return { showroom, contacts, hero };
  } catch (error) {
    console.warn("Notice in getCompanySettings, falling back to defaults:", error);
    return {
      showroom: DEFAULT_SHOWROOM_INFO,
      contacts: DEFAULT_CONTACT_NUMBERS,
      hero: DEFAULT_HERO_SETTINGS,
    };
  }
}
