import { ShieldCheck } from "lucide-react"
import { PROFILE } from "../constants/profile"
export function PlayerCard() {
  return (
    <article className="foil relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#2774AE] via-[#1b5d90] to-[#10283d] text-white shadow-xl">
      <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[#FFD100]/25" />
      <div className="flex items-start justify-between p-5">
        <div>
          <p className="font-display text-6xl leading-none">{PROFILE.overall}</p>
          <p className="text-[11px] font-bold tracking-[0.22em] text-[#FFD100]">OVR</p>
          <p className="mt-2 font-display text-2xl leading-none">{PROFILE.position}</p>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#FFD100] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#1E1E1E]">
            <ShieldCheck size={12} />
            Bruin verified
          </span>
          <p className="mt-3 font-display text-4xl uppercase leading-none">{PROFILE.name}</p>
          <p className="mt-1 text-sm text-white/75">{PROFILE.sportLine}</p>
          <p className="text-xs text-white/60">{PROFILE.year}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 px-5">
        {PROFILE.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-[#FFD100] px-2 py-1 text-[11px] font-semibold text-[#FFD100]">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-4 bg-black/25">
        {PROFILE.stats.map((stat) => (
          <div key={stat.label} className="px-2 py-3 text-center">
            <p className="font-display text-2xl leading-none">{stat.value}</p>
            <p className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-white/70">{stat.label}</p>
          </div>
        ))}
      </div>
    </article>
  )
}