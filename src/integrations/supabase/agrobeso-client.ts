import { createClient } from '@supabase/supabase-js';

const AGROBESO_SUPABASE_URL = 'https://lsgxrluiwsxuhsjcvdue.supabase.co';
const AGROBESO_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzZ3hybHVpd3N4dWhzamN2ZHVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MjU4MjYsImV4cCI6MjA5MzMwMTgyNn0.xayovLKFIoeRkRLWXGrXURVT-Vb2M3kinrAGhBllHJw';

export const agrobesoSupabase = createClient(AGROBESO_SUPABASE_URL, AGROBESO_SUPABASE_ANON_KEY);

export const AGROBESO_STORAGE_URL = `${AGROBESO_SUPABASE_URL}/storage/v1/object/public/images`;
