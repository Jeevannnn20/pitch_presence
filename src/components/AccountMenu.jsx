import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// Compact top-right account control dropped into each page header. Signed out -> a
// "Sign in to sync" link; signed in -> email + a small menu with "Synced" and Sign out.
export default function AccountMenu() {
  const { user, loading, configured, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  // Hide entirely when cloud sync isn't configured — nothing to sign into.
  if (!configured || loading) return null

  if (!user) {
    return (
      <Link
        to="/login"
        className="rounded-full border border-white/15 bg-white/[0.05] px-3.5 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/[0.1]"
      >
        Sign in to sync
      </Link>
    )
  }

  const label = user.email || 'Account'
  const initial = (user.email || '?').charAt(0).toUpperCase()

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-2 py-1 pr-3 text-xs font-semibold text-white/80 transition hover:bg-white/[0.1]"
      >
        <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
          {initial}
        </span>
        <span className="hidden max-w-[140px] truncate sm:inline">{label}</span>
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-56 rounded-2xl border border-white/10 bg-[#0d0d10] p-3 shadow-[0_22px_70px_rgba(0,0,0,0.5)]">
          <p className="truncate px-1 text-xs text-white/50">{label}</p>
          <p className="mt-1 flex items-center gap-1.5 px-1 text-xs text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Synced across devices
          </p>
          <button
            type="button"
            onClick={async () => {
              setOpen(false)
              await signOut()
            }}
            className="mt-3 w-full rounded-xl border border-white/10 px-3 py-2 text-left text-xs font-semibold text-white/80 transition hover:bg-white/[0.06]"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
