import { CURRENT_USER } from "../constants/profile"
import { GameCard } from "../components/GameCard"
import { useApp } from "../state/AppState"
import type { Game, Phase } from "../types"
export function GamesScreen() {
  const { games, extras, joiningId, setOpenGameId, joinGame } = useApp()
  const mine = games.filter((game) => game.players.includes(CURRENT_USER))
  const groups: { phase: Phase; title: string; items: Game[] }[] = [
    { phase: "live", title: "Live now", items: [] },
    { phase: "upcoming", title: "Upcoming", items: [] },
    { phase: "completed", title: "Wrapped", items: [] },
  ]
  for (const game of mine) {
    const phase = extras[game.id]?.phase
    const group = groups.find((item) => item.phase === phase)
    if (group) group.items.push(game)
  }
  return (
    <div className="space-y-4 px-4 pb-5">
      {mine.length === 0 && (
        <p className="rounded-3xl bg-white p-4 text-sm text-[#1E1E1E]/65">Join a run from the lobby and it will land here with the checklist and team chat.</p>
      )}
      {groups.map((group) =>
        group.items.length === 0 ? null : (
          <section key={group.phase} className="space-y-2">
            <h2 className="font-display text-3xl uppercase leading-none">{group.title}</h2>
            {group.items.map((game) => {
              const extra = extras[game.id]
              if (!extra) return null
              return (
                <GameCard
                  key={game.id}
                  game={game}
                  extra={extra}
                  joining={joiningId === game.id}
                  onOpen={() => setOpenGameId(game.id)}
                  onJoin={() => void joinGame(game.id)}
                />
              )
            })}
          </section>
        ),
      )}
    </div>
  )
}