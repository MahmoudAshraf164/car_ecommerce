-- Migration: Initial Schema for El Omda Brothers (أولاد العم)
-- File: supabase/migrations/20260914_initial_schema.sql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. ENUMS
-- ==========================================

CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending');
CREATE TYPE car_condition AS ENUM ('new', 'used');
CREATE TYPE listing_status AS ENUM ('draft', 'available', 'reserved', 'sold', 'archived');
CREATE TYPE transmission_type AS ENUM ('manual', 'automatic', 'cvt', 'dual_clutch');
CREATE TYPE fuel_type AS ENUM ('petrol', 'diesel', 'electric', 'hybrid', 'plugin_hybrid', 'gas');
CREATE TYPE drive_type AS ENUM ('fwd', 'rwd', 'awd', '4wd');
CREATE TYPE body_type AS ENUM ('sedan', 'suv', 'hatchback', 'coupe', 'convertible', 'van', 'truck', 'crossover', 'other');
CREATE TYPE vehicle_type AS ENUM ('car', 'scooter');

CREATE TYPE project_status AS ENUM ('under_construction', 'completed', 'planned');
CREATE TYPE property_type AS ENUM ('apartment', 'villa', 'duplex', 'penthouse', 'chalet', 'studio', 'commercial', 'administrative', 'land', 'building', 'other');
CREATE TYPE property_status AS ENUM ('available', 'reserved', 'sold', 'off_market');
CREATE TYPE finishing_type AS ENUM ('without_finishing', 'semi_finished', 'finished', 'super_lux', 'ultra_lux');

CREATE TYPE lead_type AS ENUM ('car_inquiry', 'scooter_inquiry', 'real_estate_inquiry', 'general');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'following_up', 'negotiating', 'won', 'lost', 'cancelled');
CREATE TYPE lead_source AS ENUM ('website', 'facebook', 'instagram', 'whatsapp', 'phone_call', 'referral', 'walk_in', 'other');
CREATE TYPE contact_method AS ENUM ('phone', 'whatsapp', 'email', 'in_person');
CREATE TYPE notification_type AS ENUM ('lead_assigned', 'lead_status_changed', 'system_alert', 'reminder');
CREATE TYPE permission_module AS ENUM ('cars', 'scooters', 'real_estate', 'leads', 'customers', 'users', 'roles', 'reports', 'settings', 'audit_logs');
CREATE TYPE permission_action AS ENUM ('create', 'read', 'update', 'delete', 'manage', 'export');

-- ==========================================
-- 2. ACCESS CONTROL & PROFILES
-- ==========================================

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    module permission_module NOT NULL,
    action permission_action NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_role_permission UNIQUE (role_id, module, action)
);

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    status user_status NOT NULL DEFAULT 'active',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Seed default admin roles
INSERT INTO roles (id, name, display_name, description) VALUES
('00000000-0000-0000-0000-000000000001', 'super_admin', 'Super Administrator', 'Full access to all system modules'),
('00000000-0000-0000-0000-000000000002', 'admin', 'Administrator', 'Administrative access'),
('00000000-0000-0000-0000-000000000003', 'sales_manager', 'Sales Manager', 'Manages sales team and leads'),
('00000000-0000-0000-0000-000000000004', 'sales_agent', 'Sales Agent', 'Handles leads and customer interactions')
ON CONFLICT (name) DO NOTHING;

-- Seed default permissions for Super Admin
INSERT INTO role_permissions (role_id, module, action)
SELECT '00000000-0000-0000-0000-000000000001', m.module, a.action
FROM (SELECT unnest(enum_range(NULL::permission_module)) AS module) m
CROSS JOIN (SELECT unnest(enum_range(NULL::permission_action)) AS action) a
ON CONFLICT DO NOTHING;

-- ==========================================
-- 3. VEHICLES & REAL ESTATE TABLES
-- ==========================================

-- Master Brands & Models
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    vehicle_type vehicle_type,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE car_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_brand_model UNIQUE (brand_id, name)
);

