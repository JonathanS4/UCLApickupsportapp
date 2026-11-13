import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { ApiError, createGame, fetchGames, joinGameApi } from "../api/games"
import { CURRENT_USER } from "../constants/profile"
import { formatById, gameCapacity, teamSize } from "../constants/sports"
import { VENUES } from "../constants/venues"
import { buildSeed, INITIAL_ROTATION } from "../data/seed"
import type {
  Crowd,
  Endorsement,
  EndorsementLabel,
  FormatId,
  Game,
  GameExtras,
  HostInput,
  Party,
  QueueEntry,
  Rotation,
  SkillLevel,
  Sport,
  TabId,
  Toast,
  Venue,
} from "../types"
import { defaultExtras } from "../utils/format"

interface Snapshot {
  games: Game[]
  extras: Record<string, GameExtras>
  party: Party
  rotation: Record<string, Rotation>
  venues: Venue[]
  queue: QueueEntry[]
}

interface AppController {
  tab: TabId
  setTab: (tab: TabId) => void
  apiOnline: boolean | null
  games: Game[]
  extras: Record<string, GameExtras>
  venues: Venue[]
  party: Party
  queue: QueueEntry[]
  rotation: Record<string, Rotation>
  endorsements: Endorsement[]
  sportFilter: Sport | "all"
  skillFilter: SkillLevel | "all"
  formatFilter: FormatId | "all"
  setSportFilter: (sports: Sport | "all") => void
  setSkillFilter: (skill: SkillLevel | "all") => void
  setFormatFilter: (format: FormatId | "all") => void
  mapMode: "map" | "list"
  setMapMode: (mode: "map" | "list") => void
  selectedVenueId: string
  setSelectedVenueId: (id: string) => void
  hostOpen: boolean
  setHostOpen: (open: boolean) => void
  inviteOpen: boolean
  setInviteOpen: (open: boolean) => void
  openGameId: string | null
  setOpenGameId: (id: string | null) => void
  joiningId: string | null
  hosting: boolean
  toasts: Toast[]
  reportCrowd: (venueId: string, crowd: Crowd, label: string) => void
  toggleReady: (name: string) => void
  setPartyName: (name: string) => void
  setPartySkill: (skill: SkillLevel) => void
  setPartyFormat: (format: FormatId) => void
  setPartySport: (sports: Sport) => void
  invite: (name: string) => void
  removeMember: (name: string) => void
  queueSolo: () => void
  queueParty: () => void
  leaveQueue: (id: string) => void
  joinDeck: (venueId: string) => void
  leaveDeck: (venueId: string) => void
  rotateCourt: (venueId: string) => void
  joinGame: (id: string, names?: string[]) => Promise<void>
  leaveGame: (id: string) => void
  hostGame: (input: HostInput) => Promise<void>
  toggleEquipment: (gameId: string, itemId: string) => void
  sendMessage: (gameId: string, text: string) => void
  endorse: (player: string, label: EndorsementLabel, gameLocation: string) => void
  refresh: () => Promise<boolean>
  deckLabel: () => string
}

const AppContext = createContext<AppController | null>(null)

const seed = buildSeed()

