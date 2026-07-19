import { motion } from "framer-motion";
import { SectionBadge } from "./SectionBadge";

interface SectionHeadingProps {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
}

/** Centered eyebrow + heading + subtitle block used at the top of every section. */
export function SectionHeading({ eyebrow, title, subtitle }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mx-auto max-w-3xl text-center"
    >
      <SectionBadge>{eyebrow}</SectionBadge>
      <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {subtitle && <p className="mt-5 text-lg text-neutral-400">{subtitle}</p>}
    </motion.div>
  );
}