-- Shared Features & Facilities
CREATE TABLE features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL DEFAULT 'general',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    icon TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cars Table
CREATE TABLE cars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE RESTRICT,
    model_id UUID NOT NULL REFERENCES car_models(id) ON DELETE RESTRICT,
    year INTEGER NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    condition car_condition NOT NULL DEFAULT 'used',
    transmission transmission_type NOT NULL DEFAULT 'automatic',
    fuel_type fuel_type NOT NULL DEFAULT 'petrol',
    drive_type drive_type NOT NULL DEFAULT 'fwd',
    body_type body_type NOT NULL DEFAULT 'sedan',
    mileage INTEGER DEFAULT 0 CHECK (mileage >= 0),
    engine_capacity INTEGER,
    color TEXT,
    status listing_status NOT NULL DEFAULT 'available',
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE car_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE car_features (
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
    PRIMARY KEY (car_id, feature_id)
);

-- Scooters Table
CREATE TABLE scooters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE RESTRICT,
    model_id UUID REFERENCES car_models(id) ON DELETE SET NULL,
    year INTEGER NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    condition car_condition NOT NULL DEFAULT 'new',
    engine_capacity INTEGER,
    color TEXT,
    status listing_status NOT NULL DEFAULT 'available',
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE scooter_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scooter_id UUID NOT NULL REFERENCES scooters(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE scooter_features (
    scooter_id UUID NOT NULL REFERENCES scooters(id) ON DELETE CASCADE,
    feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
    PRIMARY KEY (scooter_id, feature_id)
);

-- Projects Table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    location TEXT NOT NULL,
    city TEXT,
    description TEXT,
    status project_status NOT NULL DEFAULT 'under_construction',
    total_units INTEGER NOT NULL DEFAULT 0,
    available_units INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE project_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE project_facilities (
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, facility_id)
);

-- Towers Table
CREATE TABLE towers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    floors_count INTEGER DEFAULT 1,
    total_units INTEGER NOT NULL DEFAULT 0,
    available_units INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE tower_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tower_id UUID NOT NULL REFERENCES towers(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tower_facilities (
    tower_id UUID NOT NULL REFERENCES towers(id) ON DELETE CASCADE,
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    PRIMARY KEY (tower_id, facility_id)
);

-- Properties Table (With Parent Constraint)
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    tower_id UUID REFERENCES towers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    property_type property_type NOT NULL DEFAULT 'apartment',
    property_status property_status NOT NULL DEFAULT 'available',
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    area_sqm NUMERIC(10, 2) NOT NULL CHECK (area_sqm > 0),
    bedrooms INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 0,
    floor_number INTEGER DEFAULT 0,
    finishing_type finishing_type NOT NULL DEFAULT 'finished',
    description TEXT,
    location TEXT,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_property_has_parent CHECK (project_id IS NOT NULL OR tower_id IS NOT NULL OR location IS NOT NULL)
);

CREATE TABLE property_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE property_features (
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
    PRIMARY KEY (property_id, feature_id)
);

-- ==========================================
-- 4. CRM & LEADS TABLES
-- ==========================================

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    email TEXT,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    lead_type lead_type NOT NULL DEFAULT 'general',
    status lead_status NOT NULL DEFAULT 'new',
    source lead_source NOT NULL DEFAULT 'website',
    preferred_contact_method contact_method DEFAULT 'whatsapp',
    car_id UUID REFERENCES cars(id) ON DELETE SET NULL,
    scooter_id UUID REFERENCES scooters(id) ON DELETE SET NULL,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    budget_min NUMERIC(12, 2),
    budget_max NUMERIC(12, 2),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE lead_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE lead_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE lead_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    old_status lead_status,
    new_status lead_status NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE customer_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 5. SYSTEM TABLES
-- ==========================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL DEFAULT 'system_alert',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    report_type TEXT NOT NULL,
    parameters JSONB DEFAULT '{}'::jsonb,
    generated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE company_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 6. FUNCTIONS & TRIGGERS
-- ==========================================

