import { useState, useEffect } from 'react';
import { LogTable } from '@/components/LogTable';
import { generateLogEntry, generateInitialLogs, type LogEntry, type LogLevel } from '@/lib/mock-data';
import { Search, Filter } from 'lucide-react';

export default function Logs() {
  const [logs, setLogs] = useState<LogEntry[]>(() => generateInitialLogs(50));
  const [filter, setFilter] = useState<LogLevel | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs((prev) => [generateLogEntry(), ...prev].slice(0, 500));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const filtered = logs.filter((log) => {
    if (filter !== 'ALL' && log.level !== filter) return false;
    if (search && !log.message.toLowerCase().includes(search.toLowerCase()) && !log.source.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Log Explorer</h1>
        <p className="text-sm text-muted-foreground">Browse and filter all system logs</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none w-64"
          />
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as LogLevel | 'ALL')}
            className="bg-transparent text-sm text-foreground focus:outline-none"
          >
            <option value="ALL">All Levels</option>
            <option value="INFO">INFO</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>
        <span className="text-xs text-muted-foreground">{filtered.length} entries</span>
      </div>

      <LogTable logs={filtered} maxHeight="calc(100vh - 220px)" />
    </div>
  );
}
