import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://besduqzpcmdtpflmrgim.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc2R1cXpwY21kdHBmbG1yZ2ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4OTgxNDcsImV4cCI6MjA4NjQ3NDE0N30.NHMpUON-aBu0X7-yDyrNlPtPzylb-eg2eDhKFUbiOWI";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
