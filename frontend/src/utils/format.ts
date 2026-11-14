import { inferFormat } from "../constants/sports"
import { venueIdFromLocation } from "../constants/venues"
import type { ApiGame, EquipmentItem, GameExtras, Sport } from "../types"

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

const AVATAR_COLORS = ["#2774AE", "#1E1E1E", "#8A6A00", "#0E6B4F", "#7A2E0E", "#3E4C8A", "#6B3FA0"]

export function colorFor(name: string) {
  let hash = 0
  for (const char of name) hash = (hash + char.charCodeAt(0)) % AVATAR_COLORS.length
  return AVATAR_COLORS[hash]
}

export function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Los_Angeles",
  })
}

export function clockLabel(date: Date) {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

export function defaultEquipment(sports: Sport): EquipmentItem[] {
  if (sports === "basketball") {
    return [
      { id: "ball", label: "Basketball", claimedBy: null },
      { id: "pinnies", label: "Pinnies", claimedBy: null },
    ]
  }
  return [
    { id: "ball", label: "Soccer ball", claimedBy: null },
    { id: "pinnies", label: "Pinnies", claimedBy: null },
    { id: "cones", label: "Cones", claimedBy: null },
  ]
}

export function defaultExtras(game: ApiGame): GameExtras {
  return {
    format: inferFormat(game.sports, game.maxplayers),
    venueId: venueIdFromLocation(game.location),
    phase: "upcoming",
    equipment: defaultEquipment(game.sports),
    messages: [],
  }
}

export function detailText(detail: unknown) {
  if (typeof detail === "string") return detail
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (item && typeof item === "object" && "msg" in item) return String(item.msg)
        return JSON.stringify(item)
      })
      .join(", ")
  }
  return "Request failed"
}