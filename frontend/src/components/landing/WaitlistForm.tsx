import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2, Plus, X, ChevronDown, Check } from "lucide-react";

/* ── Google Apps Script Web-App URL ── */
const SHEET_URL =
  (import.meta as any).env.VITE_GOOGLE_SHEET_URL || "https://script.google.com/macros/s/AKfycbyhChyRJpSdCg6xi9UWuwahEG9IfNiq9KNP42-ZeW6UskNtoLc-o8SWs0TBkBoScUzAJA/exec";

const PLATFORM_OPTIONS = [
  "Instagram",
  "YouTube",
  "TikTok",
  "Facebook",
  "Blog / Website",
  "Other",
];

interface PlatformEntry {
  platform: string;
  details: string;
}

export function WaitlistForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [platforms, setPlatforms] = useState<PlatformEntry[]>([
    { platform: "", details: "" },
  ]);
  const [socialLinks, setSocialLinks] = useState<string[]>([""]);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [agreed, setAgreed] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ── Platform dropdown state ── */
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* ── Helpers ── */
  const addPlatform = () =>
    setPlatforms((p) => [...p, { platform: "", details: "" }]);
  const removePlatform = (i: number) =>
    setPlatforms((p) => p.filter((_, idx) => idx !== i));
  const updatePlatform = (i: number, field: keyof PlatformEntry, v: string) =>
    setPlatforms((p) => p.map((e, idx) => (idx === i ? { ...e, [field]: v } : e)));

  const addSocialLink = () => setSocialLinks((l) => [...l, ""]);
  const removeSocialLink = (i: number) =>
    setSocialLinks((l) => l.filter((_, idx) => idx !== i));
  const updateSocialLink = (i: number, v: string) =>
    setSocialLinks((l) => l.map((s, idx) => (idx === i ? v : s)));

  const isValid =
    name.trim() &&
    email.trim() &&
    instagram.trim() &&
    platforms.some((p) => p.platform) &&
    agreed;

  /* ── Submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);
    setError(null);

    const payload = {
      name: name.trim(),
      email: email.trim(),
      instagramLink: instagram.trim(),
      platforms: platforms
        .filter((p) => p.platform)
        .map((p) => `${p.platform}${p.details ? ` — ${p.details}` : ""}`)
        .join("; "),
      socialLinks: socialLinks.filter((s) => s.trim()).join(", "),
      additionalInfo: additionalInfo.trim(),
    };

    try {
      const formData = new URLSearchParams(payload);

      await fetch(SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Input classes ── */
  const inputCls =
    "w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-neutral-500 outline-none transition-colors focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20";
  const labelCls = "block text-sm font-semibold text-white";
  const subLabelCls = "mt-0.5 text-xs text-neutral-500";

  /* ── Success state ── */
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl border border-white/10 bg-white/[0.02] px-8 py-16 text-center"
      >
        <div className="mx-auto text-4xl">
          🎉
        </div>
        <h3 className="mt-6 text-2xl font-bold text-white">
          You're on the list!
        </h3>
        <p className="mx-auto mt-3 max-w-md text-base text-neutral-400">
          Thank you for your interest in the 26ritual Affiliate Program. We'll
          reach out to you as soon as we launch with early access details.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] px-6 py-10 sm:px-10 sm:py-12">
        <div className="space-y-6">
          {/* Full Name */}
          <div>
            <label className={labelCls}>
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              className={`mt-2 ${inputCls}`}
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Email */}
          <div>
            <label className={labelCls}>
              Email Address <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              className={`mt-2 ${inputCls}`}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Instagram */}
          <div>
            <label className={labelCls}>
              Instagram Account Link <span className="text-red-400">*</span>
            </label>
            <p className={subLabelCls}>Your Instagram profile URL (required)</p>
            <input
              type="url"
              className={`mt-2 ${inputCls}`}
              placeholder="https://instagram.com/yourprofile"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
            />
          </div>

          {/* Platform promotion */}
          <div>
            <label className={labelCls}>
              How will you promote 26ritual?{" "}
              <span className="text-red-400">*</span>
            </label>
            <div className="mt-2 space-y-3">
              {platforms.map((entry, i) => (
                <div key={i} className="flex items-start gap-2">
                  {/* Custom dropdown */}
                  <div
                    className="relative"
                    ref={(el) => { dropdownRefs.current[i] = el; }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenDropdown(openDropdown === i ? null : i)
                      }
                      className="flex h-[42px] w-44 items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-white transition-colors hover:border-white/20"
                    >
                      <span
                        className={
                          entry.platform ? "text-white" : "text-neutral-500"
                        }
                      >
                        {entry.platform || "Select platform"}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`text-neutral-400 transition-transform ${
                          openDropdown === i ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {openDropdown === i && (
                      <div className="absolute left-0 top-full z-20 mt-1 w-48 rounded-lg border border-white/10 bg-neutral-900 py-1 shadow-xl">
                        {PLATFORM_OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              updatePlatform(i, "platform", opt);
                              setOpenDropdown(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-300 hover:bg-white/5 hover:text-white"
                          >
                            {entry.platform === opt && (
                              <Check size={14} className="text-cyan-400" />
                            )}
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    className={`flex-1 ${inputCls}`}
                    placeholder="Details (e.g. follower count, niche)"
                    value={entry.details}
                    onChange={(e) => updatePlatform(i, "details", e.target.value)}
                  />
                  {platforms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePlatform(i)}
                      className="mt-2.5 text-neutral-500 hover:text-red-400 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addPlatform}
              className="mt-2 flex items-center gap-1 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <Plus size={14} /> Add another platform
            </button>
          </div>

          {/* Social Media Links (optional) */}
          <div>
            <label className={labelCls}>
              Social Media Links{" "}
              <span className="text-neutral-500 font-normal">(Optional)</span>
            </label>
            <div className="mt-2 space-y-3">
              {socialLinks.map((link, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="url"
                    className={`flex-1 ${inputCls}`}
                    placeholder="https://..."
                    value={link}
                    onChange={(e) => updateSocialLink(i, e.target.value)}
                  />
                  {socialLinks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSocialLink(i)}
                      className="text-neutral-500 hover:text-red-400 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addSocialLink}
              className="mt-2 flex items-center gap-1 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <Plus size={14} /> Add social media link
            </button>
          </div>

          {/* Additional Info */}
          <div>
            <label className={labelCls}>Additional Information</label>
            <p className={subLabelCls}>
              Any additional details that might help us review your application
            </p>
            <textarea
              className={`mt-2 min-h-[100px] resize-y ${inputCls}`}
              placeholder="Tell us more about yourself and how you plan to promote 26ritual..."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
            />
          </div>

          {/* Agree checkbox */}
          <label className="flex cursor-pointer items-start gap-3">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-[18px] w-[18px] rounded border border-white/20 bg-white/[0.03] transition-colors peer-checked:border-cyan-400 peer-checked:bg-cyan-400/10" />
              {agreed && (
                <Check
                  size={12}
                  className="absolute left-[3px] top-[3px] text-cyan-400"
                />
              )}
            </div>
            <span className="text-sm text-neutral-400">
              I agree to the{" "}
              <a
                href="#"
                className="font-medium text-white underline underline-offset-2 hover:text-cyan-400 transition-colors"
              >
                Affiliate Program Terms &amp; Conditions
              </a>
            </span>
          </label>

          {/* Error */}
          {error && (
            <p className="text-center text-sm text-red-400">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!isValid || submitting}
            className="w-full rounded-full border border-white/20 bg-white py-3.5 text-base font-bold text-neutral-950 transition-all hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? (
              <Loader2 className="mx-auto h-5 w-5 animate-spin" />
            ) : (
              "Submit Application"
            )}
          </button>
        </div>
      </div>

      <p className="text-center text-sm text-neutral-500">
        We'll review your application and get back to you within 48 hours of
        launch.
      </p>
    </form>
  );
}
