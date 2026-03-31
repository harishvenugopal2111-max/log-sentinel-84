import { type LogEntry } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { AlertTriangle, Info, AlertCircle, Skull } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const levelConfig = {
  INFO: { icon: Info, class: 'text-primary', bg: 'bg-primary/10' },
  WARN: { icon: AlertTriangle, class: 'text-warning', bg: 'bg-warning/10' },
  ERROR: { icon: AlertCircle, class: 'text-destructive', bg: 'bg-destructive/10' },
  CRITICAL: { icon: Skull, class: 'text-destructive', bg: 'bg-destructive/10' },
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
        <thead className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur-sm">
          <tr className="text-left text-xs text-muted-foreground">
            <th className="px-4 py-3 font-medium">Level</th>
            <th className="px-4 py-3 font-medium">Timestamp</th>
            <th className="px-4 py-3 font-medium">Source</th>
            <th className="px-4 py-3 font-medium">Message</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence initial={false}>
            {logs.map((log, idx) => {
              const config = levelConfig[log.level];
              const Icon = config.icon;
              return (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: idx < 5 ? idx * 0.03 : 0 }}
                  className={cn(
                    'border-b border-border/50 transition-colors',
                    log.isAnomaly
                      ? 'bg-destructive/5 hover:bg-destructive/10'
                      : 'hover:bg-secondary/50'
                  )}
                >
                  <td className="px-4 py-2.5">
                    <div className={cn('flex items-center gap-2', config.class)}>
                      <div className={cn('flex h-6 w-6 items-center justify-center rounded-md', config.bg)}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-mono text-xs font-semibold">{log.level}</span>
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
                    <div className="flex items-center gap-2">
                      <span className="flex-1">{log.message}</span>
                      {log.isAnomaly && (
                        <span className="inline-flex items-center gap-1 shrink-0 rounded-full bg-destructive/20 px-2 py-0.5 text-[10px] font-bold text-destructive border border-destructive/30 animate-pulse">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          ANOMALY
                        </span>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
      {logs.length === 0 && (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          No logs to display
        </div>
      )}
    </div>
  );
}
