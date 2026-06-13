import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, CornerDownLeft, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { quickNavForRole, type AppRole, type QuickNavItem } from "../lib/quickNav";
import { useFocusTrap } from "../hooks/useFocusTrap";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const role = profile?.role as AppRole | undefined;
  const recentKey = `sb_recent_nav_${role ?? "client"}`;
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(recentKey);
      const parsed = raw ? (JSON.parse(raw) as string[]) : [];
      setRecentIds(Array.isArray(parsed) ? parsed : []);
    } catch {
      setRecentIds([]);
    }
  }, [recentKey]);

  const roleActions: QuickNavItem[] = useMemo(
    () =>
      role === "client"
        ? [
            { id: "action-upload", label: "Action: Upload document", to: "/dashboard/upload", keywords: "new create upload action" },
            { id: "action-claim", label: "Action: Start claim", to: "/dashboard/claims", keywords: "new create claim action" },
          ]
        : [
            { id: "action-upload", label: "Action: Upload document", to: "/dashboard/upload", keywords: "new create upload action" },
            { id: "action-quote", label: "Action: Create Quote", to: "/dashboard/quotes", keywords: "new create quote action calculator" },
            { id: "action-task", label: "Action: Create task", to: "/dashboard/tasks", keywords: "new create task action" },
          ],
    [role],
  );

  const matches = useMemo(() => {
    const base = quickNavForRole(role, q);
    if (q.trim()) {
      const qv = q.trim().toLowerCase();
      const actionHits = roleActions.filter((a) => `${a.label} ${a.keywords ?? ""}`.toLowerCase().includes(qv));
      return [...actionHits, ...base];
    }
    const recent = recentIds
      .map((id) => base.find((b) => b.id === id))
      .filter((v): v is QuickNavItem => Boolean(v))
      .slice(0, 4);
    const withoutRecent = base.filter((b) => !recent.some((r) => r.id === b.id));
    return [...recent, ...roleActions, ...withoutRecent];
  }, [role, q, roleActions, recentIds]);

  useEffect(() => {
    setActive(0);
  }, [q, open]);

  const close = useCallback(() => {
    onOpenChange(false);
    setQ("");
  }, [onOpenChange]);

  const go = useCallback(
    (to: string, id?: string) => {
      if (id) {
        try {
          const next = [id, ...recentIds.filter((x) => x !== id)].slice(0, 8);
          localStorage.setItem(recentKey, JSON.stringify(next));
          setRecentIds(next);
        } catch {
          /* ignore */
        }
      }
      navigate(to);
      close();
    },
    [navigate, close, recentIds, recentKey],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
        return;
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, onOpenChange]);

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 0);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  useFocusTrap(dialogRef, open);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, Math.max(0, matches.length - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" && matches.length > 0 && matches[active]) {
      e.preventDefault();
      go(matches[active]!.to, matches[active]!.id);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center bg-black/50 p-4 pt-[min(20vh,8rem)] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Jump to page"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl ring-1 ring-black/5 dark:ring-white/10"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
          <input
            ref={inputRef}
            type="search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Jump to page…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm text-surface-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0"
            aria-label="Filter pages"
          />
          <button
            type="button"
            onClick={close}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-surface-foreground cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div ref={listRef} className="max-h-[min(60vh,22rem)] overflow-y-auto py-1">
          {matches.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">No pages match your search.</p>
          ) : (
            matches.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                data-idx={idx}
                onClick={() => go(item.to, item.id)}
                onMouseEnter={() => setActive(idx)}
                className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm cursor-pointer transition-colors ${
                  idx === active ? "bg-primary-50 text-primary-900 dark:bg-primary-950/60 dark:text-primary-100" : "text-surface-foreground hover:bg-muted/80"
                }`}
              >
                <span className="font-medium">{item.label}</span>
                {idx === active && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />}
              </button>
            ))
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-muted/30 px-4 py-2.5 text-[10px] text-muted-foreground">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <kbd className="rounded border border-border bg-surface px-1 py-0.5 font-mono">↑</kbd>
            <kbd className="rounded border border-border bg-surface px-1 py-0.5 font-mono">↓</kbd>
            <span>move</span>
            <span className="text-border">·</span>
            <kbd className="rounded border border-border bg-surface px-1 py-0.5 font-mono">Enter</kbd>
            <span>open</span>
          </span>
          <span className="flex items-center gap-2">
            <kbd className="rounded border border-border bg-surface px-1 py-0.5 font-mono">Esc</kbd>
            <span>close</span>
            <span className="hidden text-border sm:inline">·</span>
            <span className="hidden sm:inline font-medium text-surface-foreground/80">Ctrl/⌘ K toggles</span>
          </span>
        </div>
      </div>
    </div>
  );
}
