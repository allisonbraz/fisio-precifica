-- Row Level Security Policies for fisio-precifica
-- Run this in the Supabase SQL Editor or as a migration
--
-- Prerequisites:
--   1. Tables must exist (run drizzle migrations first)
--   2. Supabase auth must be configured

-- ============================================
-- PRICING_DATA: users can only access their own data
-- ============================================

ALTER TABLE pricing_data ENABLE ROW LEVEL SECURITY;

-- Users can read their own pricing data
CREATE POLICY "Users can read own pricing data"
  ON pricing_data
  FOR SELECT
  USING (
    "ownerEmail" = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Users can insert their own pricing data
CREATE POLICY "Users can insert own pricing data"
  ON pricing_data
  FOR INSERT
  WITH CHECK (
    "ownerEmail" = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Users can update their own pricing data
CREATE POLICY "Users can update own pricing data"
  ON pricing_data
  FOR UPDATE
  USING (
    "ownerEmail" = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  WITH CHECK (
    "ownerEmail" = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- ============================================
-- USERS: users can read their own profile
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  USING (
    "supabaseId" = auth.uid()::text
  );

-- Service role (backend) can manage all users
-- Note: The backend uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS

-- ============================================
-- LEADS: only admins can read (backend handles via service role)
-- ============================================

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Public can insert leads (registration form)
CREATE POLICY "Anyone can register as lead"
  ON leads
  FOR INSERT
  WITH CHECK (true);

-- Only service role (backend admin procedures) can read leads
-- No SELECT policy for regular users = they can't read leads table directly

-- ============================================
-- ADMIN ACCESS NOTE
-- ============================================
-- The backend uses SUPABASE_SERVICE_ROLE_KEY for admin operations.
-- Service role bypasses ALL RLS policies automatically.
-- This means admin procedures (leads.list, contacts.list, contacts.changeEmail)
-- continue to work without any additional policies.
