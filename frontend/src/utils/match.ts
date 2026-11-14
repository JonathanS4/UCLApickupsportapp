import type { Game, GameExtras, SkillLevel, Sport } from "../types"
export function filterGames(
  games: Game[],
  extras: Record<string, GameExtras>,
  filters: { sports: Sport | "all"; skill: SkillLevel | "all"; format: string | "all" },
) {
  return games
    .filter((game) => {
      const extra = extras[game.id]
      if (!extra || extra.phase === "completed") return false
      if (filters.sports !== "all" && game.sports !== filters.sports) return false
      if (filters.format !== "all" && extra.format !== filters.format) return false
      if (filters.skill !== "all" && game.skilllevel !== "all" && game.skilllevel !== filters.skill) return false
      return true
    })
    .sort((a, b) => +new Date(a.starttime) - +new Date(b.starttime))
}
export function spotsLeft(game: Game) {
  return Math.max(game.maxplayers - game.players.length, 0)
}