-- Trigger Function: Auto update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER trg_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_brands_updated_at BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_car_models_updated_at BEFORE UPDATE ON car_models FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_cars_updated_at BEFORE UPDATE ON cars FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_scooters_updated_at BEFORE UPDATE ON scooters FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_towers_updated_at BEFORE UPDATE ON towers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_company_settings_updated_at BEFORE UPDATE ON company_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Function: RBAC Permission Checker
CREATE OR REPLACE FUNCTION has_permission(
    p_module permission_module,
    p_action permission_action
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_role_id UUID;
    v_role_name TEXT;
BEGIN
    -- Return true for super_admin or service_role
    IF auth.jwt() ->> 'role' = 'service_role' THEN
        RETURN TRUE;
    END IF;

    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    SELECT p.role_id, r.name INTO v_role_id, v_role_name
    FROM profiles p
    LEFT JOIN roles r ON r.id = p.role_id
    WHERE p.id = auth.uid() AND p.status = 'active' AND p.deleted_at IS NULL;

    IF v_role_name = 'super_admin' THEN
        RETURN TRUE;
    END IF;

    IF v_role_id IS NULL THEN
        RETURN FALSE;
    END IF;

    RETURN EXISTS (
        SELECT 1
        FROM role_permissions
        WHERE role_id = v_role_id
          AND module = p_module
          AND action = p_action
    );
END;
$$ LANGUAGE plpgsql;

-- RPC Function: Submit Lead (with Customer De-duplication)
CREATE OR REPLACE FUNCTION submit_lead(
    p_customer_name TEXT,
    p_customer_phone TEXT,
    p_customer_email TEXT DEFAULT NULL,
    p_lead_type lead_type DEFAULT 'general',
    p_source lead_source DEFAULT 'website',
    p_preferred_contact_method contact_method DEFAULT 'whatsapp',
    p_car_id UUID DEFAULT NULL,
    p_scooter_id UUID DEFAULT NULL,
    p_property_id UUID DEFAULT NULL,
    p_budget_min NUMERIC DEFAULT NULL,
    p_budget_max NUMERIC DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_customer_id UUID;
    v_lead_id UUID;
BEGIN
    -- Sanitize and check customer by phone
    SELECT id INTO v_customer_id
    FROM customers
    WHERE phone = trim(p_customer_phone) AND deleted_at IS NULL;

    IF v_customer_id IS NULL THEN
        INSERT INTO customers (name, phone, email)
        VALUES (trim(p_customer_name), trim(p_customer_phone), NULLIF(trim(p_customer_email), ''))
        RETURNING id INTO v_customer_id;
    ELSE
        -- Update existing customer details if provided
        UPDATE customers
        SET name = COALESCE(NULLIF(trim(p_customer_name), ''), name),
            email = COALESCE(NULLIF(trim(p_customer_email), ''), email),
            updated_at = NOW()
        WHERE id = v_customer_id;
    END IF;

    -- Create Lead
    INSERT INTO leads (
        customer_id,
        lead_type,
        status,
        source,
        preferred_contact_method,
        car_id,
        scooter_id,
        property_id,
        budget_min,
        budget_max,
        notes
    ) VALUES (
        v_customer_id,
        p_lead_type,
        'new',
        p_source,
        p_preferred_contact_method,
        p_car_id,
        p_scooter_id,
        p_property_id,
        p_budget_min,
        p_budget_max,
        p_notes
    )
    RETURNING id INTO v_lead_id;

    -- Log initial status in history
    INSERT INTO lead_status_history (lead_id, old_status, new_status, notes)
    VALUES (v_lead_id, NULL, 'new', 'Lead submitted via submit_lead RPC');

    RETURN v_lead_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger Function: Log Lead Status Changes
CREATE OR REPLACE FUNCTION log_lead_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO lead_status_history (
            lead_id,
            changed_by,
            old_status,
            new_status,
            notes
        ) VALUES (
            NEW.id,
            auth.uid(),
            OLD.status,
            NEW.status,
            'Status changed'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_lead_status AFTER UPDATE ON leads
FOR EACH ROW EXECUTE FUNCTION log_lead_status_change();

-- Function & Trigger: Refresh Project & Tower Unit Counts
CREATE OR REPLACE FUNCTION refresh_units_count()
RETURNS TRIGGER AS $$
DECLARE
    v_project_id UUID;
    v_tower_id UUID;
BEGIN
    v_project_id := COALESCE(NEW.project_id, OLD.project_id);
    v_tower_id := COALESCE(NEW.tower_id, OLD.tower_id);

    IF v_tower_id IS NOT NULL THEN
        UPDATE towers
        SET total_units = (SELECT COUNT(*) FROM properties WHERE tower_id = v_tower_id AND deleted_at IS NULL),
            available_units = (SELECT COUNT(*) FROM properties WHERE tower_id = v_tower_id AND property_status = 'available' AND deleted_at IS NULL)
        WHERE id = v_tower_id;
    END IF;

    IF v_project_id IS NOT NULL THEN
        UPDATE projects
        SET total_units = (SELECT COUNT(*) FROM properties WHERE project_id = v_project_id AND deleted_at IS NULL),
            available_units = (SELECT COUNT(*) FROM properties WHERE project_id = v_project_id AND property_status = 'available' AND deleted_at IS NULL)
        WHERE id = v_project_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_refresh_property_units
AFTER INSERT OR UPDATE OR DELETE ON properties
FOR EACH ROW EXECUTE FUNCTION refresh_units_count();

-- ==========================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE scooters ENABLE ROW LEVEL SECURITY;
ALTER TABLE scooter_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE scooter_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE towers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tower_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE tower_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------
-- PUBLIC / ANON READ POLICIES
-- ------------------------------------------

CREATE POLICY "Public can view active brands" ON brands FOR SELECT USING (true);
CREATE POLICY "Public can view active car_models" ON car_models FOR SELECT USING (true);
CREATE POLICY "Public can view features" ON features FOR SELECT USING (true);
CREATE POLICY "Public can view facilities" ON facilities FOR SELECT USING (true);

CREATE POLICY "Public can view available cars" ON cars FOR SELECT USING (deleted_at IS NULL AND status = 'available');
CREATE POLICY "Public can view car images" ON car_images FOR SELECT USING (EXISTS (SELECT 1 FROM cars WHERE cars.id = car_images.car_id AND cars.deleted_at IS NULL));
CREATE POLICY "Public can view car features" ON car_features FOR SELECT USING (EXISTS (SELECT 1 FROM cars WHERE cars.id = car_features.car_id AND cars.deleted_at IS NULL));

CREATE POLICY "Public can view available scooters" ON scooters FOR SELECT USING (deleted_at IS NULL AND status = 'available');
CREATE POLICY "Public can view scooter images" ON scooter_images FOR SELECT USING (EXISTS (SELECT 1 FROM scooters WHERE scooters.id = scooter_images.scooter_id AND scooters.deleted_at IS NULL));
CREATE POLICY "Public can view scooter features" ON scooter_features FOR SELECT USING (EXISTS (SELECT 1 FROM scooters WHERE scooters.id = scooter_features.scooter_id AND scooters.deleted_at IS NULL));

CREATE POLICY "Public can view active projects" ON projects FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public can view project images" ON project_images FOR SELECT USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_images.project_id AND projects.deleted_at IS NULL));
CREATE POLICY "Public can view project facilities" ON project_facilities FOR SELECT USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_facilities.project_id AND projects.deleted_at IS NULL));

CREATE POLICY "Public can view active towers" ON towers FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public can view tower images" ON tower_images FOR SELECT USING (EXISTS (SELECT 1 FROM towers WHERE towers.id = tower_images.tower_id AND towers.deleted_at IS NULL));
CREATE POLICY "Public can view tower facilities" ON tower_facilities FOR SELECT USING (EXISTS (SELECT 1 FROM towers WHERE towers.id = tower_facilities.tower_id AND towers.deleted_at IS NULL));

CREATE POLICY "Public can view available properties" ON properties FOR SELECT USING (deleted_at IS NULL AND property_status = 'available');
CREATE POLICY "Public can view property images" ON property_images FOR SELECT USING (EXISTS (SELECT 1 FROM properties WHERE properties.id = property_images.property_id AND properties.deleted_at IS NULL));
CREATE POLICY "Public can view property features" ON property_features FOR SELECT USING (EXISTS (SELECT 1 FROM properties WHERE properties.id = property_features.property_id AND properties.deleted_at IS NULL));

CREATE POLICY "Public can view company settings" ON company_settings FOR SELECT USING (true);

-- ------------------------------------------
-- PROFILES & USER NOTIFICATIONS
-- ------------------------------------------

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id OR has_permission('users', 'read'));
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id OR has_permission('users', 'update'));
CREATE POLICY "Staff manage profiles" ON profiles FOR ALL USING (has_permission('users', 'manage'));

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- ------------------------------------------
-- STAFF / PERMISSION BASED POLICIES
-- ------------------------------------------

