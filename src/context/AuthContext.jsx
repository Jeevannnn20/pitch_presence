import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js'
import { flushOutbox, migrateAndSync } from '../lib/historyStore.js'

const AuthContext = createContext({
  session: null,
  user: null,
  loading: true,
  configured: false,
  signInWithEmail: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {}
})

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const lastUserId = useRef(null)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false)
      return undefined
    }

    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session ?? null)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession ?? null)
      const userId = nextSession?.user?.id ?? null

      // Run the anonymous->cloud merge once per sign-in transition (not on every token
      // refresh, which also fires SIGNED_IN with the same user).
      if (event === 'SIGNED_IN' && userId && userId !== lastUserId.current) {
        lastUserId.current = userId
        migrateAndSync(userId).catch((error) => console.warn('History sync failed:', error))
      }
      if (event === 'SIGNED_OUT') {
        lastUserId.current = null
      }
    })

    // Flush any queued cloud writes when connectivity returns.
    const onOnline = () => flushOutbox().catch(() => {})
    window.addEventListener('online', onOnline)

    return () => {
      active = false
      sub?.subscription?.unsubscribe?.()
      window.removeEventListener('online', onOnline)
    }
  }, [])

  const value = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : undefined
    return {
      session,
      user: session?.user ?? null,
      loading,
      configured: isSupabaseConfigured,
      signInWithEmail: async (email) => {
        if (!supabase) throw new Error('Cloud sync is not configured.')
        return supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: origin ? `${origin}/login` : undefined }
        })
      },
      signInWithGoogle: async () => {
        if (!supabase) throw new Error('Cloud sync is not configured.')
        return supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: origin ? `${origin}/login` : undefined }
        })
      },
      signOut: async () => {
        if (!supabase) return
        await supabase.auth.signOut()
      }
    }
  }, [session, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
