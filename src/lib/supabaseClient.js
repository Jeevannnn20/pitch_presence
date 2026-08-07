import { createClient } from '@supabase/supabase-js'

// These two values are CLIENT-SAFE to expose in the bundle: the security boundary is
// Supabase Row Level Security (see supabase/migrations/0001_attempts.sql), not secrecy of
// the anon key. Do NOT apply this reasoning to the OpenRouter key — that one is a bearer
// secret and lives only in the serverless function (api/debrief.js).
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY

// When env vars are absent (e.g. local dev without Supabase configured), we export null so
// the app runs in anonymous local-only mode instead of crashing. Callers must null-check.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        detectSessionInUrl: true,
        autoRefreshToken: true
      }
    })
  : null
