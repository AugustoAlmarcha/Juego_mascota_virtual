-- ============================================================================
-- MIGRACIÓN 001: ESQUEMA INICIAL DE MASCOTA VIRTUAL
-- Tablas: users, households, household_members, pets
-- ============================================================================

-- 1. TABLA DE USUARIOS (Cuidadores)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA DEL HOGAR (Household)
-- Raíz de agregación para economía y mascota compartida
CREATE TABLE IF NOT EXISTS households (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    invite_code VARCHAR(20) UNIQUE NOT NULL,
    coins INTEGER DEFAULT 100 CHECK (coins >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA INTERMEDIA (Miembros del Hogar: Relación N:M)
CREATE TABLE IF NOT EXISTS household_members (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, household_id)
);

-- 4. TABLA DE LA MASCOTA VIRTUAL
CREATE TABLE IF NOT EXISTS pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    species VARCHAR(30) DEFAULT 'panda',
    hunger INTEGER DEFAULT 50 CHECK (hunger BETWEEN 0 AND 100),
    happiness INTEGER DEFAULT 80 CHECK (happiness BETWEEN 0 AND 100),
    energy INTEGER DEFAULT 100 CHECK (energy BETWEEN 0 AND 100),
    last_fed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimizar búsquedas frecuentes por red
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_households_invite_code ON households(invite_code);
CREATE INDEX IF NOT EXISTS idx_pets_household ON pets(household_id);
