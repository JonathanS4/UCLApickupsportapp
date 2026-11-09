import type { FormatId, SkillLevel, Sport } from "../types"
/**
 * Full-game sizes stay inside the API caps in backend/app/main.py:
 * basketball 10, soccer 22. Party size is one side of the format.
 * Skill "intermediete" is the exact backend literal.
 */
export const FORMATS: { id: FormatId; sports: Sport; team: number; label: string }[] = [
  { id: "3v3", sports: "basketball", team: 3, label: "Basketball 3v3" },
  { id: "5v5", sports: "basketball", team: 5, label: "Basketball 5v5" },
  { id: "7v7", sports: "soccer", team: 7, label: "Soccer 7v7" },
  { id: "11v11", sports: "soccer", team: 11, label: "Soccer 11v11" },
]
export const SKILLS: { value: SkillLevel; label: string }[] = [
  { value: "beginner", label: "Casual" },
  { value: "intermediete", label: "Intermediate" },
  { value: "advanced", label: "Competitive" },
  { value: "all", label: "All levels" },
]
export function skillLabel(value: SkillLevel) {
  return SKILLS.find((skill) => skill.value === value)?.label ?? "All levels"
}
export function formatById(id: FormatId) {
  const format = FORMATS.find((item) => item.id === id)
  if (!format) throw new Error(`Unknown format ${id}`)
  return format
}
export function teamSize(format: FormatId) {
  return formatById(format).team
}
export function gameCapacity(format: FormatId) {
  return teamSize(format) * 2
}
export function inferFormat(sports: Sport, maxplayers: number): FormatId {
  if (sports === "basketball") return maxplayers <= 6 ? "3v3" : "5v5"
  return maxplayers <= 14 ? "7v7" : "11v11"
}