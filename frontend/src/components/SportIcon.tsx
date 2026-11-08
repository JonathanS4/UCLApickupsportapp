import type { Sport } from "../types"
export function SportIcon({ sport, size = 16 }: { sport: Sport; size?: number }) {
  if (sport === "basketball") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 3v18M3 12h18M6 6c3 2 3 10 0 12M18 6c-3 2-3 10 0 12" fill="none" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    )
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 3l3 6-3 3-3-3 3-6zm0 9l5 2-2 6H9l-2-6 5-2z" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}