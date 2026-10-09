-- =========================================================================
-- SynapseForge AI: Sovereign Engineering Intelligence & RAG Vault Schema
-- Optimized for PostgreSQL 15+ with pgvector & pg_trgm extensions
-- =========================================================================

-- Enable pgvector for dense semantic embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable pg_trgm for fuzzy text and trigram similarity indexing
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enable uuid generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------------------
-- 1. Identity, Governance & Subscription Tiers
-- -------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('FREE', 'PRO_TRIAL', 'PRO_ACTIVE', 'ENTERPRISE', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, -- Google Sub or CUID
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    picture TEXT,
    
    -- IP Sovereignty Metadata
    legal_identity TEXT, -- Individual Legal Name
    company_name TEXT,
    use_company_attribution BOOLEAN DEFAULT FALSE,
    default_protection_pref TEXT DEFAULT 'AI_RECOMMENDED',
    
    -- Monetization & Licensing
    subscription_status subscription_status DEFAULT 'FREE',
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    stripe_customer_id TEXT UNIQUE,
    
    -- Governance & Disciplinary Roles
    role TEXT DEFAULT 'Editor', -- Admin, Manager, Editor, Viewer
    branch TEXT DEFAULT 'General Engineering',
    analyses_run INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------------------
-- 2. Projects & Versioning (The PLaaS Ledger)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    tags TEXT[] DEFAULT '{}',
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_versions (
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

-- -------------------------------------------------------------------------
-- 3. Engineering Documents (Source Vault for PDFs, Specs, Manuals)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS engineering_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    document_type TEXT NOT NULL, -- 'TECHNICAL_PDF', 'MATERIAL_SPEC', 'EQUIPMENT_MANUAL', 'STANDARD'
    file_path TEXT,
    file_size_bytes BIGINT,
    checksum_sha256 TEXT UNIQUE,
    branch TEXT NOT NULL DEFAULT 'GENERAL', -- 'AEROSPACE', 'MATERIALS', 'MICROFLUIDICS', etc.
    summary TEXT,
    governing_standards TEXT[] DEFAULT '{}', -- e.g. ['MIL-HDBK-5J', 'ISO 14644-1']
    metadata JSONB DEFAULT '{}', -- Document attributes, page count, parsing status
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------------------
-- 4. Document Chunks with pgvector & Hybrid Full-Text Search
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES engineering_documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    token_count INTEGER,
    section_heading TEXT,
    page_number INTEGER,
    
    -- Disciplinary classification & metadata
    branch TEXT NOT NULL DEFAULT 'GENERAL',
    critical_constants JSONB DEFAULT '{}', -- e.g. {"yield_strength_mpa": 880, "max_temp_c": 420}
    standard_references TEXT[] DEFAULT '{}', -- ['ASTM B348', 'MIL-HDBK-5J §5.4']
    
    -- Full-Text Search Vector (BM25 / ts_rank support)
    tsv tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(section_heading, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(content, '')), 'B')
    ) STORED,
    
    -- Dense 768-dimensional Vector Embedding (Gemini text-embedding-004 / Nommo-Embed)
    embedding vector(768),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------------------
-- 5. Validated Components Catalog (Reusable Certified B-Rep Assemblies)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS validated_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component_code TEXT UNIQUE NOT NULL, -- e.g. 'CMP-TI-AERO-081'
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'BRACKET', 'MANIFOLD', 'FLANGE', 'INJECTOR', 'FASTENER'
    material_grade TEXT NOT NULL, -- 'Ti-6Al-4V Grade 5', 'Inconel 718'
    
    -- Physical & Dimensional Constraints
    bounding_box_mm JSONB NOT NULL, -- {"x": 120.0, "y": 80.0, "z": 45.0}
    mass_grams NUMERIC(10, 2),
    volume_mm3 NUMERIC(12, 2),
    tolerance_class TEXT DEFAULT 'ISO 2768-mK',
    safety_factor NUMERIC(4, 2) DEFAULT 2.5,
    
    -- Fabrication & Verification Artifacts
    cad_step_url TEXT,
    cad_stl_url TEXT,
    cadquery_script TEXT,
    qualification_status TEXT DEFAULT 'FLIGHT_QUALIFIED', -- 'FLIGHT_QUALIFIED', 'PROTOTYPE_PASS', 'QUALIFIED_PRODUCTION'
    product_identifier TEXT,
    inventory_stock_qty INTEGER DEFAULT 0,
    unit_cost_usd NUMERIC(10, 2),
    
    -- Semantic Search Representation
    tsv tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(component_code, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(material_grade, '')), 'C')
    ) STORED,
    embedding vector(768),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------------------
