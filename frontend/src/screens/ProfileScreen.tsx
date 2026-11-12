import { EndorsePanel } from "../components/EndorsePanel"
import { PlayerCard } from "../components/PlayerCard"
import { PROFILE, CURRENT_USER } from "../constants/profile"
import { useApp } from "../state/AppState"

export function ProfileScreen() {
  const { games, extras, endorsements } = useApp()
  const wrapped = games.find((game) => extras[game.id]?.phase === "completed" && game.players.includes(CURRENT_USER))

  return (
    <div className="space-y-4 px-4 pb-6">
      <PlayerCard />
      <p className="text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1E1E1E]/45">{PROFILE.season} card</p>

      <section>
        <h2 className="font-display text-3xl uppercase leading-none">Received</h2>
        <ul className="mt-2 space-y-2">
          {PROFILE.received.map((item) => (
            <li key={`${item.player}-${item.label}`} className="rounded-2xl bg-white px-3 py-3 text-sm">
              <span className="font-semibold">{item.label}</span>
              <span className="block text-xs text-[#1E1E1E]/55">from {item.player}</span>
            </li>
          ))}
        </ul>
      </section>

      {wrapped && <EndorsePanel game={wrapped} />}

      <section>
        <h2 className="font-display text-3xl uppercase leading-none">Sent</h2>
        {endorsements.length === 0 ? (
          <p className="mt-2 rounded-2xl bg-white px-3 py-3 text-sm text-[#1E1E1E]/60">Endorse a teammate from your wrapped Sunset Canyon run.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {endorsements.map((item) => (
              <li key={item.id} className="rounded-2xl bg-white px-3 py-3 text-sm">
                <span className="font-semibold">
                  {item.label} · {item.player}
                </span>
                <span className="block text-xs text-[#1E1E1E]/55">{item.gameLocation}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
