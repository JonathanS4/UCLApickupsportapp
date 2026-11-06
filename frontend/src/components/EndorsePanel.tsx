import { CURRENT_USER } from "../constants/profile"
import { useApp } from "../state/AppState"
import type { EndorsementLabel, Game } from "../types"
import { Button } from "./ui"
const LABELS: EndorsementLabel[] = ["Great Sportsmanship", "Match MVP"]
export function EndorsePanel({ game }: { game: Game }) {
  const { endorsements, endorse } = useApp()
  const teammates = game.players.filter((name) => name !== CURRENT_USER)
  if (teammates.length === 0) return null
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2774AE]">Post-game</p>
        <h3 className="font-display text-2xl uppercase leading-none">Endorse teammates</h3>
        <p className="mt-1 text-xs text-[#1E1E1E]/55">{game.location}</p>
      </div>
      {teammates.map((name) => (
        <div key={name} className="rounded-2xl bg-white p-3">
          <p className="text-sm font-semibold">{name}</p>
          <div className="mt-2 grid grid-cols-1 gap-2">
            {LABELS.map((label) => {
              const given = endorsements.some((item) => item.player === name && item.label === label && item.gameLocation === game.location)
              return (
                <Button key={label} tone={given ? "ink" : "ghost"} className="w-full py-2 text-xs" onClick={() => endorse(name, label, game.location)} disabled={given}>
                  {given ? `${label} sent` : label}
                </Button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}