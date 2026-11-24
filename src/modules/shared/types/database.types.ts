export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';
export type CarCondition = 'new' | 'used';
export type ListingStatus = 'draft' | 'available' | 'reserved' | 'sold' | 'archived';
export type TransmissionType = 'manual' | 'automatic' | 'cvt' | 'dual_clutch';
export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'plugin_hybrid' | 'gas';
export type DriveType = 'fwd' | 'rwd' | 'awd' | '4wd';
export type BodyType = 'sedan' | 'suv' | 'hatchback' | 'coupe' | 'convertible' | 'van' | 'truck' | 'crossover' | 'other';
export type VehicleType = 'car' | 'scooter';

export type ProjectStatus = 'under_construction' | 'completed' | 'planned';
export type PropertyType = 'apartment' | 'villa' | 'duplex' | 'penthouse' | 'chalet' | 'studio' | 'commercial' | 'administrative' | 'land' | 'building' | 'other';
export type PropertyStatus = 'available' | 'reserved' | 'sold' | 'off_market';
export type FinishingType = 'without_finishing' | 'semi_finished' | 'finished' | 'super_lux' | 'ultra_lux';

export type LeadType = 'car_inquiry' | 'scooter_inquiry' | 'real_estate_inquiry' | 'general';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'following_up' | 'negotiating' | 'won' | 'lost' | 'cancelled';
export type LeadSource = 'website' | 'facebook' | 'instagram' | 'whatsapp' | 'phone_call' | 'referral' | 'walk_in' | 'other';
export type ContactMethod = 'phone' | 'whatsapp' | 'email' | 'in_person';
export type NotificationType = 'lead_assigned' | 'lead_status_changed' | 'system_alert' | 'reminder';
export type PermissionModule = 'cars' | 'scooters' | 'real_estate' | 'leads' | 'customers' | 'users' | 'roles' | 'reports' | 'settings' | 'audit_logs';
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage' | 'export';

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: {
          id: string
          name: string
          display_name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          display_name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      role_permissions: {
        Row: {
          id: string
          role_id: string
          module: PermissionModule
          action: PermissionAction
          created_at: string
        }
        Insert: {
          id?: string
          role_id: string
          module: PermissionModule
          action: PermissionAction
          created_at?: string
        }
        Update: {
          id?: string
          role_id?: string
          module?: PermissionModule
          action?: PermissionAction
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string
          phone: string | null
          role_id: string | null
          status: UserStatus
          avatar_url: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id: string
          full_name: string
          phone?: string | null
          role_id?: string | null
          status?: UserStatus
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string | null
          role_id?: string | null
          status?: UserStatus
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      brands: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          vehicle_type: VehicleType | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          vehicle_type?: VehicleType | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          vehicle_type?: VehicleType | null
          created_at?: string
          updated_at?: string
        }
      }
      car_models: {
        Row: {
          id: string
          brand_id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      features: {
        Row: {
          id: string
          name: string
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          created_at?: string
        }
      }
      facilities: {
        Row: {
          id: string
          name: string
          icon: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          icon?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          icon?: string | null
          created_at?: string
        }
      }
      cars: {
        Row: {
          id: string
          title: string
          slug: string
          brand_id: string
          model_id: string | null
          origin?: string | null
          trim_level?: string | null
          year: number
          price: number
          condition: CarCondition
          transmission: TransmissionType
          fuel_type: FuelType
          drive_type: DriveType | null
          body_type: BodyType
          mileage: number
          engine_capacity: number | null
          color: string | null
          status: ListingStatus
          featured: boolean
          description: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          title: string
          slug: string
          brand_id: string
          model_id?: string | null
          origin?: string | null
          trim_level?: string | null
          year: number
          price: number
          condition?: CarCondition
          transmission?: TransmissionType
          fuel_type?: FuelType
          drive_type?: DriveType | null
          body_type?: BodyType
          mileage?: number
          engine_capacity?: number | null
          color?: string | null
          status?: ListingStatus
          featured?: boolean
          description?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          brand_id?: string
          model_id?: string | null
          origin?: string | null
          trim_level?: string | null
          year?: number
          price?: number
          condition?: CarCondition
          transmission?: TransmissionType
          fuel_type?: FuelType
          drive_type?: DriveType | null
          body_type?: BodyType
          mileage?: number
          engine_capacity?: number | null
          color?: string | null
          status?: ListingStatus
          featured?: boolean
          description?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      car_images: {
        Row: {
          id: string
          car_id: string
          image_url: string
          display_order: number
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          car_id: string
          image_url: string
          display_order?: number
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          car_id?: string
          image_url?: string
          display_order?: number
          is_primary?: boolean
          created_at?: string
        }
      }
      car_features: {
        Row: {
          car_id: string
          feature_id: string
        }
        Insert: {
          car_id: string
          feature_id: string
        }
        Update: {
          car_id?: string
          feature_id?: string
        }
      }
      scooters: {
        Row: {
          id: string
          title: string
          slug: string
          brand_id: string
          model_id: string | null
          year: number
          price: number
          condition: CarCondition
          engine_capacity: number | null
          color: string | null
          status: ListingStatus
          featured: boolean
          description: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          title: string
          slug: string
          brand_id: string
          model_id?: string | null
          year: number
          price: number
          condition?: CarCondition
          engine_capacity?: number | null
          color?: string | null
          status?: ListingStatus
          featured?: boolean
          description?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          brand_id?: string
          model_id?: string | null
          year?: number
          price?: number
          condition?: CarCondition
          engine_capacity?: number | null
          color?: string | null
          status?: ListingStatus
          featured?: boolean
          description?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      scooter_images: {
        Row: {
          id: string
          scooter_id: string
          image_url: string
          display_order: number
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          scooter_id: string
          image_url: string
          display_order?: number
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          scooter_id?: string
          image_url?: string
          display_order?: number
          is_primary?: boolean
          created_at?: string
        }
      }
      scooter_features: {
        Row: {
          scooter_id: string
          feature_id: string
        }
        Insert: {
          scooter_id: string
          feature_id: string
        }
        Update: {
          scooter_id?: string
          feature_id?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          slug: string
          location: string
          city: string | null
          description: string | null
          status: ProjectStatus
          total_units: number
          available_units: number
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          title: string
          slug: string
          location: string
          city?: string | null
          description?: string | null
          status?: ProjectStatus
          total_units?: number
          available_units?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          location?: string
          city?: string | null
          description?: string | null
          status?: ProjectStatus
          total_units?: number
          available_units?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      project_images: {
        Row: {
          id: string
          project_id: string
          image_url: string
          display_order: number
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          image_url: string
          display_order?: number
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          image_url?: string
          display_order?: number
          is_primary?: boolean
          created_at?: string
        }
      }
      project_facilities: {
        Row: {
          project_id: string
          facility_id: string
        }
        Insert: {
          project_id: string
          facility_id: string
        }
        Update: {
          project_id?: string
          facility_id?: string
        }
      }
      towers: {
        Row: {
          id: string
          project_id: string
          name: string
          floors_count: number
          total_units: number
          available_units: number
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          floors_count?: number
          total_units?: number
          available_units?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          floors_count?: number
          total_units?: number
          available_units?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      tower_images: {
        Row: {
          id: string
          tower_id: string
          image_url: string
          display_order: number
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          tower_id: string
          image_url: string
          display_order?: number
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          tower_id?: string
          image_url?: string
          display_order?: number
          is_primary?: boolean
          created_at?: string
        }
      }
      tower_facilities: {
        Row: {
          tower_id: string
          facility_id: string
        }
        Insert: {
          tower_id: string
          facility_id: string
        }
        Update: {
          tower_id?: string
          facility_id?: string
        }
      }
      properties: {
        Row: {
          id: string
          project_id: string | null
          tower_id: string | null
          title: string
          slug: string
          property_type: PropertyType
          property_status: PropertyStatus
          price: number
          area_sqm: number
          bedrooms: number
          bathrooms: number
          floor_number: number
          finishing_type: FinishingType
          description: string | null
          location: string | null
          featured: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          project_id?: string | null
          tower_id?: string | null
          title: string
          slug: string
          property_type?: PropertyType
          property_status?: PropertyStatus
          price: number
          area_sqm: number
          bedrooms?: number
          bathrooms?: number
          floor_number?: number
          finishing_type?: FinishingType
          description?: string | null
          location?: string | null
          featured?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string | null
          tower_id?: string | null
          title?: string
          slug?: string
          property_type?: PropertyType
          property_status?: PropertyStatus
          price?: number
          area_sqm?: number
          bedrooms?: number
          bathrooms?: number
          floor_number?: number
          finishing_type?: FinishingType
          description?: string | null
          location?: string | null
          featured?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      property_images: {
        Row: {
          id: string
          property_id: string
          image_url: string
          display_order: number
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          image_url: string
          display_order?: number
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          image_url?: string
          display_order?: number
          is_primary?: boolean
          created_at?: string
        }
      }
      property_features: {
        Row: {
          property_id: string
          feature_id: string
        }
        Insert: {
          property_id: string
          feature_id: string
        }
        Update: {
          property_id?: string
          feature_id?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          phone: string
          email: string | null
          address: string | null
          notes: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          phone: string
          email?: string | null
          address?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          email?: string | null
          address?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      leads: {
        Row: {
          id: string
          customer_id: string
          assigned_to: string | null
          lead_type: LeadType
          status: LeadStatus
          source: LeadSource
          preferred_contact_method: ContactMethod | null
          car_id: string | null
          scooter_id: string | null
          property_id: string | null
          budget_min: number | null
          budget_max: number | null
          notes: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          customer_id: string
          assigned_to?: string | null
          lead_type?: LeadType
          status?: LeadStatus
          source?: LeadSource
          preferred_contact_method?: ContactMethod | null
          car_id?: string | null
          scooter_id?: string | null
          property_id?: string | null
          budget_min?: number | null
          budget_max?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          customer_id?: string
          assigned_to?: string | null
          lead_type?: LeadType
          status?: LeadStatus
          source?: LeadSource
          preferred_contact_method?: ContactMethod | null
          car_id?: string | null
          scooter_id?: string | null
          property_id?: string | null
          budget_min?: number | null
          budget_max?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      lead_images: {
        Row: {
          id: string
          lead_id: string
          image_url: string
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          image_url: string
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          image_url?: string
          created_at?: string
        }
      }
      lead_notes: {
        Row: {
          id: string
          lead_id: string
          created_by: string | null
          note: string
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          created_by?: string | null
          note: string
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          created_by?: string | null
          note?: string
          created_at?: string
        }
      }
      lead_status_history: {
        Row: {
          id: string
          lead_id: string
          changed_by: string | null
          old_status: LeadStatus | null
          new_status: LeadStatus
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          changed_by?: string | null
          old_status?: LeadStatus | null
          new_status: LeadStatus
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          changed_by?: string | null
          old_status?: LeadStatus | null
          new_status?: LeadStatus
          notes?: string | null
          created_at?: string
        }
      }
      customer_notes: {
        Row: {
          id: string
          customer_id: string
          created_by: string | null
          note: string
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          created_by?: string | null
          note: string
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          created_by?: string | null
          note?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: NotificationType
          title: string
          message: string
          is_read: boolean
          data: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type?: NotificationType
          title: string
          message: string
          is_read?: boolean
          data?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: NotificationType
          title?: string
          message?: string
          is_read?: boolean
          data?: Json
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          title: string
          report_type: string
          parameters: Json
          generated_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          report_type: string
          parameters?: Json
          generated_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          report_type?: string
          parameters?: Json
          generated_by?: string | null
          created_at?: string
        }
      }
      company_settings: {
        Row: {
          key: string
          value: Json
          description: string | null
          updated_at: string
        }
        Insert: {
          key: string
          value: Json
          description?: string | null
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Json
          description?: string | null
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity: string
          entity_id: string | null
          old_data: Json | null
          new_data: Json | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          entity: string
          entity_id?: string | null
          old_data?: Json | null
          new_data?: Json | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          entity?: string
          entity_id?: string | null
          old_data?: Json | null
          new_data?: Json | null
          ip_address?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_permission: {
        Args: {
          p_module: PermissionModule
          p_action: PermissionAction
        }
        Returns: boolean
      }
      submit_lead: {
        Args: {
          p_customer_name: string
          p_customer_phone: string
          p_customer_email?: string
          p_lead_type?: LeadType
          p_source?: LeadSource
          p_preferred_contact_method?: ContactMethod
          p_car_id?: string
          p_scooter_id?: string
          p_property_id?: string
          p_budget_min?: number
          p_budget_max?: number
          p_notes?: string
        }
        Returns: string
      }
    }
    Enums: {
      user_status: UserStatus
      car_condition: CarCondition
      listing_status: ListingStatus
      transmission_type: TransmissionType
      fuel_type: FuelType
      drive_type: DriveType
      body_type: BodyType
      vehicle_type: VehicleType
      project_status: ProjectStatus
      property_type: PropertyType
      property_status: PropertyStatus
      finishing_type: FinishingType
      lead_type: LeadType
      lead_status: LeadStatus
      lead_source: LeadSource
      contact_method: ContactMethod
      notification_type: NotificationType
      permission_module: PermissionModule
      permission_action: PermissionAction
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
