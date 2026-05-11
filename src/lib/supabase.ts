import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kbopqzhfckbhkumiinmk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtib3BxemhmY2tiaGt1bWlpbm1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4Nzc3ODAsImV4cCI6MjA5MzQ1Mzc4MH0.fklxNFN7hzi8mzIWCfUva4qBK_-ROKn-HGCoFscoA5w';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const STORAGE_URL = SUPABASE_URL + '/storage/v1/object/public/images';
