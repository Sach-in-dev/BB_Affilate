import { useEffect, useState, useCallback } from "react";
import { Search, Trash2, ExternalLink, ChevronLeft, ChevronRight, ClipboardList } from "lucide-react";
import { adminApi, WaitlistEntry, WaitlistListResponse } from "@/lib/admin-api";

export default function WaitlistPage() {
  const [data, setData] = useState<WaitlistListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getWaitlist({ page, page_size: 20, search: search || undefined });
      setData(res);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this waitlist entry?")) return;
    await adminApi.deleteWaitlistEntry(id);
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Waitlist</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Creator applications from the landing page waitlist form.
        </p>
      </div>

      {/* Stats */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ClipboardList size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{data?.total ?? 0}</p>
            <p className="text-xs text-muted-foreground">Total Applications</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name, email, or Instagram..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Instagram</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Platforms</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : !data?.entries.length ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No waitlist entries found.</td></tr>
              ) : (
                data.entries.map((entry) => (
                  <WaitlistRow key={entry.id} entry={entry} onDelete={handleDelete} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {data && data.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {data.page} of {data.total_pages} ({data.total} total)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm disabled:opacity-40"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
              disabled={page >= data.total_pages}
              className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm disabled:opacity-40"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function WaitlistRow({ entry, onDelete }: { entry: WaitlistEntry; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const date = entry.created_at ? new Date(entry.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  return (
    <>
      <tr
        className="border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-3 font-medium text-foreground">{entry.name}</td>
        <td className="px-4 py-3 text-muted-foreground">{entry.email}</td>
        <td className="px-4 py-3">
          <a
            href={entry.instagram_link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <ExternalLink size={12} />
            {entry.instagram_link.replace(/https?:\/\/(www\.)?instagram\.com\/?/, "@")}
          </a>
        </td>
        <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">{entry.platforms || "—"}</td>
        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{date}</td>
        <td className="px-4 py-3 text-right">
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
            className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
            title="Delete entry"
          >
            <Trash2 size={15} />
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="border-b last:border-0 bg-muted/20">
          <td colSpan={6} className="px-4 py-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Platforms</p>
                <p className="text-foreground">{entry.platforms || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Social Links</p>
                <p className="text-foreground break-all">{entry.social_links || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Additional Info</p>
                <p className="text-foreground">{entry.additional_info || "—"}</p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
