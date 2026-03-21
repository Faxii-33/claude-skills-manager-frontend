-- ============================================================
-- Skills Manager — Supabase Migration
-- Run this in your Supabase SQL Editor (supabase.com dashboard)
-- ============================================================

-- 1. Add columns to existing skills table
ALTER TABLE skills ADD COLUMN IF NOT EXISTS created_by UUID;

-- 2. Profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       TEXT NOT NULL,
    display_name TEXT NOT NULL,
    role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Skill invocations table (for dashboard stats)
CREATE TABLE IF NOT EXISTS skill_invocations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_name  TEXT NOT NULL REFERENCES skills(name) ON DELETE CASCADE,
    invoked_at  TIMESTAMPTZ DEFAULT NOW(),
    user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_invocations_skill ON skill_invocations(skill_name);
CREATE INDEX IF NOT EXISTS idx_invocations_time ON skill_invocations(invoked_at DESC);

-- 4. Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_invocations ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all profiles, update only their own
CREATE POLICY "Anyone can read profiles"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Skills: everyone can read, admins can do everything, users can edit their own
CREATE POLICY "Anyone can read skills"
    ON skills FOR SELECT
    USING (true);

CREATE POLICY "Admins can insert skills"
    ON skills FOR INSERT
    WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
        OR
        auth.uid() IS NOT NULL
    );

CREATE POLICY "Users can update own skills or admins can update any"
    ON skills FOR UPDATE
    USING (
        created_by = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can delete any skill"
    ON skills FOR DELETE
    USING (
        created_by = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Invocations: everyone can read, authenticated can insert
CREATE POLICY "Anyone authenticated can read invocations"
    ON skill_invocations FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone authenticated can insert invocations"
    ON skill_invocations FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- 5. Auto-update updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Skills already may have this trigger, create only if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'skills_updated_at') THEN
        CREATE TRIGGER skills_updated_at
            BEFORE UPDATE ON skills
            FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    END IF;
END $$;

-- 6. Create your first admin user
-- After running this migration:
--   1. Go to Supabase Auth > Users > "Add User"
--   2. Create a user with email + password
--   3. Copy the user's UUID and run:
--
--   INSERT INTO profiles (id, email, display_name, role)
--   VALUES ('YOUR-USER-UUID-HERE', 'admin@yourcompany.com', 'Admin', 'admin');
