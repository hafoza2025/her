import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pdvpsaxlsykdyrhmpems.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkdnBzYXhsc3lrZHlyaG1wZW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MTg0MTUsImV4cCI6MjA3OTM5NDQxNX0.4bmLYuvxHgnVXipN8doyLFt3XZbi37vroHmMY_vKuSM';

export const supabase = createClient(supabaseUrl, supabaseKey);
