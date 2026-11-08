import { useEffect, useState, type ReactNode } from "react"
import { CURRENT_USER } from "../constants/profile"
import { useApp } from "../state/AppState"
import { clockLabel } from "../utils/format"
import { BottomNav } from "./BottomNav"
import { Avatar } from "./ui"
export function PhoneFrame({ children, overlay }: { children: ReactNode; overlay?: ReactNode }) {
  const { openGameId } = useApp()
  const [time, setTime] = useState(() => clockLabel(new Date()))
  useEffect(() => {
    const id = window.setInterval(() => setTime(clockLabel(new Date())), 30000)
    return () => window.clearInterval(id)
  }, [])
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0c1b27] p-3 sm:p-6">
      <div className="relative flex h-[min(844px,calc(100dvh-1.5rem))] w-[min(390px,100%)] flex-col overflow-hidden rounded-[36px] border-[10px] border-[#1E1E1E] bg-[#F4F6F8] shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
        <div className="flex items-center justify-between px-6 pb-1 pt-3 text-[12px] font-semibold text-[#1E1E1E]">
          <span>{time}</span>
          <span className="text-[10px] tracking-[0.18em] text-[#1E1E1E]/70">UCLA</span>
        </div>
        <Header />
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        {openGameId ? <div className="h-3 shrink-0" /> : <BottomNav />}
        {overlay}
        <Toasts />
      </div>
    </div>
  )
}
function Header() {
  const { openGameId, tab, apiOnline } = useApp()
  if (openGameId) return null
  const subtitle =
    tab === "explore" ? "Campus courts" : tab === "lobby" ? "Find a run" : tab === "games" ? "Your games" : "Player card"
  const dot = apiOnline === null ? "#C89600" : apiOnline ? "#1F9D55" : "#98A2B3"
  const status = apiOnline ? "Pickup API connected" : apiOnline === false ? "Pickup API offline" : "Checking pickup API"
  return (
    <div className="flex items-center justify-between px-4 pb-3 pt-1">
      <div>
        <p className="font-display text-[30px] leading-none tracking-[0.04em] text-[#2774AE]">BRUINPLAY</p>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1E1E1E]/55">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: dot }} title={status} />
        <Avatar name={CURRENT_USER} size={36} />
      </div>
    </div>
  )
}
function Toasts() {
  const { toasts } = useApp()
  if (toasts.length === 0) return null
  return (
    <div className="pointer-events-none absolute left-3 right-3 top-14 z-40 space-y-2">
      {toasts.map((item) => (
        <div key={item.id} className="rounded-2xl bg-[#1E1E1E] px-3 py-2 text-sm font-medium text-white shadow-lg">
          {item.text}
        </div>
      ))}
    </div>
  )
}