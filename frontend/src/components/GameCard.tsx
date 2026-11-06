import { skillLabel } from "../constants/sports"
import { CURRENT_USER } from "../constants/profile"
import type { Game, GameExtras } from "../types"
import { formatWhen } from "../utils/format"
import { spotsLeft } from "../utils/match"
import { SportIcon } from "./SportIcon"
import { Avatar, Button, cx } from "./ui"
export function GameCard({
  game,
  extra,
  joining,
  onOpen,
  onJoin,
}: {
  game: Game
  extra: GameExtras
  joining: boolean
  onOpen: () => void
  onJoin: () => void
}) {
  const mine = game.players.includes(CURRENT_USER)
  const full = spotsLeft(game) === 0
  const shown = game.players.slice(0, 4)
  const overflow = game.players.length - shown.length
  return (
    <article className="rounded-3xl bg-white p-4 shadow-[0_8px_24px_rgba(16,32,48,0.06)]">
      <button className="w-full text-left" onClick={onOpen}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[#2774AE]">
              <SportIcon sport={game.sports} />
              <span className="text-xs font-semibold uppercase tracking-[0.14em]">{extra.format}</span>
              {extra.phase === "live" && <span className="rounded-full bg-[#D92D20] px-2 py-0.5 text-[10px] font-bold text-white">LIVE</span>}
              {game.source === "api" && <span className="rounded-full bg-[#2774AE]/10 px-2 py-0.5 text-[10px] font-bold text-[#2774AE]">API</span>}
            </div>
            <h3 className="mt-1 text-[15px] font-semibold leading-snug text-[#1E1E1E]">{game.location}</h3>
            <p className="mt-1 text-xs text-[#1E1E1E]/60">
              {formatWhen(game.starttime)} · {skillLabel(game.skilllevel)}
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-3xl leading-none text-[#1E1E1E]">
              {game.players.length}
              <span className="text-lg text-[#1E1E1E]/40">/{game.maxplayers}</span>
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#1E1E1E]/45">{spotsLeft(game)} open</p>
          </div>
        </div>
        <div className="mt-3 flex items-center">
          {shown.map((name, index) => (
            <span key={name} className={cx(index > 0 && "-ml-2")} style={{ zIndex: 4 - index }}>
              <Avatar name={name} size={28} />
            </span>
          ))}
          {overflow > 0 && <span className="ml-2 text-xs font-semibold text-[#1E1E1E]/50">+{overflow}</span>}
        </div>
      </button>
      <Button className="mt-3 w-full" tone={mine ? "ghost" : "gold"} disabled={joining || (!mine && full)} onClick={mine ? onOpen : onJoin}>
        {joining ? "Joining…" : mine ? "View game" : full ? "Full" : "Join"}
      </Button>
    </article>
  )
}