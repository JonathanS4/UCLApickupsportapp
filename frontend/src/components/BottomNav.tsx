import { CalendarDays, Map, UserRound, Users } from "lucide-react"
import type { TabId } from "../types"
import { useApp } from "../state/AppState"
import { cx } from "./ui"
const TABS: { id: TabId; label: string; icon: typeof Map }[] = [
  { id: "explore", label: "Explore", icon: Map },
  { id: "lobby", label: "Lobby", icon: Users },
  { id: "games", label: "Games", icon: CalendarDays },
  { id: "profile", label: "Profile", icon: UserRound },
]
export function BottomNav() {
  const { tab, setTab, setOpenGameId } = useApp()
  return (
    <nav className="shrink-0 border-t border-black/5 bg-white px-2 pb-3 pt-2" aria-label="Primary">
      <div className="grid grid-cols-4">
        {TABS.map((item) => {
          const Icon = item.icon
          const active = tab === item.id
          return (
            <button
              key={item.id}
              className={cx("flex flex-col items-center gap-0.5 py-1 text-[11px] font-semibold", active ? "text-[#2774AE]" : "text-[#1E1E1E]/45")}
              onClick={() => {
                setOpenGameId(null)
                setTab(item.id)
              }}
            >
              <span className={cx("grid h-7 w-10 place-items-center rounded-full", active && "bg-[#FFD100]")}>
                <Icon size={18} />
              </span>
              {item.label}
            </button>
          )
        })}
      </div>
      <div className="mx-auto mt-1 h-1 w-24 rounded-full bg-black/15" />
    </nav>
  )
}