-- Cars Management
CREATE POLICY "Staff read cars" ON cars FOR SELECT USING (has_permission('cars', 'read'));
CREATE POLICY "Staff insert cars" ON cars FOR INSERT WITH CHECK (has_permission('cars', 'create'));
CREATE POLICY "Staff update cars" ON cars FOR UPDATE USING (has_permission('cars', 'update'));
CREATE POLICY "Staff delete cars" ON cars FOR DELETE USING (has_permission('cars', 'delete'));

-- Scooters Management
CREATE POLICY "Staff read scooters" ON scooters FOR SELECT USING (has_permission('scooters', 'read'));
CREATE POLICY "Staff insert scooters" ON scooters FOR INSERT WITH CHECK (has_permission('scooters', 'create'));
CREATE POLICY "Staff update scooters" ON scooters FOR UPDATE USING (has_permission('scooters', 'update'));
CREATE POLICY "Staff delete scooters" ON scooters FOR DELETE USING (has_permission('scooters', 'delete'));

-- Real Estate Management (Projects, Towers, Properties)
CREATE POLICY "Staff read projects" ON projects FOR SELECT USING (has_permission('real_estate', 'read'));
CREATE POLICY "Staff write projects" ON projects FOR ALL USING (has_permission('real_estate', 'manage'));

