import { motion } from "framer-motion";
import { Copy, type LucideIcon } from "lucide-react";

interface MockRow {
  icon: LucideIcon;
  label: string;
}

interface HeroDashboardMockProps {
  title: string;
  rows: MockRow[];
  linkText: string;
}

/** Small floating "dashboard" card shown beside the hero copy. */
export function HeroDashboardMock({ title, rows, linkText }: HeroDashboardMockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
      className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/40 backdrop-blur"
    >
      <div className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="ml-2 text-xs font-medium text-neutral-400">{title}</span>
      </div>

      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center gap-3 rounded-lg border border-white/5 bg-black/20 px-3 py-2.5"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-400">
              <row.icon className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
            <span className="text-sm text-neutral-200">{row.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-lg border border-white/5 bg-black/30 px-3 py-2.5 text-sm text-neutral-400">
        <span className="flex-1 truncate">{linkText}</span>
        <Copy className="h-3.5 w-3.5 shrink-0" />
      </div>
    </motion.div>
  );
}

interface StatColumn {
  label: string;
  value: string;
  accent?: boolean;
}

/** Larger dashboard mockup shown in the Creator Toolkit section, with stat columns. */
export function ToolkitDashboardMock({ title, stats, caption }: { title: string; stats: StatColumn[]; caption: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/40"
    >
      <div className="flex items-center gap-1.5 border-b border-white/10 px-5 py-4">
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="ml-2 text-sm font-medium text-neutral-300">{title}</span>
      </div>

      <div className="grid grid-cols-3 divide-x divide-white/10">
        {stats.map((s) => (
          <div key={s.label} className="px-5 py-6">
            <p className="text-sm text-neutral-500">{s.label}</p>
            <p className={`mt-3 h-4 w-10 rounded-full ${s.accent ? "bg-cyan-400/70" : "bg-white/70"}`} />
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 px-5 py-3">
        <p className="text-xs text-neutral-500">{caption}</p>
      </div>
    </motion.div>
  );
}