export function AppProvider({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<TabId>("explore")
  const [apiOnline, setApiOnline] = useState<boolean | null>(null)
  const [games, setGames] = useState<Game[]>(seed.games)
  const [extras, setExtras] = useState<Record<string, GameExtras>>(seed.extras)
  const [venues, setVenues] = useState<Venue[]>(VENUES)
  const [party, setParty] = useState<Party>({
    name: "Wooden 5s",
    sports: "basketball",
    format: "5v5",
    skilllevel: "intermediete",
    members: [
      { name: CURRENT_USER, ready: true },
      { name: "Luis Ortega", ready: true },
      { name: "Priya Shah", ready: false },
    ],
  })
  const [queue, setQueue] = useState<QueueEntry[]>([])
  const [rotation, setRotation] = useState<Record<string, Rotation>>(INITIAL_ROTATION)
  const [endorsements, setEndorsements] = useState<Endorsement[]>([])
  const [sportFilter, setSport] = useState<Sport | "all">("all")
  const [skillFilter, setSkillFilter] = useState<SkillLevel | "all">("all")
  const [formatFilter, setFormat] = useState<FormatId | "all">("all")
  const [mapMode, setMapMode] = useState<"map" | "list">("map")
  const [selectedVenueId, setSelectedVenueId] = useState("wooden")
  const [hostOpen, setHostOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [openGameId, setOpenGameId] = useState<string | null>(null)
  const [joiningId, setJoiningId] = useState<string | null>(null)
  const [hosting, setHosting] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  const live = useRef<Snapshot>({ games, extras, party, rotation, venues, queue })
  live.current = { games, extras, party, rotation, venues, queue }

  const toast = useCallback((text: string) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, text }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id))
    }, 2800)
  }, [])

  const refresh = useCallback(async () => {
    try {
      const remote = await fetchGames()
      setApiOnline(true)
      setGames((prev) => {
        const local = prev.filter((game) => game.source === "local")
        return [...remote.map((game) => ({ ...game, source: "api" as const })), ...local]
      })
      setExtras((prev) => {
        const next = { ...prev }
        for (const game of remote) {
          if (!next[game.id]) next[game.id] = defaultExtras(game)
        }
        return next
      })
      return true
    } catch {
      setApiOnline(false)
      return false
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const setSportFilter = useCallback((sports: Sport | "all") => {
    setSport(sports)
    setFormat((prev) => {
      if (sports === "all" || prev === "all") return prev
      return formatById(prev).sports === sports ? prev : "all"
    })
  }, [])

  const setFormatFilter = useCallback((format: FormatId | "all") => {
    setFormat(format)
    if (format !== "all") setSport(formatById(format).sports)
  }, [])

  const reportCrowd = useCallback(
    (venueId: string, crowd: Crowd, label: string) => {
      setVenues((prev) =>
        prev.map((venue) =>
          venue.id === venueId ? { ...venue, crowd, lastReport: `${CURRENT_USER} · just now · ${label}` } : venue,
        ),
      )
      toast(`${label} posted for this venue.`)
    },
    [toast],
  )

  const toggleReady = useCallback((name: string) => {
    setParty((prev) => ({
      ...prev,
      members: prev.members.map((member) => (member.name === name ? { ...member, ready: !member.ready } : member)),
    }))
  }, [])

  const setPartyName = useCallback((name: string) => {
    setParty((prev) => ({ ...prev, name }))
  }, [])

  const setPartySkill = useCallback((skill: SkillLevel) => {
    setParty((prev) => ({ ...prev, skilllevel: skill }))
  }, [])

  const setPartyFormat = useCallback(
    (format: FormatId) => {
      const spec = formatById(format)
      const members = live.current.party.members.length
      if (members > spec.team) {
        toast(`Drop a player before switching to ${format}.`)
        return
      }
      setParty((prev) => ({ ...prev, format, sports: spec.sports }))
    },
    [toast],
  )

  const setPartySport = useCallback((sports: Sport) => {
    const format: FormatId = sports === "basketball" ? "5v5" : "7v7"
    setParty((prev) => {
      if (prev.members.length > teamSize(format)) return prev
      return { ...prev, sports, format }
    })
  }, [])

  const invite = useCallback(
    (name: string) => {
      const current = live.current.party
      if (current.members.some((member) => member.name === name)) return
      if (current.members.length >= teamSize(current.format)) {
        toast("Party is full.")
        return
      }
      setParty((prev) => ({ ...prev, members: [...prev.members, { name, ready: false }] }))
      setInviteOpen(false)
      toast(`${name} added to the party.`)
    },
    [toast],
  )

  const removeMember = useCallback((name: string) => {
    if (name === CURRENT_USER) return
    setParty((prev) => ({ ...prev, members: prev.members.filter((member) => member.name !== name) }))
  }, [])

  const queueSolo = useCallback(() => {
    if (live.current.queue.length > 0) {
      toast("Leave your current queue first.")
      return
    }
    const sports: Sport = sportFilter === "all" ? "basketball" : sportFilter
    const format: FormatId =
      formatFilter !== "all" ? formatFilter : sports === "basketball" ? "5v5" : "7v7"
    const skill = skillFilter
    const entry: QueueEntry = {
      id: crypto.randomUUID(),
      sports: formatById(format).sports,
      format,
      skilllevel: skill,
      names: [CURRENT_USER],
      label: "Solo queue",
    }
    setQueue([entry])
    toast("You're in the solo queue.")
  }, [formatFilter, skillFilter, sportFilter, toast])

  const queueParty = useCallback(() => {
    const current = live.current.party
    if (live.current.queue.length > 0) {
      toast("Leave your current queue first.")
      return
    }
    const ready = current.members.filter((member) => member.ready)
    if (current.members.length < 2) {
      toast("Invite at least one friend first.")
      return
    }
    if (ready.length !== current.members.length) {
      toast("Everyone in the party needs to be ready.")
      return
    }
    const entry: QueueEntry = {
      id: crypto.randomUUID(),
      sports: current.sports,
      format: current.format,
      skilllevel: current.skilllevel,
      names: current.members.map((member) => member.name),
      label: current.name || "Party",
    }
    setQueue([entry])
    toast("Party is queued against the next premade.")
  }, [toast])

  const leaveQueue = useCallback((id: string) => {
    setQueue((prev) => prev.filter((entry) => entry.id !== id))
  }, [])

  const deckLabel = useCallback(() => {
    const current = live.current.party
    return current.members.length > 1 ? current.name || "Party" : CURRENT_USER
  }, [])

  const joinDeck = useCallback(
    (venueId: string) => {
      const label = deckLabel()
      const row = live.current.rotation[venueId]
      if (row && (row.onDeck.includes(label) || row.active === label)) {
        toast("Already in this rotation.")
        return
      }
      setRotation((prev) => {
        const current = prev[venueId] ?? { active: "Open court", onDeck: [], previous: null }
        return { ...prev, [venueId]: { ...current, onDeck: [...current.onDeck, label] } }
      })
      toast("You're on deck.")
    },
    [deckLabel, toast],
  )

  const leaveDeck = useCallback(
    (venueId: string) => {
      const label = deckLabel()
      setRotation((prev) => {
        const row = prev[venueId]
        if (!row) return prev
        return { ...prev, [venueId]: { ...row, onDeck: row.onDeck.filter((team) => team !== label) } }
      })
    },
    [deckLabel],
  )

  const rotateCourt = useCallback(
    (venueId: string) => {
      const row = live.current.rotation[venueId]
      if (!row || row.onDeck.length === 0) {
        toast("Nobody is on deck.")
        return
      }
      const [next, ...rest] = row.onDeck
      setRotation((prev) => ({
        ...prev,
        [venueId]: { active: next, onDeck: rest, previous: row.active },
      }))
      toast(`${next} is on the court.`)
    },
    [toast],
  )

  const joinGame = useCallback(
    async (id: string, names: string[] = [CURRENT_USER]) => {
      const game = live.current.games.find((item) => item.id === id)
      const extra = live.current.extras[id]
      if (!game || !extra) return
      if (extra.phase === "completed") {
        toast("This game already wrapped.")
        return
      }
      const incoming = names.filter((name) => !game.players.includes(name))
      if (incoming.length === 0) {
        setOpenGameId(id)
        return
      }
      if (game.players.length + incoming.length > game.maxplayers) {
        toast("Not enough spots for the whole party.")
        return
      }
      setJoiningId(id)
      try {
        if (game.source === "api") {
          let latest = game
          for (const name of incoming) {
            latest = { ...(await joinGameApi(id, name)), source: "api" }
          }
          setGames((prev) => prev.map((item) => (item.id === id ? latest : item)))
        } else {
          setGames((prev) =>
            prev.map((item) => (item.id === id ? { ...item, players: [...item.players, ...incoming] } : item)),
          )
        }
        toast(incoming.length > 1 ? "Party joined the game." : "You're in.")
        setOpenGameId(id)
      } catch (error) {
        toast(error instanceof Error ? error.message : "Could not join")
      } finally {
        setJoiningId(null)
      }
    },
    [toast],
  )

  const leaveGame = useCallback(
    (id: string) => {
      const game = live.current.games.find((item) => item.id === id)
      if (!game) return
      if (game.source === "api") {
        toast("The pickup API doesn't have a leave endpoint yet.")
        return
      }
      setGames((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, players: item.players.filter((name) => name !== CURRENT_USER) } : item,
        ),
      )
      toast("You left the game.")
    },
    [toast],
  )

  const rememberGame = useCallback((game: Game, extra: GameExtras) => {
    setGames((prev) => [game, ...prev.filter((item) => item.id !== game.id)])
    setExtras((prev) => ({ ...prev, [game.id]: extra }))
  }, [])

  const hostGame = useCallback(
    async (input: HostInput) => {
      const venue = live.current.venues.find((item) => item.id === input.venueId)
      const spec = formatById(input.format)
      if (!venue) return
      if (spec.sports !== input.sports) {
        toast("That format doesn't match the sport.")
        return
      }
      const body = {
        sports: input.sports,
        location: `${venue.name} — ${venue.detail}`,
        starttime: input.starttime,
        maxplayers: gameCapacity(input.format),
        skilllevel: input.skilllevel,
      }
      setHosting(true)
      try {
        const created = await createGame(body)
        let game: Game = { ...created, source: "api" }
        const extra = {
          ...defaultExtras(game),
          format: input.format,
          venueId: venue.id,
          messages: [
            {
              id: crypto.randomUUID(),
              author: CURRENT_USER,
              text: "Hosted this run on BruinPlay.",
              at: new Date().toISOString(),
            },
          ],
        }
        try {
          game = { ...(await joinGameApi(game.id, CURRENT_USER)), source: "api" }
        } catch (error) {
          toast(error instanceof Error ? error.message : "Game created, but joining failed.")
        }
        rememberGame(game, extra)
        toast("Game is live on the pickup API.")
        setHostOpen(false)
        setOpenGameId(game.id)
      } catch (error) {
        if (error instanceof ApiError) {
          toast(error.message)
          return
        }
        const game: Game = { id: crypto.randomUUID(), ...body, players: [CURRENT_USER], source: "local" }
        rememberGame(game, {
          ...defaultExtras(game),
          format: input.format,
          venueId: venue.id,
          messages: [
            {
              id: crypto.randomUUID(),
              author: CURRENT_USER,
              text: "Hosted on this phone while the API is offline.",
              at: new Date().toISOString(),
            },
          ],
        })
        toast("API is offline. Saved the game on this phone.")
        setHostOpen(false)
        setOpenGameId(game.id)
      } finally {
        setHosting(false)
      }
    },
    [rememberGame, toast],
  )

  const toggleEquipment = useCallback(
    (gameId: string, itemId: string) => {
      const extra = live.current.extras[gameId]
      const item = extra?.equipment.find((entry) => entry.id === itemId)
      if (!extra || !item) return
      if (item.claimedBy && item.claimedBy !== CURRENT_USER) {
        toast(`${item.claimedBy} has the ${item.label.toLowerCase()}.`)
        return
      }
      setExtras((prev) => ({
        ...prev,
        [gameId]: {
          ...extra,
          equipment: extra.equipment.map((entry) =>
            entry.id === itemId ? { ...entry, claimedBy: entry.claimedBy === CURRENT_USER ? null : CURRENT_USER } : entry,
          ),
        },
      }))
    },
    [toast],
  )

  const sendMessage = useCallback((gameId: string, text: string) => {
    const value = text.trim()
    if (!value) return
    setExtras((prev) => {
      const extra = prev[gameId]
      if (!extra) return prev
      return {
        ...prev,
        [gameId]: {
          ...extra,
          messages: [
            ...extra.messages,
            { id: crypto.randomUUID(), author: CURRENT_USER, text: value, at: new Date().toISOString() },
          ],
        },
      }
    })
  }, [])

  const endorse = useCallback(
    (player: string, label: EndorsementLabel, gameLocation: string) => {
      if (player === CURRENT_USER) return
      setEndorsements((prev) => {
        if (prev.some((item) => item.player === player && item.label === label && item.gameLocation === gameLocation)) {
          return prev
        }
        return [{ id: crypto.randomUUID(), player, label, gameLocation }, ...prev]
      })
      toast(`Endorsed ${player} · ${label}`)
    },
    [toast],
  )

  const value = useMemo<AppController>(
    () => ({
      tab,
      setTab,
      apiOnline,
      games,
      extras,
      venues,
      party,
      queue,
      rotation,
      endorsements,
      sportFilter,
      skillFilter,
      formatFilter,
      setSportFilter,
      setSkillFilter,
      setFormatFilter,
      mapMode,
      setMapMode,
      selectedVenueId,
      setSelectedVenueId,
      hostOpen,
      setHostOpen,
      inviteOpen,
      setInviteOpen,
      openGameId,
      setOpenGameId,
      joiningId,
      hosting,
      toasts,
      reportCrowd,
      toggleReady,
      setPartyName,
      setPartySkill,
      setPartyFormat,
      setPartySport,
      invite,
      removeMember,
      queueSolo,
      queueParty,
      leaveQueue,
      joinDeck,
      leaveDeck,
      rotateCourt,
      joinGame,
      leaveGame,
      hostGame,
      toggleEquipment,
      sendMessage,
      endorse,
      refresh,
      deckLabel,
    }),
    [
      tab,
      apiOnline,
      games,
      extras,
      venues,
      party,
      queue,
      rotation,
      endorsements,
      sportFilter,
      skillFilter,
      formatFilter,
      setSportFilter,
      setFormatFilter,
      mapMode,
      selectedVenueId,
      hostOpen,
      inviteOpen,
      openGameId,
      joiningId,
      hosting,
      toasts,
      reportCrowd,
      toggleReady,
      setPartyName,
      setPartySkill,
      setPartyFormat,
      setPartySport,
      invite,
      removeMember,
      queueSolo,
      queueParty,
      leaveQueue,
      joinDeck,
      leaveDeck,
      rotateCourt,
      joinGame,
      leaveGame,
      hostGame,
      toggleEquipment,
      sendMessage,
      endorse,
      refresh,
      deckLabel,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error("useApp must be used inside AppProvider")
  return context
}
