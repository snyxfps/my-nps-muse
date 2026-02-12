import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tpmdlmknpshsaoktdwmg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwbWRsbWtucHNoc2Fva3Rkd21nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwOTg0MDYsImV4cCI6MjA4NDY3NDQwNn0._PWlZ7uFPDVjywrwhD8UqXKGQ2vPRY_M6JVq0pc9tIw";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
