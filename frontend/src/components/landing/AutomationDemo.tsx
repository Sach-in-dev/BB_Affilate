import { motion } from "framer-motion";
import { MessageCircle, Copy } from "lucide-react";

function Avatar() {
  return <span className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600" />;
}

/** Two connected chat-preview cards demonstrating the comment-to-DM automation. */
export function AutomationDemo({
  handle,
  commentKeyword,
  fanAccount,
  dmMessage,
  linkText,
}: {
  handle: string;
  commentKeyword: string;
  fanAccount: string;
  dmMessage: string;
  linkText: string;
}) {
  return (
    <div className="mt-16 flex flex-col items-center justify-center gap-6 sm:flex-row">
      {/* Comment preview */}
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-xs rounded-2xl border border-white/10 bg-white/[0.03] p-4"
      >
        <div className="flex items-center gap-2.5">
          <Avatar />
          <div>
            <p className="text-sm font-semibold text-white">{handle}</p>
            <p className="text-xs text-neutral-400">
              Comment &quot;{commentKeyword}&quot; to get my link 👇
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-black/30 px-3 py-2.5">
          <Avatar />
          <p className="text-sm text-neutral-200">
            <span className="font-medium">{fanAccount}</span>{" "}
            <span className="text-cyan-400">{commentKeyword} 🔥</span>
          </p>
        </div>
      </motion.div>

      <motion.span
        initial={{ opacity: 0, scale: 0.6 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-neutral-950 text-cyan-400"
      >
        <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
      </motion.span>

      {/* Auto-DM preview */}
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
        className="w-full max-w-xs rounded-2xl border border-white/10 bg-white/[0.03] p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Avatar />
            <p className="text-sm font-semibold text-white">{handle}</p>
          </div>
          <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-cyan-400 uppercase">
            Auto-DM
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-neutral-300">{dmMessage}</p>
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-white/5 bg-black/30 px-3 py-2 text-xs text-neutral-400">
          <span className="flex-1 truncate">{linkText}</span>
          <Copy className="h-3.5 w-3.5 shrink-0" />
        </div>
      </motion.div>
    </div>
  );
}
