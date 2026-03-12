-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard)
-- This allows all operations for the anonymous role on store tables

-- Products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON products;
CREATE POLICY "anon_all" ON products FOR ALL TO anon USING (true) WITH CHECK (true);

-- Categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON categories;
CREATE POLICY "anon_all" ON categories FOR ALL TO anon USING (true) WITH CHECK (true);

-- Config
ALTER TABLE config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON config;
CREATE POLICY "anon_all" ON config FOR ALL TO anon USING (true) WITH CHECK (true);

-- Customers: add new columns if not exists
ALTER TABLE customers ADD COLUMN IF NOT EXISTS logistics text NOT NULL DEFAULT '';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS village text NOT NULL DEFAULT '';

-- Customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON customers;
CREATE POLICY "anon_all" ON customers FOR ALL TO anon USING (true) WITH CHECK (true);

-- Orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON orders;
CREATE POLICY "anon_all" ON orders FOR ALL TO anon USING (true) WITH CHECK (true);
