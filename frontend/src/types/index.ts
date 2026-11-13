export type Sport = "basketball" | "soccer"

/** Matches the API literal, including the backend spelling of intermediate. */
export type SkillLevel = "beginner" | "intermediete" | "advanced" | "all"

export type FormatId = "3v3" | "5v5" | "7v7" | "11v11"

export type Crowd = "open" | "moderate" | "full"

export type TabId = "explore" | "lobby" | "games" | "profile"

export type Phase = "upcoming" | "live" | "completed"

export type EndorsementLabel = "Great Sportsmanship" | "Match MVP"

export interface ApiGame {
  id: string
  sports: Sport
  location: string
  starttime: string
  maxplayers: number
  skilllevel: SkillLevel
  players: string[]
}

export interface Game extends ApiGame {
  source: "local" | "api"
}

export interface CreateGameBody {
  sports: Sport
  location: string
  starttime: string
  maxplayers: number
  skilllevel: SkillLevel
}

export interface EquipmentItem {
  id: string
  label: string
  claimedBy: string | null
}

export interface ChatMessage {
  id: string
  author: string
  text: string
  at: string
}

export interface GameExtras {
  format: FormatId
  venueId: string
  phase: Phase
  equipment: EquipmentItem[]
  messages: ChatMessage[]
}

export interface Venue {
  id: string
  name: string
  short: string
  detail: string
  area: string
  sports: Sport[]
  crowd: Crowd
  x: number
  y: number
  blurb: string
  lastReport: string | null
}

export interface PartyMember {
  name: string
  ready: boolean
}

export interface Party {
  name: string
  sports: Sport
  format: FormatId
  skilllevel: SkillLevel
  members: PartyMember[]
}

export interface QueueEntry {
  id: string
  sports: Sport
  format: FormatId
  skilllevel: SkillLevel
  names: string[]
  label: string
}

export interface Rotation {
  active: string
  onDeck: string[]
  previous: string | null
}

export interface Endorsement {
  id: string
  player: string
  label: EndorsementLabel
  gameLocation: string
}

export interface HostInput {
  sports: Sport
  format: FormatId
  skilllevel: SkillLevel
  venueId: string
  starttime: string
}

export interface Toast {
  id: string
  text: string
}
