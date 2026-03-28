import { useState } from 'react';
import { useLogs } from '@/hooks/useLogs';
import { LogTable } from '@/components/LogTable';
import { Search, Filter, Loader2 } from 'lucide-react';
import type { LogLevel } from '@/lib/mock-data';

export default function Logs() {
  const { logs, isLoading } = useLogs();
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<LogLevel | 'ALL'>('ALL');

  const filteredLogs = logs.filter((log) => {
    const matchesLevel = levelFilter === 'ALL' || log.level === levelFilter;
    const matchesSearch =
      !search ||
      log.message.toLowerCase().includes(search.toLowerCase()) ||
      log.source.toLowerCase().includes(search.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Log Explorer</h1>
        <p className="text-sm text-muted-foreground">Search and filter system logs</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs..."
            className="w-full rounded-lg border border-border bg-muted py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {(['ALL', 'INFO', 'WARN', 'ERROR', 'CRITICAL'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setLevelFilter(level)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                levelFilter === level
                  ? 'bg-primary/10 text-primary border border-primary/30'
                  : 'bg-secondary text-muted-foreground border border-border hover:text-foreground'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        Showing {filteredLogs.length} of {logs.length} logs
      </div>

      <LogTable logs={filteredLogs} maxHeight="calc(100vh - 280px)" />
    </div>
  );
}
