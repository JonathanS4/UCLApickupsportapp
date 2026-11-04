import type { ApiGame, CreateGameBody } from "../types"
import { detailText } from "../utils/format"
const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000"
export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}
async function read(response: Response) {
  if (!response.ok) {
    let detail: unknown = response.statusText
    try {
      const body = (await response.json()) as { detail?: unknown }
      detail = body.detail ?? body
    } catch {
      detail = response.statusText
    }
    throw new ApiError(detailText(detail), response.status)
  }
  return response.json() as Promise<unknown>
}
export async function fetchGames() {
  const response = await fetch(`${API_URL}/games`, { signal: AbortSignal.timeout(4000) })
  const data = await read(response)
  if (!Array.isArray(data)) throw new ApiError("Unexpected games payload", 500)
  return data as ApiGame[]
}
export async function createGame(body: CreateGameBody) {
  const response = await fetch(`${API_URL}/games`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(4000),
  })
  return (await read(response)) as ApiGame
}
export async function joinGameApi(id: string, playerName: string) {
  const url = new URL(`${API_URL}/games/${id}/join`)
  url.searchParams.set("player_name", playerName)
  const response = await fetch(url, { method: "POST", signal: AbortSignal.timeout(4000) })
  return (await read(response)) as ApiGame
}