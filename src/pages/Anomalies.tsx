import { useState, useEffect } from 'react';
import { LogTable } from '@/components/LogTable';
import { generateLogEntry, generateInitialLogs, type LogEntry } from '@/lib/mock-data';
import { AlertTriangle, Brain } from 'lucide-react';

export default function Anomalies() {
  const [logs, setLogs] = useState<LogEntry[]>(() => generateInitialLogs(100));

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs((prev) => [generateLogEntry(), ...prev].slice(0, 500));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const anomalies = logs.filter((l) => l.isAnomaly);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Anomaly Detection</h1>
        <p className="text-sm text-muted-foreground">ML-powered anomaly detection (Isolation Forest simulation)</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{anomalies.length}</p>
              <p className="text-xs text-muted-foreground">Anomalies Detected</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">Isolation Forest</p>
              <p className="text-xs text-muted-foreground">Detection Model</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {((anomalies.length / Math.max(logs.length, 1)) * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">Anomaly Rate</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Detected Anomalies</h2>
        <LogTable logs={anomalies} maxHeight="calc(100vh - 340px)" />
      </div>
    </div>
  );
}
