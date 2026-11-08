import type { ButtonHTMLAttributes, ReactNode } from "react"
import { X } from "lucide-react"
import { colorFor, initials } from "../utils/format"
export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ")
}
export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, background: colorFor(name), fontSize: size < 36 ? 11 : 13 }}
      aria-hidden
    >
      {initials(name)}
    </span>
  )
}
export function Button({
  tone = "blue",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "blue" | "gold" | "ghost" | "ink" }) {
  const tones = {
    blue: "bg-[#2774AE] text-white",
    gold: "bg-[#FFD100] text-[#1E1E1E]",
    ghost: "bg-white text-[#1E1E1E] ring-1 ring-black/10",
    ink: "bg-[#1E1E1E] text-white",
  }
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-40",
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}
export function Chip({ active, children, onClick }: { active?: boolean; children: ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold",
        active ? "bg-[#2774AE] text-white" : "bg-white text-[#1E1E1E] ring-1 ring-black/10",
      )}
    >
      {children}
    </button>
  )
}
export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end bg-[#1E1E1E]/45">
      <button className="min-h-10 flex-1" aria-label="Close" onClick={onClose} />
      <div className="max-h-[82%] overflow-y-auto rounded-t-[28px] bg-[#F4F6F8] px-4 pb-6 pt-3 shadow-2xl">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-black/15" />
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-[28px] uppercase leading-none tracking-wide text-[#1E1E1E]">{title}</h2>
          <button className="grid h-9 w-9 place-items-center rounded-full bg-white ring-1 ring-black/10" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cx("rounded-3xl bg-white p-4 shadow-[0_8px_24px_rgba(16,32,48,0.06)]", className)}>{children}</section>
}