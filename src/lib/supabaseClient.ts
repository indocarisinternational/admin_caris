import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pguedxstlfjohmhuxfbi.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndWVkeHN0bGZqb2htaHV4ZmJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4OTg0NjcsImV4cCI6MjA2MTQ3NDQ2N30.7IKBnrTYanycAMZRgkK4Yy4_D1Kbi5aVdHfYo0asWqk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
