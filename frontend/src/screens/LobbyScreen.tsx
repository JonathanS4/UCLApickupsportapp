import { FORMATS, SKILLS, skillLabel } from "../constants/sports"
import { CURRENT_USER } from "../constants/profile"
import { GameCard } from "../components/GameCard"
import { PartyCard } from "../components/PartyCard"
import { Button, Chip, cx } from "../components/ui"
import { useApp } from "../state/AppState"
import { formatWhen } from "../utils/format"
import { filterGames, spotsLeft } from "../utils/match"

export function LobbyScreen() {
  const app = useApp()
  const visible = filterGames(app.games, app.extras, {
    sports: app.sportFilter,
    skill: app.skillFilter,
    format: app.formatFilter,
  })
  const urgent = visible.find((game) => spotsLeft(game) === 1 && !game.players.includes(CURRENT_USER))
  const formats = FORMATS.filter((format) => app.sportFilter === "all" || format.sports === app.sportFilter)
  const featuredId = app.sportFilter === "soccer" ? "drake" : "hitch"
  const featured = app.venues.find((venue) => venue.id === featuredId)
  const rotation = app.rotation[featuredId]
  const label = app.deckLabel()
  const onDeck = rotation?.onDeck.includes(label)

  return (
    <div className="space-y-3 px-4 pb-5">
      <div className="flex items-center justify-between text-xs">
        <p className="font-medium text-[#1E1E1E]/60">
          {app.apiOnline === null && "Checking the pickup API…"}
          {app.apiOnline === true && "Pickup API connected"}
          {app.apiOnline === false && "Pickup API offline — campus games stay on this phone"}
        </p>
        <button className="font-semibold text-[#2774AE]" onClick={() => void app.refresh()}>
          Sync
        </button>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        <Chip active={app.sportFilter === "all"} onClick={() => app.setSportFilter("all")}>
          All sports
        </Chip>
        <Chip active={app.sportFilter === "basketball"} onClick={() => app.setSportFilter("basketball")}>
          Basketball
        </Chip>
        <Chip active={app.sportFilter === "soccer"} onClick={() => app.setSportFilter("soccer")}>
          Soccer
        </Chip>
      </div>
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        <Chip active={app.skillFilter === "all"} onClick={() => app.setSkillFilter("all")}>
          All skills
        </Chip>
        {SKILLS.filter((skill) => skill.value !== "all").map((skill) => (
          <Chip key={skill.value} active={app.skillFilter === skill.value} onClick={() => app.setSkillFilter(skill.value)}>
            {skill.label}
          </Chip>
        ))}
      </div>
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        <Chip active={app.formatFilter === "all"} onClick={() => app.setFormatFilter("all")}>
          Any format
        </Chip>
        {formats.map((format) => (
          <Chip key={format.id} active={app.formatFilter === format.id} onClick={() => app.setFormatFilter(format.id)}>
            {format.label}
          </Chip>
        ))}
      </div>

      {urgent && app.extras[urgent.id] && (
        <button
          className="w-full rounded-3xl bg-[#FFD100] p-4 text-left shadow-sm"
          onClick={() => void app.joinGame(urgent.id)}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.16em]">Need +1 nearby</p>
          <p className="mt-1 text-base font-semibold">{urgent.location}</p>
          <p className="text-xs">
            {app.extras[urgent.id].format} · {skillLabel(urgent.skilllevel)} · {formatWhen(urgent.starttime)} · {urgent.players.length}/
            {urgent.maxplayers}
          </p>
          <span className="mt-2 inline-block rounded-full bg-[#1E1E1E] px-3 py-1 text-xs font-semibold text-white">I'm in</span>
        </button>
      )}

      <PartyCard />

      {app.queue.map((entry) => (
        <div key={entry.id} className="flex items-center justify-between rounded-3xl bg-white px-4 py-3 shadow-sm">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#2774AE]">Your queue</p>
            <p className="text-sm font-semibold">
              {entry.label} · {entry.format} · {skillLabel(entry.skilllevel)}
            </p>
            <p className="text-xs text-[#1E1E1E]/55">{entry.names.length} player{entry.names.length === 1 ? "" : "s"} looking</p>
          </div>
          <button className="text-sm font-semibold text-[#D92D20]" onClick={() => app.leaveQueue(entry.id)}>
            Leave
          </button>
        </div>
      ))}

      {featured && rotation && (
        <section className="rounded-3xl bg-[#1E1E1E] p-4 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#FFD100]">King of the court</p>
          <h2 className="mt-1 font-display text-3xl uppercase leading-none">{featured.short}</h2>
          <p className="text-xs text-white/60">
            {featured.name} · {featured.detail}
          </p>
          <div className="mt-3 rounded-2xl bg-white/10 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#FFD100]">On the court</p>
            <p className="font-display text-2xl uppercase">{rotation.active}</p>
          </div>
          <ol className="mt-3 space-y-2">
            {rotation.onDeck.map((team, index) => (
              <li key={team} className="flex items-center gap-3 text-sm">
                <span className={cx("grid h-6 w-6 place-items-center rounded-full text-xs font-bold", index === 0 ? "bg-[#FFD100] text-[#1E1E1E]" : "bg-white/10")}>
                  {index + 1}
                </span>
                <span className="font-semibold">{team}</span>
                {index === 0 && <span className="text-[10px] uppercase tracking-wider text-white/50">Next up</span>}
              </li>
            ))}
            {rotation.onDeck.length === 0 && <li className="text-sm text-white/60">On deck is empty.</li>}
          </ol>
          {rotation.previous && <p className="mt-2 text-xs text-white/50">Last on court: {rotation.previous}</p>}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button tone="gold" onClick={() => (onDeck ? app.leaveDeck(featuredId) : app.joinDeck(featuredId))}>
              {onDeck ? "Leave deck" : "Join on deck"}
            </Button>
            <Button tone="ghost" className="bg-white" onClick={() => app.rotateCourt(featuredId)}>
              Game over
            </Button>
          </div>
        </section>
      )}

      <div className="flex items-end justify-between">
        <h2 className="font-display text-3xl uppercase leading-none">Open games</h2>
        <span className="text-xs font-semibold text-[#1E1E1E]/45">{visible.length}</span>
      </div>
      {visible.length === 0 && <p className="rounded-3xl bg-white p-4 text-sm text-[#1E1E1E]/60">No runs match these filters.</p>}
      {visible.map((game) => {
        const extra = app.extras[game.id]
        if (!extra) return null
        return (
          <GameCard
            key={game.id}
            game={game}
            extra={extra}
            joining={app.joiningId === game.id}
            onOpen={() => app.setOpenGameId(game.id)}
            onJoin={() => void app.joinGame(game.id)}
          />
        )
      })}
      <Button className="w-full" onClick={() => app.setHostOpen(true)}>
        Host a game
      </Button>
    </div>
  )
}