-- 6. Engineering Standards & Regulatory Vault (ISO, ASTM, MIL-HDBK, ASME)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS engineering_standards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    standard_code TEXT UNIQUE NOT NULL, -- e.g. 'MIL-HDBK-5J-5.4.1', 'ISO-14644-1-CLASS-5'
    title TEXT NOT NULL,
    organization TEXT NOT NULL, -- 'DoD', 'ISO', 'ASTM', 'ASME', 'AIAA'
    clause_reference TEXT, -- '§5.4.1.3 Titanium Tensile Limits'
    governing_rules TEXT NOT NULL,
    recommended_safety_factor NUMERIC(4, 2) DEFAULT 1.5,
    parameter_limits JSONB DEFAULT '{}', -- {"min_wall_thickness_mm": 2.5, "max_temperature_c": 450}
    
    tsv tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(standard_code, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(governing_rules, '')), 'B')
    ) STORED,
    embedding vector(768),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------------------
-- 7. Equipment Inventory & Work Center Constraints (Facility Resources)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS equipment_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_code TEXT UNIQUE NOT NULL, -- e.g. 'EQ-CHAMBER-ALPHA', 'EQ-DMLS-EOS290'
    name TEXT NOT NULL,
    equipment_type TEXT NOT NULL, -- 'ENVIRONMENTAL_CHAMBER', 'DMLS_PRINTER', '5AXIS_CNC', 'OPTICAL_CMM'
    facility_location TEXT NOT NULL,
    
    -- Operational Envelopes
    build_envelope_mm JSONB DEFAULT '{}', -- {"x": 250, "y": 250, "z": 325}
    achievable_tolerance_mm NUMERIC(8, 4), -- e.g. 0.005 mm
    iso_cleanroom_class INTEGER, -- 5, 6, 7 or NULL
    particle_limit_0_5um INTEGER, -- particles/m3
    status TEXT DEFAULT 'OPERATIONAL', -- 'OPERATIONAL', 'MAINTENANCE', 'RESERVED'
    work_center_id TEXT,
    
    tsv tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(equipment_code, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(equipment_type, '')), 'B')
    ) STORED,
    embedding vector(768),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------------------
-- 8. Audit & Security Ledger
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    project_id TEXT,
    level TEXT NOT NULL, -- INFO, WARN, ERROR
    action TEXT NOT NULL, -- 'RAG_QUERY', 'COMPONENT_REUSED', 'VERSION_COMMITTED', 'IP_SECURED'
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------------------
-- Indexes for High-Performance Hybrid Search & Retrieval
-- -------------------------------------------------------------------------

-- HNSW Vector Cosine Distance Indexes for low-latency dense semantic recall
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding_hnsw 
    ON document_chunks USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_validated_components_embedding_hnsw 
    ON validated_components USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_engineering_standards_embedding_hnsw 
    ON engineering_standards USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_equipment_inventory_embedding_hnsw 
    ON equipment_inventory USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- GIN Full-Text Indexes for Sparse BM25 / Keyword Retrieval
CREATE INDEX IF NOT EXISTS idx_document_chunks_tsv ON document_chunks USING gin (tsv);
CREATE INDEX IF NOT EXISTS idx_validated_components_tsv ON validated_components USING gin (tsv);
CREATE INDEX IF NOT EXISTS idx_engineering_standards_tsv ON engineering_standards USING gin (tsv);
CREATE INDEX IF NOT EXISTS idx_equipment_inventory_tsv ON equipment_inventory USING gin (tsv);

-- B-Tree & Trigram Indexes for operational lookups
CREATE INDEX IF NOT EXISTS idx_user_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_project_user ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_version_project ON project_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_doc_chunks_doc_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_chunks_branch ON document_chunks(branch);
CREATE INDEX IF NOT EXISTS idx_validated_components_category ON validated_components(category);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);

