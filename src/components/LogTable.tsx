import { type LogEntry } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { AlertTriangle, Info, AlertCircle, Skull } from 'lucide-react';

const levelConfig = {
  INFO: { icon: Info, class: 'text-primary' },
  WARN: { icon: AlertTriangle, class: 'text-warning' },
  ERROR: { icon: AlertCircle, class: 'text-destructive' },
  CRITICAL: { icon: Skull, class: 'text-destructive' },
};

interface LogTableProps {
  logs: LogEntry[];
  maxHeight?: string;
}

export function LogTable({ logs, maxHeight = '400px' }: LogTableProps) {
  return (
    <div
      className="overflow-auto rounded-xl border border-border bg-card scrollbar-thin"
      style={{ maxHeight }}
    >
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 border-b border-border bg-card">
          <tr className="text-left text-xs text-muted-foreground">
            <th className="px-4 py-3 font-medium">Level</th>
            <th className="px-4 py-3 font-medium">Timestamp</th>
            <th className="px-4 py-3 font-medium">Source</th>
            <th className="px-4 py-3 font-medium">Message</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => {
            const config = levelConfig[log.level];
            const Icon = config.icon;
            return (
              <tr
                key={log.id}
                className={cn(
                  'border-b border-border/50 transition-colors',
                  log.isAnomaly
                    ? 'bg-destructive/5 hover:bg-destructive/10'
                    : 'hover:bg-secondary/50'
                )}
              >
                <td className="px-4 py-2.5">
                  <div className={cn('flex items-center gap-2 font-mono text-xs font-semibold', config.class)}>
                    <Icon className="h-3.5 w-3.5" />
                    {log.level}
                  </div>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </td>
                <td className="px-4 py-2.5">
                  <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-xs text-secondary-foreground">
                    {log.source}
                  </span>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-foreground">
                  {log.message}
                  {log.isAnomaly && (
                    <span className="ml-2 rounded bg-destructive/20 px-1.5 py-0.5 text-[10px] font-bold text-destructive">
                      ANOMALY
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
