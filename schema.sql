-- ============================================================================
// CRYPTOSTREEMZ - MATRIX MLm SCHEMA
// The "Lathe Configuration" - 12-wide Founder exception
// ============================================================================

-- ============================================================================
// CORE TABLES
// ============================================================================

-- Users table with Matrix/MLM fields
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    password_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Economy
    wallet_credits DECIMAL DEFAULT 0,
    
    -- ============================================================================
    // THE 3-WALLET ECONOMY (Strict Separation of Funds)
    // Executed per Executive Vision - Override previous assumptions
    // ============================================================================
    
    -- 1. THE BRIDGE (Universal Credits)
    -- Pegged 1:1 with USDT TRC-20. The "Entry Fee" currency.
    universal_credits DECIMAL(10, 2) DEFAULT 0.00,
    
    -- 2. THE ARCADE (DoughDiamonds)
    -- Game Currency. Bought with Credits. Used for Gifting/Items.
    dough_diamonds INTEGER DEFAULT 0,
    
    -- 3. THE DEFI (Civitas & Texit)
    -- Staking & Governance. Completely separate from Game mechanics.
    civitas_balance DECIMAL(18, 8) DEFAULT 0.00000000,
    wtxc_balance DECIMAL(18, 8) DEFAULT 0.00000000;

    -- Matrix/MLM Fields (The Lathe Configuration)
    matrix_parent_id UUID REFERENCES users(id),
    matrix_level INTEGER DEFAULT 0,
    matrix_position INTEGER DEFAULT 0, -- 1-3 for regular, 1-12 for Founder
    is_founder BOOLEAN DEFAULT FALSE, -- ID=1 is hardcoded to TRUE
    paid_status TEXT DEFAULT 'trial', -- 'trial', 'paid', 'free'
    prelaunch BOOLEAN DEFAULT TRUE,
    
    -- Profile
    avatar_url TEXT,
    is_agent BOOLEAN DEFAULT FALSE,
    is_trucker BOOLEAN DEFAULT FALSE,
    reputation_score INTEGER DEFAULT 0
);

-- Create index for matrix queries
CREATE INDEX IF NOT EXISTS idx_users_matrix_parent ON users(matrix_parent_id);
CREATE INDEX IF NOT EXISTS idx_users_is_founder ON users(is_founder);
CREATE INDEX IF NOT EXISTS idx_users_paid_status ON users(paid_status);

-- ============================================================================
// SUPPORTING TABLES
// ============================================================================

-- Wallets (Universal Economy)
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    balance_credits DECIMAL DEFAULT 0,
    currency TEXT DEFAULT 'CIVITAS',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pets (Multisite Game)
CREATE TABLE IF NOT EXISTS pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    pet_name TEXT,
    pet_type TEXT, -- 'dog', 'cat', 'bird', 'rabbit'
    xp_level INTEGER DEFAULT 1,
    health INTEGER DEFAULT 100,
    hunger INTEGER DEFAULT 100,
    last_fed TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social Graph (Circles)
CREATE TABLE IF NOT EXISTS social_graph (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE,
    circle_name TEXT DEFAULT 'General',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id, circle_name)
);

-- Universal Inbox (Cross-App Messaging)
CREATE TABLE IF NOT EXISTS universal_inbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    origin_app TEXT NOT NULL, -- 'CryptoStreemz', 'DoughDiamonds', etc.
    message_type TEXT, -- 'system', 'trade', 'social', 'matrix'
    subject TEXT,
    body TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
// AUTO-TRIGGER FOR NEW USERS
// ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Set username from email if not provided
    IF NEW.username IS NULL THEN
        NEW.username = split_part(NEW.email, '@', 1);
    END IF;
    
    -- Hardcode ID=1 as Founder (This is the Lathe Configuration)
    IF NEW.id = '00000000-0000-0000-0000-000000000001' THEN
        NEW.is_founder = TRUE;
        NEW.matrix_position = 1;
        NEW.paid_status = 'paid';
        NEW.prelaunch = FALSE;
    END IF;
    
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_new_user
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ============================================================================
// HELPER FUNCTIONS
// ============================================================================

-- Get user's matrix subtree size (for weakest leg calculation)
CREATE OR REPLACE FUNCTION get_subtree_size(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    count_val INTEGER;
BEGIN
    WITH RECURSIVE user_tree AS (
        SELECT id FROM users WHERE id = user_id
        UNION ALL
        SELECT u.id FROM users u
        INNER JOIN user_tree ut ON u.matrix_parent_id = ut.id
    )
    SELECT COUNT(*) - 1 INTO count_val FROM user_tree; -- Exclude self
    RETURN COALESCE(count_val, 0);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
// SAMPLE DATA - FOUNDER
// ============================================================================

-- Insert Founder (ID=1 will be auto-set by trigger)
INSERT INTO users (id, email, is_founder, matrix_position, paid_status, prelaunch)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'founder@cryptostreemz.io', TRUE, 1, 'paid', FALSE)
ON CONFLICT (id) DO NOTHING;
