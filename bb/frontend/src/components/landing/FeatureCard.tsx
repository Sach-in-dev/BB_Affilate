import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Copy } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  linkChip?: string;
  index?: number;
}

/** Icon + title + description card used in the "Why Join" and "Creator Toolkit" grids. */
export function FeatureCard({ icon: Icon, title, description, linkChip, index = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors duration-200 hover:border-white/20 hover:bg-white/[0.05]"
    >
      <Icon className="h-6 w-6 text-white" strokeWidth={1.75} />
      <h3 className="mt-4 font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-neutral-400">{description}</p>
      {linkChip && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-neutral-400">
          <span className="flex-1 truncate">{linkChip}</span>
          <Copy className="h-3.5 w-3.5 shrink-0" />
        </div>
      )}
    </motion.div>
  );
}