CREATE POLICY "Staff read towers" ON towers FOR SELECT USING (has_permission('real_estate', 'read'));
CREATE POLICY "Staff write towers" ON towers FOR ALL USING (has_permission('real_estate', 'manage'));

CREATE POLICY "Staff read properties" ON properties FOR SELECT USING (has_permission('real_estate', 'read'));
CREATE POLICY "Staff insert properties" ON properties FOR INSERT WITH CHECK (has_permission('real_estate', 'create'));
CREATE POLICY "Staff update properties" ON properties FOR UPDATE USING (has_permission('real_estate', 'update'));
CREATE POLICY "Staff delete properties" ON properties FOR DELETE USING (has_permission('real_estate', 'delete'));

-- CRM Management (Customers & Leads)
CREATE POLICY "Staff read customers" ON customers FOR SELECT USING (has_permission('customers', 'read'));
CREATE POLICY "Staff insert customers" ON customers FOR INSERT WITH CHECK (has_permission('customers', 'create'));
CREATE POLICY "Staff update customers" ON customers FOR UPDATE USING (has_permission('customers', 'update'));
CREATE POLICY "Staff delete customers" ON customers FOR DELETE USING (has_permission('customers', 'delete'));

CREATE POLICY "Staff read leads" ON leads FOR SELECT USING (has_permission('leads', 'read'));
CREATE POLICY "Staff insert leads" ON leads FOR INSERT WITH CHECK (has_permission('leads', 'create'));
CREATE POLICY "Staff update leads" ON leads FOR UPDATE USING (has_permission('leads', 'update'));
CREATE POLICY "Staff delete leads" ON leads FOR DELETE USING (has_permission('leads', 'delete'));

CREATE POLICY "Staff read lead notes" ON lead_notes FOR SELECT USING (has_permission('leads', 'read'));
CREATE POLICY "Staff create lead notes" ON lead_notes FOR INSERT WITH CHECK (has_permission('leads', 'create'));

CREATE POLICY "Staff read lead history" ON lead_status_history FOR SELECT USING (has_permission('leads', 'read'));

-- Roles & Role Permissions Management
CREATE POLICY "Staff read roles" ON roles FOR SELECT USING (has_permission('roles', 'read'));
CREATE POLICY "Staff write roles" ON roles FOR ALL USING (has_permission('roles', 'manage'));

CREATE POLICY "Staff read role permissions" ON role_permissions FOR SELECT USING (has_permission('roles', 'read'));
CREATE POLICY "Staff write role permissions" ON role_permissions FOR ALL USING (has_permission('roles', 'manage'));

-- Audit Logs & Reports
CREATE POLICY "Staff read audit logs" ON audit_logs FOR SELECT USING (has_permission('audit_logs', 'read'));
CREATE POLICY "Staff read reports" ON reports FOR SELECT USING (has_permission('reports', 'read'));
CREATE POLICY "Staff create reports" ON reports FOR INSERT WITH CHECK (has_permission('reports', 'create'));


