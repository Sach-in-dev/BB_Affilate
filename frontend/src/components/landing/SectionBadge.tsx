interface SectionBadgeProps {
  children: React.ReactNode;
}

/** Small rounded pill used above section headings, e.g. "HOW IT WORKS". */
export function SectionBadge({ children }: SectionBadgeProps) {
  return (
    <span className="text-sm font-semibold tracking-widest text-cyan-400 uppercase">
      {children}
    </span>
  );
}

/** Larger pill badge used in the hero, e.g. "• 26RITUAL AFFILIATE PROGRAM". */
export function HeroBadge({ children }: SectionBadgeProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 px-5 py-2 text-sm font-semibold tracking-widest text-cyan-400 uppercase">
      <span className="h-2 w-2 rounded-full bg-cyan-400" />
      {children}
    </span>
  );
}
