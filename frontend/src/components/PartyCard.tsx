import { Check, Plus, X } from "lucide-react"
import { FORMATS, SKILLS, skillLabel, teamSize } from "../constants/sports"
import { CURRENT_USER } from "../constants/profile"
import { useApp } from "../state/AppState"
import { SportIcon } from "./SportIcon"
import { Avatar, Button, Card, cx } from "./ui"
export function PartyCard() {
  const { party, toggleReady, setPartyName, setPartySkill, setPartyFormat, setPartySport, removeMember, setInviteOpen, queueParty, queueSolo } =
    useApp()
  const capacity = teamSize(party.format)
  const ready = party.members.filter((member) => member.ready).length
  const openSlots = Math.max(capacity - party.members.length, 0)
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2774AE]">Party</p>
          <input
            value={party.name}
            onChange={(event) => setPartyName(event.target.value)}
            className="mt-1 w-40 bg-transparent font-display text-3xl uppercase leading-none text-[#1E1E1E] outline-none"
            aria-label="Party name"
          />
        </div>
        <div className="rounded-2xl bg-[#FFD100] px-3 py-2 text-right">
          <p className="font-display text-3xl leading-none">
            {ready}/{capacity}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-wider">Ready</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        {(["basketball", "soccer"] as const).map((sport) => (
          <button
            key={sport}
            onClick={() => setPartySport(sport)}
            className={cx(
              "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold capitalize",
              party.sports === sport ? "bg-[#2774AE] text-white" : "bg-[#F4F6F8] text-[#1E1E1E]",
            )}
          >
            <SportIcon sport={sport} size={14} />
            {sport}
          </button>
        ))}
      </div>
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
        {FORMATS.filter((format) => format.sports === party.sports).map((format) => (
          <button
            key={format.id}
            onClick={() => setPartyFormat(format.id)}
            className={cx(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold",
              party.format === format.id ? "bg-[#1E1E1E] text-white" : "bg-[#F4F6F8]",
            )}
          >
            {format.label}
          </button>
        ))}
      </div>
      <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
        {SKILLS.map((skill) => (
          <button
            key={skill.value}
            onClick={() => setPartySkill(skill.value)}
            className={cx(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold",
              party.skilllevel === skill.value ? "bg-[#2774AE] text-white" : "bg-[#F4F6F8]",
            )}
          >
            {skill.label}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        {party.members.map((member) => (
          <div key={member.name} className="flex w-14 flex-col items-center gap-1">
            <button className="relative" onClick={() => toggleReady(member.name)} aria-label={`${member.ready ? "Unready" : "Ready"} ${member.name}`}>
              <Avatar name={member.name} size={48} />
              <span className={cx("absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full ring-2 ring-white", member.ready ? "bg-[#FFD100]" : "bg-white ring-black/10")}>
                {member.ready ? <Check size={12} /> : <span className="h-1.5 w-1.5 rounded-full bg-black/30" />}
              </span>
            </button>
            <span className="w-full truncate text-center text-[10px] font-medium">{member.name === CURRENT_USER ? "You" : member.name.split(" ")[0]}</span>
            {member.name !== CURRENT_USER && (
              <button className="text-[#1E1E1E]/40" aria-label={`Remove ${member.name}`} onClick={() => removeMember(member.name)}>
                <X size={12} />
              </button>
            )}
          </div>
        ))}
        {Array.from({ length: openSlots }).map((_, index) => (
          <button key={index} className="flex w-14 flex-col items-center gap-1" onClick={() => setInviteOpen(true)}>
            <span className="grid h-12 w-12 place-items-center rounded-full border border-dashed border-[#2774AE]/50 text-[#2774AE]">
              <Plus size={16} />
            </span>
            <span className="text-[10px] font-medium text-[#2774AE]">Invite</span>
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-[#1E1E1E]/55">
        {skillLabel(party.skilllevel)} · tap a portrait to toggle ready. Queue as a premade against another team.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button tone="gold" onClick={queueParty}>
          Queue party
        </Button>
        <Button tone="ghost" onClick={queueSolo}>
          Queue solo
        </Button>
      </div>
    </Card>
  )
}