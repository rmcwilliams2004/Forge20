-- SynapseForge AI Production Database Schema
-- Optimized for PostgreSQL 15+

-- 1. Identity & Subscription Tiers
CREATE TYPE subscription_status AS ENUM ('FREE', 'PRO_TRIAL', 'PRO_ACTIVE', 'ENTERPRISE', 'EXPIRED');

CREATE TABLE users (
    id TEXT PRIMARY KEY, -- Google Sub or CUID
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    picture TEXT,
    
    -- IP Sovereignty Metadata
    legal_identity TEXT, -- Individual Legal Name
    company_name TEXT,
    use_company_attribution BOOLEAN DEFAULT FALSE,
    default_protection_pref TEXT DEFAULT 'AI_RECOMMENDED',
    
    -- Monetization
    subscription_status subscription_status DEFAULT 'FREE',
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    stripe_customer_id TEXT UNIQUE,
    
    -- Governance
    role TEXT DEFAULT 'Editor', -- Admin, Manager, Editor, Viewer
    branch TEXT DEFAULT 'General Engineering',
    analyses_run INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Projects & Versioning (The PLaaS Ledger)
CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    tags TEXT[] DEFAULT '{}',
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    version_id TEXT NOT NULL, -- Logical version number (e.g., v1.0.2)
    commit_message TEXT,
    prompt TEXT NOT NULL,
    faction_id TEXT NOT NULL,
    
    -- High-Fidelity JSON Payloads
    result JSONB NOT NULL, -- AnalysisResult payload
    rotor_model JSONB,
    drawings JSONB DEFAULT '[]', -- Array of { id, prompt, url }
    inspirational_images JSONB DEFAULT '[]',
    
    -- IP Audit Data
    legal_hash TEXT NOT NULL, -- SHA-256 fingerprint for Innovation Certificate
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Disciplinary Knowledge Base (Multi-Tenant RAG)
CREATE TABLE ingested_documents (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    branch TEXT NOT NULL,
    phd_metadata JSONB, -- Governing physics, critical constants
    embedding VECTOR(1536), -- If using pgvector for semantic search
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Audit & Analytics Ledger
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    project_id TEXT,
    level TEXT NOT NULL, -- INFO, WARN, ERROR
    action TEXT NOT NULL, -- e.g., 'IP_SECURED', 'VERSION_COMMITTED'
    message TEXT NOT NULL,
    metadata JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Operational Efficiency
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_project_user ON projects(user_id);
CREATE INDEX idx_version_project ON project_versions(project_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
