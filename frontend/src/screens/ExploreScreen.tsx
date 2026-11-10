import { CROWD, openRunLabel } from "../constants/venues"
import { useApp } from "../state/AppState"
import type { Crowd, Venue } from "../types"
import { Card, cx } from "../components/ui"
export function ExploreScreen() {
  const { venues, selectedVenueId, setSelectedVenueId, mapMode, setMapMode, reportCrowd } = useApp()
  const selected = venues.find((venue) => venue.id === selectedVenueId) ?? venues[0]
  return (
    <div className="space-y-3 px-4 pb-5">
      <div className="grid grid-cols-2 rounded-full bg-white p-1 shadow-sm">
        {(["map", "list"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setMapMode(mode)}
            className={cx("rounded-full py-2 text-sm font-semibold capitalize", mapMode === mode ? "bg-[#2774AE] text-white" : "text-[#1E1E1E]/60")}
          >
            {mode}
          </button>
        ))}
      </div>
      {mapMode === "map" ? (
        <CampusMap venues={venues} selectedId={selected.id} onSelect={setSelectedVenueId} />
      ) : (
        <div className="space-y-2">
          {venues.map((venue) => (
            <button key={venue.id} className="block w-full text-left" onClick={() => setSelectedVenueId(venue.id)}>
              <VenueSummary venue={venue} selected={venue.id === selected.id} />
            </button>
          ))}
        </div>
      )}
      <CrowdCard venue={selected} onReport={(crowd, label) => reportCrowd(selected.id, crowd, label)} />
    </div>
  )
}
function CampusMap({ venues, selectedId, onSelect }: { venues: Venue[]; selectedId: string; onSelect: (id: string) => void }) {
  return (
    <div className="relative h-[430px] overflow-hidden rounded-[28px] bg-[#d7e7c8] shadow-sm">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        <rect width="100" height="100" fill="#e5f0d6" />
        <path d="M0 78 C 30 70, 60 88, 100 74 L 100 100 L 0 100 Z" fill="#c5d8ee" />
        <path d="M8 48 H92" stroke="white" strokeWidth="2.4" />
        <path d="M46 8 V92" stroke="white" strokeWidth="2.2" />
        <path d="M18 20 H70" stroke="white" strokeWidth="1.4" opacity="0.8" />
        <ellipse cx="26" cy="42" rx="12" ry="7" fill="#2f7d32" opacity="0.28" />
        <ellipse cx="26" cy="42" rx="8" ry="4" fill="none" stroke="#2774AE" strokeWidth="0.6" />
        <rect x="52" y="40" width="16" height="14" rx="1.2" fill="#2774AE" opacity="0.9" />
        <rect x="66" y="64" width="8" height="6" fill="#c4552a" />
        <rect x="75" y="64" width="8" height="6" fill="#c4552a" />
        <circle cx="78" cy="28" r="4" fill="#2f7d32" opacity="0.45" />
        <circle cx="84" cy="34" r="3" fill="#2f7d32" opacity="0.35" />
        <rect x="34" y="14" width="14" height="10" rx="1" fill="#2774AE" opacity="0.35" />
      </svg>
      <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold tracking-[0.14em] text-[#2774AE]">
        WESTWOOD
      </div>
      <div className="absolute bottom-3 left-3 right-3 flex gap-2">
        {(Object.keys(CROWD) as Crowd[]).map((key) => (
          <span key={key} className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold">
            <span className="h-2 w-2 rounded-full" style={{ background: CROWD[key].dot }} />
            {key === "open" ? "Open" : key === "moderate" ? "Busy" : "Full"}
          </span>
        ))}
      </div>
      {venues.map((venue) => {
        const selected = venue.id === selectedId
        return (
          <button
            key={venue.id}
            className="absolute -translate-x-1/2 -translate-y-full"
            style={{ left: `${venue.x}%`, top: `${venue.y}%` }}
            onClick={() => onSelect(venue.id)}
          >
            <span className="mb-1 block rounded-full bg-white px-2 py-0.5 text-[10px] font-bold shadow-sm">{venue.short}</span>
            <span
              className={cx(
                "mx-auto grid h-8 w-8 place-items-center rounded-full border-2 border-white text-[10px] font-bold text-white shadow",
                venue.crowd === "full" && "pin-full",
                selected && "ring-2 ring-[#FFD100]",
              )}
              style={{ background: CROWD[venue.crowd].dot }}
            >
              {venue.short.slice(0, 1)}
            </span>
          </button>
        )
      })}
    </div>
  )
}
function VenueSummary({ venue, selected }: { venue: Venue; selected: boolean }) {
  return (
    <div className={cx("rounded-3xl bg-white p-3 shadow-sm", selected && "ring-2 ring-[#2774AE]")}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{venue.name}</p>
          <p className="text-xs text-[#1E1E1E]/55">
            {venue.detail} · {venue.area}
          </p>
        </div>
        <StatusPill crowd={venue.crowd} />
      </div>
    </div>
  )
}

function CrowdCard({ venue, onReport }: { venue: Venue; onReport: (crowd: Crowd, label: string) => void }) {
  const meta = CROWD[venue.crowd]
  const openLabel = openRunLabel(venue.sports)
  const reports: { crowd: Crowd; label: string; hint: string }[] = [
    { crowd: "open", label: openLabel, hint: "Low crowd, space to start" },
    { crowd: "moderate", label: "Waiting List", hint: "Players stacked for the next run" },
    { crowd: "full", label: "Full Court Game Active", hint: "Heavy rotation, no open court" },
  ]
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2774AE]">Inside the geofence</p>
          <h2 className="mt-1 text-lg font-semibold leading-tight">{venue.name}</h2>
          <p className="text-xs text-[#1E1E1E]/55">
            {venue.detail} · {venue.area}
          </p>
        </div>
        <StatusPill crowd={venue.crowd} />
      </div>
      <p className="mt-2 text-sm text-[#1E1E1E]/75">{venue.blurb}</p>
      <div className="mt-3">
        <div className="mb-1 flex justify-between text-[10px] font-semibold uppercase tracking-wider text-[#1E1E1E]/45">
          <span>Activity</span>
          <span>{meta.label}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#F4F6F8]">
          <div className="h-full rounded-full" style={{ width: `${meta.meter}%`, background: meta.dot }} />
        </div>
      </div>
      <p className="mt-3 text-xs text-[#1E1E1E]/55">{venue.lastReport ?? "No student report in the last hour."}</p>
      <div className="mt-3 grid gap-2">
        {reports.map((report) => (
          <button
            key={report.label}
            onClick={() => onReport(report.crowd, report.label)}
            className={cx(
              "rounded-2xl px-3 py-3 text-left",
              venue.crowd === report.crowd ? "bg-[#1E1E1E] text-white" : "bg-[#F4F6F8]",
            )}
          >
            <span className="block text-sm font-semibold">{report.label}</span>
            <span className={cx("block text-xs", venue.crowd === report.crowd ? "text-white/70" : "text-[#1E1E1E]/55")}>{report.hint}</span>
          </button>
        ))}
      </div>
    </Card>
  )
}
function StatusPill({ crowd }: { crowd: Crowd }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#F4F6F8] px-2 py-1 text-[10px] font-bold uppercase tracking-wide">
      <span className="h-2 w-2 rounded-full" style={{ background: CROWD[crowd].dot }} />
      {crowd === "open" ? "Open" : crowd === "moderate" ? "Busy" : "Full"}
    </span>
  )
}