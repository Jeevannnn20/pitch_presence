import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function LoginPage() {
  const { user, loading, configured, signInWithEmail, signInWithGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [message, setMessage] = useState('')

  if (!loading && user) {
    return <Navigate to="/history" replace />
  }

  async function handleEmailSubmit(event) {
    event.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return
    setStatus('sending')
    setMessage('')
    try {
      const { error } = await signInWithEmail(trimmed)
      if (error) throw error
      setStatus('sent')
      setMessage(`We sent a magic sign-in link to ${trimmed}. Open it on this device to finish.`)
    } catch (error) {
      setStatus('error')
      setMessage(error?.message || 'Could not send the sign-in link. Try again.')
    }
  }

  async function handleGoogle() {
    setStatus('sending')
    setMessage('')
    try {
      const { error } = await signInWithGoogle()
      if (error) throw error
      // On success the browser redirects to Google, so nothing else runs here.
    } catch (error) {
      setStatus('error')
      setMessage(error?.message || 'Could not start Google sign-in.')
    }
  }

  return (
    <div className="pp-page min-h-screen px-4 py-16">
      <div className="mx-auto w-full max-w-md">
        <Link to="/record" className="text-sm text-white/50 hover:text-white/80">
          ← Back to practice
        </Link>

        <div className="pp-glass mt-6 rounded-[28px] p-8">
          <p className="pp-label">Sync your progress</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-white">Sign in to Pitch Presence</h1>
          <p className="mt-3 text-sm leading-6 text-white/60">
            Practice works fine without an account — signing in just backs up your history and
            syncs it across your devices.
          </p>

          {!configured ? (
            <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-200/90">
              Cloud sync isn’t configured for this deployment yet. Your attempts are still saved
              locally in this browser.
            </div>
          ) : (
            <>
              <form onSubmit={handleEmailSubmit} className="mt-7 space-y-3">
                <label className="block text-sm font-medium text-white/70" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-60"
                >
                  {status === 'sending' ? 'Sending…' : 'Email me a magic link'}
                </button>
              </form>

              <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-white/30">
                <span className="h-px flex-1 bg-white/10" />
                or
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <button
                type="button"
                onClick={handleGoogle}
                disabled={status === 'sending'}
                className="w-full rounded-2xl border border-white/15 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.09] disabled:opacity-60"
              >
                Continue with Google
              </button>
            </>
          )}

          {message && (
            <p className={`mt-5 text-sm ${status === 'error' ? 'text-red-300' : 'text-emerald-300'}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