-- -------------------------------------------------------------------------
-- Hybrid Reciprocal Rank Fusion Search Function (RRF)
-- Combines Dense Vector Cosine Similarity and Sparse Keyword BM25 Ranking
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION hybrid_search_engineering_vault(
    query_text TEXT,
    query_embedding vector(768),
    match_count INTEGER DEFAULT 5,
    alpha NUMERIC DEFAULT 0.6 -- Weight between dense vector (alpha) and sparse text (1 - alpha)
)
RETURNS TABLE (
    source_type TEXT,
    record_id UUID,
    title TEXT,
    reference_code TEXT,
    content TEXT,
    dense_similarity NUMERIC,
    sparse_rank NUMERIC,
    hybrid_score NUMERIC,
    metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH dense_chunks AS (
        SELECT 
            'CHUNK'::TEXT AS src,
            dc.id AS r_id,
            ed.title AS doc_title,
            array_to_string(dc.standard_references, ', ') AS ref,
            dc.content AS body,
            (1.0 - (dc.embedding <=> query_embedding))::NUMERIC AS d_sim,
            ROW_NUMBER() OVER (ORDER BY dc.embedding <=> query_embedding) AS d_rank,
            jsonb_build_object('branch', dc.branch, 'page', dc.page_number, 'constants', dc.critical_constants) AS meta
        FROM document_chunks dc
        LEFT JOIN engineering_documents ed ON dc.document_id = ed.id
        WHERE dc.embedding IS NOT NULL
        ORDER BY dc.embedding <=> query_embedding
        LIMIT 20
    ),
    sparse_chunks AS (
        SELECT 
            'CHUNK'::TEXT AS src,
            dc.id AS r_id,
            ed.title AS doc_title,
            array_to_string(dc.standard_references, ', ') AS ref,
            dc.content AS body,
            ts_rank_cd(dc.tsv, plainto_tsquery('english', query_text))::NUMERIC AS s_rank_val,
            ROW_NUMBER() OVER (ORDER BY ts_rank_cd(dc.tsv, plainto_tsquery('english', query_text)) DESC) AS s_rank,
            jsonb_build_object('branch', dc.branch, 'page', dc.page_number, 'constants', dc.critical_constants) AS meta
        FROM document_chunks dc
        LEFT JOIN engineering_documents ed ON dc.document_id = ed.id
        WHERE dc.tsv @@ plainto_tsquery('english', query_text)
        ORDER BY s_rank_val DESC
        LIMIT 20
    )
    SELECT 
        COALESCE(d.src, s.src) AS source_type,
        COALESCE(d.r_id, s.r_id) AS record_id,
        COALESCE(d.doc_title, s.doc_title) AS title,
        COALESCE(d.ref, s.ref) AS reference_code,
        COALESCE(d.body, s.body) AS content,
        COALESCE(d.d_sim, 0.0) AS dense_similarity,
        COALESCE(s.s_rank_val, 0.0) AS sparse_rank,
        (
            alpha * (1.0 / (60.0 + COALESCE(d.d_rank, 100))) +
            (1.0 - alpha) * (1.0 / (60.0 + COALESCE(s.s_rank, 100)))
        )::NUMERIC AS hybrid_score,
        COALESCE(d.meta, s.meta) AS metadata
    FROM dense_chunks d
    FULL OUTER JOIN sparse_chunks s ON d.r_id = s.r_id
    ORDER BY hybrid_score DESC
    LIMIT match_count;
END;
$$;

-- -------------------------------------------------------------------------
-- 9. Project Sharing & Collaborative Access Schema
-- -------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE share_permission AS ENUM ('view', 'edit');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS project_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_token TEXT UNIQUE NOT NULL, -- Cryptographic URL-safe token (e.g. 'sh_a8f9c1e...')
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    permission share_permission NOT NULL DEFAULT 'view',
    created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    invited_email TEXT, -- Optional specific collaborator email
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_revoked BOOLEAN DEFAULT FALSE,
    project_snapshot JSONB, -- Embedded full project state ledger for distributed sharing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_project_shares_token ON project_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_project_shares_project_id ON project_shares(project_id);

CREATE TABLE IF NOT EXISTS project_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    share_id UUID REFERENCES project_shares(id) ON DELETE SET NULL,
    user_email TEXT NOT NULL,
    permission share_permission NOT NULL DEFAULT 'view',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (project_id, user_email)
);

CREATE INDEX IF NOT EXISTS idx_project_collab_project ON project_collaborators(project_id);
CREATE INDEX IF NOT EXISTS idx_project_collab_email ON project_collaborators(user_email);
