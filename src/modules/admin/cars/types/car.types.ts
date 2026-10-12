import { Tables, Enums } from "@/modules/shared/types/database.types";
import { CarFormValues } from "../validations/car.schema";

export type CarRow = Tables<"cars">;
export type BrandRow = Tables<"brands">;
export type CarModelRow = Tables<"car_models">;
export type FeatureRow = Tables<"features">;
export type CarImageRow = Tables<"car_images">;

export interface CarWithRelations extends CarRow {
  brand?: BrandRow | null;
  car_models?: CarModelRow | null;
  car_images?: CarImageRow[];
  features?: FeatureRow[];
}

export interface CarFilterParams {
  search?: string;
  brand_id?: string;
  model_id?: string;
  condition?: Enums<"car_condition">;
  transmission?: Enums<"transmission_type">;
  fuel_type?: Enums<"fuel_type">;
  body_type?: Enums<"body_type">;
  min_price?: number;
  max_price?: number;
  min_year?: number;
  max_year?: number;
  status?: Enums<"listing_status">;
  featured?: boolean;
  page?: number;
  limit?: number;
  sort_by?: "created_at" | "price" | "year";
  sort_order?: "asc" | "desc";
}

export type { CarFormValues };
