import { useCallback, useEffect, useState } from 'react';
import { Terminal } from 'lucide-react';

type TmuxSession = {
  name: string;
  windows: number;
  attached: boolean;
};

type Props = {
  onSelect: (sessionName: string) => void;
};

export default function TmuxSidebarSection({ onSelect }: Props) {
  const [sessions, setSessions] = useState<TmuxSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth-token') || '';
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch('/api/tmux-sessions', { headers });
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  if (loading || sessions.length === 0) return null;

  return (
    <div className="border-t border-border/50 px-2 py-2">
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:bg-accent/50"
      >
        <Terminal className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">Terminal</span>
        <span className="text-[10px] font-normal">{collapsed ? '▸' : '▾'}</span>
      </button>

      {!collapsed && (
        <div className="mt-1 space-y-0.5">
          {sessions.map((s) => (
            <button
              key={s.name}
              onClick={() => onSelect(s.name)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-accent/60 active:scale-[0.98]"
            >
              <span
                className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                  s.attached ? 'bg-green-500' : 'bg-gray-500'
                }`}
              />
              <span className="flex-1 truncate">{s.name}</span>
              <span className="text-[10px] text-muted-foreground">
                {s.windows}w
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
