import { useCallback, useEffect, useState } from 'react';

type TmuxSession = {
  name: string;
  windows: number;
  attached: boolean;
  created: string;
};

type TmuxSessionSelectorProps = {
  onSelect: (sessionName: string) => void;
};

export default function TmuxSessionSelector({ onSelect }: TmuxSessionSelectorProps) {
  const [sessions, setSessions] = useState<TmuxSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('auth-token') || '';
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch('/api/tmux-sessions', { headers });
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-400">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-indigo-500" />
        Loading tmux sessions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 text-center text-sm text-red-400">
        Error: {error}
        <button
          type="button"
          onClick={fetchSessions}
          className="ml-2 text-indigo-400 underline hover:text-indigo-300"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          📟 Tmux Sessions
        </h4>
        <button
          type="button"
          onClick={fetchSessions}
          className="rounded px-2 py-0.5 text-xs text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300"
        >
          ↻ Refresh
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-700 py-6 text-center">
          <p className="text-sm text-gray-500">No tmux sessions</p>
          <button
            type="button"
            onClick={() => onSelect('main')}
            className="mt-2 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700"
          >
            + Create &quot;main&quot;
          </button>
        </div>
      ) : (
        <div className="space-y-1.5">
          {sessions.map((s) => (
            <button
              type="button"
              key={s.name}
              onClick={() => onSelect(s.name)}
              className="flex w-full items-center justify-between rounded-lg border border-gray-700/60 bg-gray-800/60 px-4 py-3 text-left transition-all hover:border-indigo-500/50 hover:bg-gray-800 active:scale-[0.98]"
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-white">{s.name}</div>
                <div className="text-xs text-gray-500">
                  {s.windows} window{s.windows !== 1 ? 's' : ''}
                </div>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                  s.attached
                    ? 'bg-emerald-900/40 text-emerald-400'
                    : 'bg-gray-700/60 text-gray-500'
                }`}
              >
                {s.attached ? '● attached' : '○ detached'}
              </span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              const name = window.prompt('New tmux session name:', '');
              if (name && /^[a-zA-Z0-9_-]+$/.test(name)) {
                onSelect(name);
              }
            }}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-700 py-2.5 text-xs text-gray-500 transition-colors hover:border-gray-600 hover:text-gray-400"
          >
            + New session
          </button>
        </div>
      )}
    </div>
  );
}
