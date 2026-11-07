import { useMemo, useState } from "react"
import { FORMATS, SKILLS } from "../constants/sports"
import { useApp } from "../state/AppState"
import type { FormatId, SkillLevel, Sport } from "../types"
import { formatWhen } from "../utils/format"
import { Button, Chip, Sheet } from "./ui"
export function HostSheet() {
  const { venues, sportFilter, skillFilter, hostGame, hosting, setHostOpen } = useApp()
  const [sports, setSports] = useState<Sport>(sportFilter === "soccer" ? "soccer" : "basketball")
  const [format, setFormat] = useState<FormatId>(sports === "soccer" ? "7v7" : "5v5")
  const [skill, setSkill] = useState<SkillLevel>(skillFilter === "all" ? "intermediete" : skillFilter)
  const [venueId, setVenueId] = useState(venues.find((venue) => venue.sports.includes(sports))?.id ?? "wooden")
  const [when, setWhen] = useState(0)
  const presets = useMemo(() => {
    const soon = new Date(Date.now() + 45 * 60 * 1000)
    const evening = nextAt(19, 30)
    const afternoon = nextAt(16, 0)
    return [
      { label: "In 45 min", iso: soon.toISOString() },
      evening,
      afternoon,
    ]
  }, [])
  function chooseSport(next: Sport) {
    setSports(next)
    const nextFormat: FormatId = next === "basketball" ? "5v5" : "7v7"
    setFormat(nextFormat)
    const venue = venues.find((item) => item.sports.includes(next))
    if (venue) setVenueId(venue.id)
  }
  const choices = venues.filter((venue) => venue.sports.includes(sports))
  return (
    <Sheet title="Host a game" onClose={() => setHostOpen(false)}>
      <p className="mb-3 text-xs text-[#1E1E1E]/60">Posts to the UCLA Pickup Sports API. Basketball caps at 10, soccer at 22.</p>
      <div className="flex gap-2">
        {(["basketball", "soccer"] as const).map((sport) => (
          <Chip key={sport} active={sports === sport} onClick={() => chooseSport(sport)}>
            <span className="capitalize">{sport}</span>
          </Chip>
        ))}
      </div>
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
        {FORMATS.filter((item) => item.sports === sports).map((item) => (
          <Chip key={item.id} active={format === item.id} onClick={() => setFormat(item.id)}>
            {item.label}
          </Chip>
        ))}
      </div>
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
        {SKILLS.map((item) => (
          <Chip key={item.value} active={skill === item.value} onClick={() => setSkill(item.value)}>
            {item.label}
          </Chip>
        ))}
      </div>
      <div className="mt-3 space-y-2">
        {choices.map((venue) => (
          <button
            key={venue.id}
            onClick={() => setVenueId(venue.id)}
            className={`block w-full rounded-2xl px-3 py-2 text-left text-sm ${venueId === venue.id ? "bg-[#2774AE] text-white" : "bg-white"}`}
          >
            <span className="font-semibold">{venue.name}</span>
            <span className="mt-0.5 block text-xs opacity-70">
              {venue.detail} · {venue.area}
            </span>
          </button>
        ))}
      </div>
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
        {presets.map((preset, index) => (
          <Chip key={preset.label} active={when === index} onClick={() => setWhen(index)}>
            {preset.label}
            <span className="sr-only">{formatWhen(preset.iso)}</span>
          </Chip>
        ))}
      </div>
      <Button
        className="mt-4 w-full"
        tone="gold"
        disabled={hosting}
        onClick={() =>
          void hostGame({
            sports,
            format,
            skilllevel: skill,
            venueId,
            starttime: presets[when].iso,
          })
        }
      >
        {hosting ? "Posting…" : "Post game"}
      </Button>
    </Sheet>
  )
}
function nextAt(hour: number, minute: number) {
  const date = new Date()
  date.setHours(hour, minute, 0, 0)
  let prefix = "Today"
  if (date.getTime() < Date.now() + 20 * 60 * 1000) {
    date.setDate(date.getDate() + 1)
    prefix = "Tomorrow"
  }
  const h = hour > 12 ? hour - 12 : hour
  const m = minute.toString().padStart(2, "0")
  return { label: `${prefix} ${h}:${m} PM`, iso: date.toISOString() }
}