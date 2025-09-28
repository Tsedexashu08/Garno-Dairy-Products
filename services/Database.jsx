import { createClient } from '@supabase/supabase-js';

// Replace these with your actual values from Settings > API
const supabaseUrl = "https://bkphybpxesburcxnkfqt.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrcGh5YnB4ZXNidXJjeG5rZnF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0Nzg5MTYsImV4cCI6MjA3NDA1NDkxNn0.dZza66-p8fX7C4PSUXmb-GAJzS5aZrX5Q093uZhqi6I";

// Creating and exporting the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Prevents the client from parsing URLs for auth sessions
  },
});
