import { FRIENDS } from "../constants/profile"
import { useApp } from "../state/AppState"
import { Avatar, Sheet } from "./ui"
export function InviteSheet() {
  const { party, invite, setInviteOpen } = useApp()
  const available = FRIENDS.filter((name) => !party.members.some((member) => member.name === name))
  return (
    <Sheet title="Invite" onClose={() => setInviteOpen(false)}>
      {available.length === 0 ? (
        <p className="text-sm text-[#1E1E1E]/60">Everyone on your list is already in the party.</p>
      ) : (
        <ul className="space-y-2">
          {available.map((name) => (
            <li key={name}>
              <button className="flex w-full items-center gap-3 rounded-2xl bg-white px-3 py-2 text-left" onClick={() => invite(name)}>
                <Avatar name={name} />
                <span className="text-sm font-semibold">{name}</span>
                <span className="ml-auto text-xs font-semibold text-[#2774AE]">Add</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  )
}