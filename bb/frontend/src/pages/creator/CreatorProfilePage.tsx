import { useEffect, useState } from "react";
import { Loader2, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { creatorApi, type CreatorProfile } from "@/lib/creator-api";

export default function CreatorProfilePage() {
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    creatorApi.getProfile().then(setProfile).finally(() => setLoading(false));
  }, []);

  const set = (k: keyof CreatorProfile, v: string) =>
    setProfile((p) => (p ? { ...p, [k]: v } : p));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      setSaving(true);
      setError(null);
      const updated = await creatorApi.updateProfile({
        first_name: profile.first_name,
        last_name: profile.last_name,
        handle: profile.handle || undefined,
        bio: profile.bio || undefined,
        avatar_url: profile.avatar_url || undefined,
        instagram: profile.instagram || undefined,
        youtube: profile.youtube || undefined,
        niche: profile.niche || undefined,
        city: profile.city || undefined,
        state: profile.state || undefined,
      });
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const initials = `${profile.first_name?.[0] ?? ""}${profile.last_name?.[0] ?? ""}`;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This is what customers see on your bundle landing pages.
        </p>
      </div>

      {/* Preview */}
      <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-primary">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary text-lg font-bold text-primary-foreground">
              {initials}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-foreground">
            {profile.first_name} {profile.last_name}
          </p>
          {profile.handle && <p className="text-sm text-[#962E3C]">@{profile.handle}</p>}
          {profile.bio && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{profile.bio}</p>}
        </div>
      </div>

      <form onSubmit={save} className="space-y-5 rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>First Name</Label>
            <Input className="mt-1" value={profile.first_name} onChange={(e) => set("first_name", e.target.value)} />
          </div>
          <div>
            <Label>Last Name</Label>
            <Input className="mt-1" value={profile.last_name} onChange={(e) => set("last_name", e.target.value)} />
          </div>
        </div>

        <div>
          <Label>Handle</Label>
          <div className="mt-1 flex items-center">
            <span className="flex h-9 items-center rounded-l-md border border-r-0 border-input px-3 text-sm text-muted-foreground">
              @
            </span>
            <Input
              className="rounded-l-none"
              placeholder="yourhandle"
              value={profile.handle ?? ""}
              onChange={(e) => set("handle", e.target.value.replace(/[^a-z0-9._]/gi, "").toLowerCase())}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Shown on your landing page.</p>
        </div>

        <div>
          <Label>Bio</Label>
          <textarea
            className="mt-1 min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            placeholder="A guide to building a flexible yet stylish routine…"
            value={profile.bio ?? ""}
            onChange={(e) => set("bio", e.target.value)}
          />
        </div>

        <div>
          <Label>Avatar Image URL</Label>
          <Input
            className="mt-1"
            placeholder="https://…"
            value={profile.avatar_url ?? ""}
            onChange={(e) => set("avatar_url", e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Instagram</Label>
            <Input
              className="mt-1"
              placeholder="@yourhandle"
              value={profile.instagram ?? ""}
              onChange={(e) => set("instagram", e.target.value)}
            />
          </div>
          <div>
            <Label>YouTube</Label>
            <Input
              className="mt-1"
              placeholder="@yourchannel"
              value={profile.youtube ?? ""}
              onChange={(e) => set("youtube", e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>Niche</Label>
            <Input
              className="mt-1"
              placeholder="Skincare"
              value={profile.niche ?? ""}
              onChange={(e) => set("niche", e.target.value)}
            />
          </div>
          <div>
            <Label>City</Label>
            <Input className="mt-1" value={profile.city ?? ""} onChange={(e) => set("city", e.target.value)} />
          </div>
          <div>
            <Label>State</Label>
            <Input className="mt-1" value={profile.state ?? ""} onChange={(e) => set("state", e.target.value)} />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving} className="bg-[#962E3C] text-white hover:bg-[#7f2632]">
            {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : null}
            {saved ? "Saved" : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
