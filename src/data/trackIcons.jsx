// SVG icons for interview tracks, keyed by the `iconKey` in src/data/trackMeta.js.
// Kept separate from trackMeta.js (which stays pure data so the seed script can import it).

export const trackIcons = {
  startup: (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path d="M12 3c3.2 1.7 5 4.4 5 8l3 3-4 1-1 4-3-3c-3.6 0-6.3-1.8-8-5 3.2-.4 5.6-2.8 6-6l2-2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M14 8.5h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  case: (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path d="M9 7V5.8C9 4.8 9.8 4 10.8 4h2.4c1 0 1.8.8 1.8 1.8V7" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5 7h14v11.5c0 .8-.7 1.5-1.5 1.5h-11c-.8 0-1.5-.7-1.5-1.5V7Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5 12h14M10 12v1h4v-1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
  tech: (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path d="m9 7-5 5 5 5M15 7l5 5-5 5M13 5l-2 14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  product: (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path d="M4 7.5 12 3l8 4.5-8 4.5L4 7.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M4 12.5 12 17l8-4.5M4 17.5 12 22l8-4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  software: (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path d="M7 8h10M7 12h7M7 16h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M5.5 3.5h13c.8 0 1.5.7 1.5 1.5v14c0 .8-.7 1.5-1.5 1.5h-13c-.8 0-1.5-.7-1.5-1.5V5c0-.8.7-1.5 1.5-1.5Z" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  dsa: (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M8.5 7h7M7 8.5v7M8.5 17h7M17 8.5v7M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  devrel: (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path d="M8 9.5 5.5 12 8 14.5M16 9.5l2.5 2.5-2.5 2.5M13.5 7 10.5 17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 4h16v16H4V4Z" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  campus: (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path d="M4 20V7l8-3.5L20 7v13M4 20h16" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9 20v-4h6v4M9 9.5h.01M15 9.5h.01M9 13h.01M15 13h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
  hr: (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path d="M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
  admissions: (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path d="M3 9l9-4 9 4-9 4-9-4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M7 11v4c0 1.2 2.2 2.5 5 2.5s5-1.3 5-2.5v-4M21 9v5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  sales: (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path d="M4 19h16M6 16l4-4 3 3 5-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 8h3v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Fallback icon key when a track's iconKey is missing from the map.
export const FALLBACK_ICON_KEY = 'tech'
