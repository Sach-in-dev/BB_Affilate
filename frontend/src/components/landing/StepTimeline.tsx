import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export interface Step {
  icon: LucideIcon;
  step: string;
  title: string;
  desc: string;
}

/** Horizontal 3-step timeline with circular icon nodes and an animated connecting line. */
export function StepTimeline({ steps }: { steps: Step[] }) {
  return (
    <div className="relative mt-16 grid grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-6">
      {/* Connecting line — animates its fill in from the left as the section scrolls into view. */}
      <div className="absolute left-[16.5%] right-[16.5%] top-8 hidden h-px bg-white/10 sm:block">
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
          className="h-full origin-left bg-gradient-to-r from-cyan-400/80 to-cyan-400/10"
        />
      </div>

      {steps.map((s, i) => (
        <motion.div
          key={s.step}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: i * 0.15, ease: "easeOut" }}
          className="relative flex flex-col items-center text-center"
        >
          <span className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-neutral-950 text-white">
            <s.icon className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <span className="mt-4 text-xs font-semibold tracking-widest text-neutral-500 uppercase">
            {s.step}
          </span>
          <h3 className="mt-2 font-semibold text-white">{s.title}</h3>
          <p className="mt-2 max-w-[16rem] text-sm leading-relaxed text-neutral-400">{s.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}
