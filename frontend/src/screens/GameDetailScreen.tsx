import { useEffect, useRef, useState } from "react"
import { ChevronLeft, Send } from "lucide-react"
import { EndorsePanel } from "../components/EndorsePanel"
import { Avatar, Button } from "../components/ui"
import { skillLabel, teamSize } from "../constants/sports"
import { CURRENT_USER } from "../constants/profile"
import { useApp } from "../state/AppState"
import { formatWhen } from "../utils/format"
import { spotsLeft } from "../utils/match"
export function GameDetailScreen() {
  const app = useApp()
  const game = app.games.find((item) => item.id === app.openGameId)
  const extra = game ? app.extras[game.id] : undefined
  const [draft, setDraft] = useState("")
  const chatRef = useRef<HTMLDivElement>(null)
  const messageCount = extra?.messages.length ?? 0
  useEffect(() => {
    const node = chatRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [messageCount])
  if (!game || !extra) {
    return (
      <div className="px-4">
        <button className="text-sm font-semibold text-[#2774AE]" onClick={() => app.setOpenGameId(null)}>
          Back
        </button>
        <p className="mt-4 text-sm">That game is no longer on the board.</p>
      </div>
    )
  }
  const mine = game.players.includes(CURRENT_USER)
  const readyParty = app.party.members.filter((member) => member.ready).map((member) => member.name)
  const incoming = readyParty.filter((name) => !game.players.includes(name))
  const canBring = app.party.sports === game.sports && incoming.length > 0 && extra.phase !== "completed" && spotsLeft(game) >= incoming.length
  return (
    <div className="space-y-3 px-4 pb-6">
      <button className="inline-flex items-center gap-1 text-sm font-semibold text-[#2774AE]" onClick={() => app.setOpenGameId(null)}>
        <ChevronLeft size={16} />
        Games
      </button>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2774AE]">
          {extra.format} · {skillLabel(game.skilllevel)}
          {extra.phase === "live" ? " · Live" : extra.phase === "completed" ? " · Wrapped" : ""}
          {game.source === "api" ? " · API" : ""}
        </p>
        <h1 className="mt-1 text-xl font-semibold leading-tight">{game.location}</h1>
        <p className="mt-1 text-sm text-[#1E1E1E]/60">
          {formatWhen(game.starttime)} · {game.players.length}/{game.maxplayers} players
        </p>
      </div>
      <section className="rounded-3xl bg-white p-4">
        <h2 className="text-sm font-semibold">Attending</h2>
        <ul className="mt-3 space-y-2">
          {game.players.map((name) => (
            <li key={name} className="flex items-center gap-3">
              <Avatar name={name} />
              <span className="text-sm font-semibold">{name === CURRENT_USER ? `${name} · You` : name}</span>
            </li>
          ))}
        </ul>
        {!mine && extra.phase !== "completed" && (
          <Button className="mt-3 w-full" tone="gold" disabled={app.joiningId === game.id || spotsLeft(game) === 0} onClick={() => void app.joinGame(game.id)}>
            {spotsLeft(game) === 0 ? "Full" : "Join this game"}
          </Button>
        )}
        {canBring && (
          <Button className="mt-2 w-full" tone="blue" disabled={app.joiningId === game.id} onClick={() => void app.joinGame(game.id, incoming)}>
            Bring party ({incoming.length}/{teamSize(app.party.format)} ready not in yet)
          </Button>
        )}
        {mine && (
          <Button className="mt-2 w-full" tone="ghost" onClick={() => app.leaveGame(game.id)}>
            Leave game
          </Button>
        )}
      </section>
      <section className="rounded-3xl bg-white p-4">
        <h2 className="text-sm font-semibold">Who has a ball / pinnies?</h2>
        <ul className="mt-3 space-y-2">
          {extra.equipment.map((item) => {
            const mineItem = item.claimedBy === CURRENT_USER
            return (
              <li key={item.id}>
                <button
                  className="flex w-full items-center gap-3 rounded-2xl bg-[#F4F6F8] px-3 py-3 text-left"
                  onClick={() => app.toggleEquipment(game.id, item.id)}
                >
                  <span className={`grid h-5 w-5 place-items-center rounded-md border ${mineItem ? "border-[#2774AE] bg-[#2774AE] text-white" : "border-black/20 bg-white"}`}>
                    {mineItem ? "✓" : ""}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{item.label}</span>
                    <span className="block text-xs text-[#1E1E1E]/55">
                      {item.claimedBy ? (mineItem ? "You're bringing it" : `${item.claimedBy} has it`) : "Unclaimed"}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>
      <section className="rounded-3xl bg-white p-4"></section>
              <h2 className="text-sm font-semibold">Team chat</h2>
        <div ref={chatRef} className="mt-3 max-h-48 space-y-2 overflow-y-auto">
          {extra.messages.map((message) => {
            const mineMessage = message.author === CURRENT_USER
            return (
              <div key={message.id} className={`flex ${mineMessage ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${mineMessage ? "bg-[#2774AE] text-white" : "bg-[#F4F6F8]"}`}>
                  {!mineMessage && <p className="text-[10px] font-bold uppercase tracking-wider text-[#2774AE]">{message.author}</p>}
                  <p>{message.text}</p>
                </div>
              </div>
            )
          })}
        </div>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            app.sendMessage(game.id, draft)
            setDraft("")
          }}
        >
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Message the run"
            className="min-w-0 flex-1 rounded-2xl bg-[#F4F6F8] px-3 py-3 text-sm outline-none ring-1 ring-black/5"
          />
          <button className="grid h-12 w-12 place-items-center rounded-2xl bg-[#FFD100]" aria-label="Send" type="submit">
            <Send size={16} />
          </button>
        </form>
      </section>
      {extra.phase === "completed" && <EndorsePanel game={game} />}
    </div>
  )
}
