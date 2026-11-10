import { CURRENT_USER } from "../constants/profile"
import type { Game, GameExtras, Rotation } from "../types"
import { defaultExtras } from "../utils/format"
const WOODEN = "6f1c2a40-7b2e-4d1a-9c31-0a11b2c3d4e5"
const DRAKE = "7a2d3b51-8c3f-4e2b-8d42-1b22c3d4e5f6a7"
const HITCH = "8b3e4c62-9d40-4f3c-9e53-2c33d4e5f607b8"
const SUNSET = "9c4f5d73-ae51-405d-af64-3d44e5f60718c9"
function at(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
}
export function buildSeed(): { games: Game[]; extras: Record<string, GameExtras> } {
  const games: Game[] = [
    {
      id: HITCH,
      sports: "basketball",
      location: "Hitch Basketball Courts — Court 1",
      starttime: at(-0.4),
      maxplayers: 6,
      skilllevel: "advanced",
      players: ["Maya Chen", "Noah Kim", "Aisha Brooks", "Evan Cho", "Jordan Hale", "Chris Patel"],
      source: "local",
    },
    {
      id: DRAKE,
      sports: "soccer",
      location: "Drake Stadium — Field 1",
      starttime: at(1.5),
      maxplayers: 14,
      skilllevel: "beginner",
      players: [
        "Luis Ortega",
        "Priya Shah",
        "Noah Kim",
        "Aisha Brooks",
        "Evan Cho",
        "Sofia Reyes",
        "Jordan Hale",
        "Chris Patel",
        "Nina Volkov",
        "Owen Brooks",
        "Leah Park",
        "Sam Ortiz",
        "Diego Alvarez",
      ],
      source: "local",
    },
    {
      id: WOODEN,
      sports: "basketball",
      location: "John Wooden Center — Court 3",
      starttime: at(3),
      maxplayers: 10,
      skilllevel: "intermediete",
      players: ["Maya Chen", "Luis Ortega", "Priya Shah", "Noah Kim", "Aisha Brooks", "Evan Cho", "Sofia Reyes"],
      source: "local",
    },
    {
      id: SUNSET,
      sports: "soccer",
      location: "Sunset Canyon Rec Center — Field",
      starttime: at(-26),
      maxplayers: 14,
      skilllevel: "all",
      players: ["Maya Chen", "Sofia Reyes", "Jordan Hale", "Nina Volkov", "Diego Alvarez"],
      source: "local",
    },
  ]
  const extras: Record<string, GameExtras> = {}
  for (const game of games) extras[game.id] = defaultExtras(game)
  extras[HITCH] = {
    ...extras[HITCH],
    phase: "live",
    format: "3v3",
    venueId: "hitch",
    equipment: [
      { id: "ball", label: "Basketball", claimedBy: "Noah Kim" },
      { id: "pinnies", label: "Pinnies", claimedBy: null },
    ],
    messages: [
      { id: "m1", author: "Noah Kim", text: "Winners stay. Call your fouls clean.", at: at(-0.3) },
      { id: "m2", author: CURRENT_USER, text: "We're on Court 1. Next point is game.", at: at(-0.1) },
    ],
  }
  extras[DRAKE] = {
    ...extras[DRAKE],
    format: "7v7",
    venueId: "drake",
    equipment: [
      { id: "ball", label: "Soccer ball", claimedBy: null },
      { id: "pinnies", label: "Pinnies", claimedBy: "Sofia Reyes" },
      { id: "cones", label: "Cones", claimedBy: null },
    ],
    messages: [{ id: "m3", author: "Luis Ortega", text: "Need one more for a full 7. Kickoff on Field 1.", at: at(-0.2) }],
  }
  extras[WOODEN] = {
    ...extras[WOODEN],
    format: "5v5",
    venueId: "wooden",
    equipment: [
      { id: "ball", label: "Basketball", claimedBy: "Luis Ortega" },
      { id: "pinnies", label: "Pinnies", claimedBy: "Priya Shah" },
    ],
    messages: [
      { id: "m4", author: "Luis Ortega", text: "Court 3 opens at 6:15. I'll bring the ball.", at: at(-1) },
      { id: "m5", author: "Priya Shah", text: "Pinnies are in my bag. Intermediate pace.", at: at(-0.5) },
    ],
  }
  extras[SUNSET] = {
    ...extras[SUNSET],
    phase: "completed",
    format: "7v7",
    venueId: "sunset",
    equipment: [
      { id: "ball", label: "Soccer ball", claimedBy: "Jordan Hale" },
      { id: "pinnies", label: "Pinnies", claimedBy: "Sofia Reyes" },
      { id: "cones", label: "Cones", claimedBy: CURRENT_USER },
    ],
    messages: [{ id: "m6", author: "Sofia Reyes", text: "Good run. Endorse the people who kept it clean.", at: at(-25) }],
  }

  return { games, extras }
}
export const INITIAL_ROTATION: Record<string, Rotation> = {
  hitch: {
    active: "Gold Squad",
    onDeck: ["Navy Press", "De Neve 3", "Walk-up Run"],
    previous: null,
  },
  wooden: {
    active: "Court 3 Run",
    onDeck: ["Rec League", "Open Hoops"],
    previous: null,
  },
  drake: {
    active: "Westwood FC",
    onDeck: ["Sunset XI", "Sycamore Side"],
    previous: null,
  },
}