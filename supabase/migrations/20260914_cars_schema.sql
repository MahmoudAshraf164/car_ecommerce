-- ==========================================================
-- 1. SCHEMAS & TABLES FOR CARS MODULE (El Omda Brothers)
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. BRANDS TABLE
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CAR MODELS TABLE
CREATE TABLE IF NOT EXISTS car_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_brand_model_name UNIQUE (brand_id, name)
);

-- 3. CARS TABLE
CREATE TABLE IF NOT EXISTS cars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    brand_id UUID REFERENCES brands(id) ON DELETE RESTRICT,
    model_id UUID REFERENCES car_models(id) ON DELETE SET NULL,
    year INTEGER NOT NULL DEFAULT 2024,
    price NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
    status TEXT NOT NULL DEFAULT 'available',
    condition TEXT DEFAULT 'used',
    transmission TEXT DEFAULT 'automatic',
    fuel_type TEXT DEFAULT 'petrol',
    drive_type TEXT DEFAULT 'fwd',
    body_type TEXT DEFAULT 'sedan',
    mileage INTEGER DEFAULT 0,
    engine_capacity INTEGER,
    color TEXT,
    featured BOOLEAN DEFAULT FALSE,
    description TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- ==========================================================
-- 2. RLS POLICIES
-- ==========================================================

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view brands" ON brands;
DROP POLICY IF EXISTS "Public can view car_models" ON car_models;
DROP POLICY IF EXISTS "Public can view cars" ON cars;
DROP POLICY IF EXISTS "Admins can manage brands" ON brands;
DROP POLICY IF EXISTS "Admins can manage car_models" ON car_models;
DROP POLICY IF EXISTS "Admins can manage cars" ON cars;

-- Public Read Policies
CREATE POLICY "Public can view brands" ON brands FOR SELECT USING (true);
CREATE POLICY "Public can view car_models" ON car_models FOR SELECT USING (true);
CREATE POLICY "Public can view cars" ON cars FOR SELECT USING (deleted_at IS NULL);

-- Admin / Authenticated Management Policies
CREATE POLICY "Admins can manage brands" ON brands FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admins can manage car_models" ON car_models FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admins can manage cars" ON cars FOR ALL USING (true) WITH CHECK (true);

-- ==========================================================
-- 3. SEED DATA (MANDATORY INITIAL BRANDS & MODELS)
-- ==========================================================

INSERT INTO brands (name) VALUES
('Mercedes-Benz'),
('BMW'),
('Porsche'),
('Range Rover'),
('Audi'),
('Toyota'),
('Vespa')
ON CONFLICT (name) DO NOTHING;

-- Mercedes-Benz Models
INSERT INTO car_models (brand_id, name)
SELECT id, 'S-Class' FROM brands WHERE name = 'Mercedes-Benz'
ON CONFLICT (brand_id, name) DO NOTHING;

INSERT INTO car_models (brand_id, name)
SELECT id, 'C200 AMG' FROM brands WHERE name = 'Mercedes-Benz'
ON CONFLICT (brand_id, name) DO NOTHING;

INSERT INTO car_models (brand_id, name)
SELECT id, 'G63 AMG' FROM brands WHERE name = 'Mercedes-Benz'
ON CONFLICT (brand_id, name) DO NOTHING;

-- BMW Models
INSERT INTO car_models (brand_id, name)
SELECT id, 'M5 Competition' FROM brands WHERE name = 'BMW'
ON CONFLICT (brand_id, name) DO NOTHING;

INSERT INTO car_models (brand_id, name)
SELECT id, 'X5 xDrive40i' FROM brands WHERE name = 'BMW'
ON CONFLICT (brand_id, name) DO NOTHING;

INSERT INTO car_models (brand_id, name)
SELECT id, '740i' FROM brands WHERE name = 'BMW'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Porsche Models
INSERT INTO car_models (brand_id, name)
SELECT id, '911 Carrera S' FROM brands WHERE name = 'Porsche'
ON CONFLICT (brand_id, name) DO NOTHING;

INSERT INTO car_models (brand_id, name)
SELECT id, 'Panamera GTS' FROM brands WHERE name = 'Porsche'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Range Rover Models
INSERT INTO car_models (brand_id, name)
SELECT id, 'Range Rover Sport' FROM brands WHERE name = 'Range Rover'
ON CONFLICT (brand_id, name) DO NOTHING;

INSERT INTO car_models (brand_id, name)
SELECT id, 'Defender 110' FROM brands WHERE name = 'Range Rover'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Toyota Models
INSERT INTO car_models (brand_id, name)
SELECT id, 'Land Cruiser VXR' FROM brands WHERE name = 'Toyota'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Vespa Models
INSERT INTO car_models (brand_id, name)
SELECT id, 'GTS Super 300' FROM brands WHERE name = 'Vespa'
ON CONFLICT (brand_id, name) DO NOTHING;
