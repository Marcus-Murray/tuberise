-- Initialize Tuberise Analytics Database
-- This script runs when the PostgreSQL container starts

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for better performance
-- These will be created by Prisma migrations, but we can add some initial ones here

-- Set timezone
SET timezone = 'UTC';

-- Log initialization
\echo 'Tuberise Analytics database initialized successfully';
