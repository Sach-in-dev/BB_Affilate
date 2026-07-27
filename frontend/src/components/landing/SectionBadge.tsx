interface SectionBadgeProps {
  children: React.ReactNode;
}

/** Small rounded pill used above section headings, e.g. "HOW IT WORKS". */
export function SectionBadge({ children }: SectionBadgeProps) {
  return (
    <span className="text-sm font-semibold tracking-widest text-primary uppercase">
      {children}
    </span>
  );
}

/** Larger pill badge used in the hero, e.g. "• 26RITUAL AFFILIATE PROGRAM". */
export function HeroBadge({ children }: SectionBadgeProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-sm font-semibold tracking-widest text-primary uppercase">
      <span className="h-2 w-2 rounded-full bg-primary" />
      {children}
    </span>
  );
}
