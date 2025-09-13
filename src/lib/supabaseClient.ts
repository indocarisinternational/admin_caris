import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ifirjnpamdtfbbeqqktp.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmaXJqbnBhbWR0ZmJiZXFxa3RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NzQ2MTgsImV4cCI6MjA3MzE1MDYxOH0.Phjq0XtygevmmET2HnaIkQFN2zxPPpBPe1CSP-bonf8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
