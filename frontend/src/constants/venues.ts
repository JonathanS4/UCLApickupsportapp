import type { Crowd, Venue } from "../types"
export const CROWD: Record<Crowd, { label: string; dot: string; meter: number }> = {
  open: { label: "Open / Low Crowd", dot: "#1F9D55", meter: 28 },
  moderate: { label: "Moderate / Half Courts Busy", dot: "#C89600", meter: 62 },
  full: { label: "Full / Heavy Rotation", dot: "#D92D20", meter: 94 },
}
export const VENUES: Venue[] = [
  {
    id: "wooden",
    name: "John Wooden Center",
    short: "Wooden",
    detail: "Court 3",
    area: "Central campus",
    sports: ["basketball"],
    crowd: "moderate",
    x: 58,
    y: 48,
    blurb: "Indoor runs. Half the courts already have a live 5v5.",
    lastReport: null,
  },
  {
    id: "drake",
    name: "Drake Stadium",
    short: "Drake",
    detail: "Field 1",
    area: "West campus",
    sports: ["soccer"],
    crowd: "open",
    x: 26,
    y: 42,
    blurb: "Grass pitch is open. A casual 7v7 is one player short.",
    lastReport: null,
  },
  {
    id: "sunset",
    name: "Sunset Canyon Rec Center",
    short: "Sunset",
    detail: "Field",
    area: "Northwest campus",
    sports: ["soccer", "basketball"],
    crowd: "open",
    x: 40,
    y: 20,
    blurb: "Rec fields and outdoor hoops. Quiet this hour.",
    lastReport: null,
  },
  {
    id: "hitch",
    name: "Hitch Basketball Courts",
    short: "Hitch",
    detail: "Court 1",
    area: "Rieber / De Neve",
    sports: ["basketball"],
    crowd: "full",
    x: 72,
    y: 70,
    blurb: "Heavy rotation. King of the court is three teams deep.",
    lastReport: null,
  },
  {
    id: "sycamore",
    name: "Sycamore Park",
    short: "Sycamore",
    detail: "South pitch",
    area: "Westwood",
    sports: ["soccer", "basketball"],
    crowd: "moderate",
    x: 78,
    y: 30,
    blurb: "Off-campus park. One half is in a pickup game.",
    lastReport: null,
  },
]
export function openRunLabel(sports: Venue["sports"]) {
  const hoops = sports.includes("basketball")
  const pitch = sports.includes("soccer")
  if (hoops && pitch) return "Open Run"
  if (pitch) return "Open Pitch"
  return "Open Hoops"
}
export function venueIdFromLocation(location: string) {
  const value = location.toLowerCase()
  if (value.includes("drake")) return "drake"
  if (value.includes("sunset")) return "sunset"
  if (value.includes("hitch")) return "hitch"
  if (value.includes("sycamore")) return "sycamore"
  return "wooden"
}