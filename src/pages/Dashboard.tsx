import { useState, useEffect, useCallback } from 'react';
import { Activity, AlertTriangle, ScrollText, Shield, Cpu, HardDrive } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { LogTable } from '@/components/LogTable';
import { MetricsChart } from '@/components/MetricsChart';
import { LogSimulator } from '@/components/LogSimulator';
import { useLogs } from '@/hooks/useLogs';
import {
  generateMetrics,
  type LogLevel,
  type SystemMetric,
} from '@/lib/mock-data';

export default function Dashboard() {
  const { logs, insertLog } = useLogs();
  const [metrics, setMetrics] = useState<SystemMetric[]>(() => generateMetrics(20));
  const [isStreaming, setIsStreaming] = useState(true);

  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      setMetrics((prev) => {
        const last = prev[prev.length - 1];
        const newMetric: SystemMetric = {
          time: new Date().toLocaleTimeString(),
          cpu: Math.max(5, Math.min(99, (last?.cpu ?? 50) + (Math.random() - 0.5) * 15)),
          memory: Math.max(20, Math.min(95, (last?.memory ?? 60) + (Math.random() - 0.5) * 5)),
          requests: Math.floor(80 + Math.random() * 200),
          errors: Math.floor(Math.random() * (Math.random() > 0.8 ? 25 : 8)),
        };
        return [...prev.slice(1), newMetric];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isStreaming]);

  const handleSimulatorSubmit = useCallback(async (level: LogLevel, source: string, message: string) => {
    await insertLog(level, source, message);
  }, [insertLog]);

  const handleBurst = useCallback(async () => {
    const sources = ['api-gateway', 'auth-service', 'db-manager', 'cache-layer', 'worker-1'];
    const messages = [
      'Connection refused to database replica',
      'PRIMARY DATABASE UNREACHABLE - failover initiated',
      'Out of memory: process killed by OOM killer',
      'SSL certificate verification failed',
      'Cascading failure across service mesh',
    ];
    for (let i = 0; i < 5; i++) {
      const levels: LogLevel[] = ['ERROR', 'CRITICAL', 'ERROR', 'CRITICAL', 'ERROR'];
      await insertLog(levels[i], sources[i], messages[i]);
    }
  }, [insertLog]);

  const anomalyCount = logs.filter((l) => l.isAnomaly).length;
  const errorCount = logs.filter((l) => l.level === 'ERROR' || l.level === 'CRITICAL').length;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Real-time system monitoring</p>
        </div>
        <button
          onClick={() => setIsStreaming(!isStreaming)}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-medium transition-all ${
            isStreaming
              ? 'border-primary/50 bg-primary/10 text-primary glow-primary'
              : 'border-border bg-secondary text-muted-foreground'
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${isStreaming ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
          {isStreaming ? 'Live' : 'Paused'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Logs" value={logs.length} icon={ScrollText} trend="Database entries" />
        <StatCard title="Anomalies" value={anomalyCount} icon={AlertTriangle} variant="destructive" trend="Auto-detected" />
        <StatCard title="Error Rate" value={`${((errorCount / Math.max(logs.length, 1)) * 100).toFixed(1)}%`} icon={Activity} variant="warning" />
        <StatCard title="System Health" value="Monitored" icon={Shield} variant="success" trend="All services" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MetricsChart data={metrics} dataKey="cpu" title="CPU Usage" color="hsl(160 84% 44%)" unit="%" />
        <MetricsChart data={metrics} dataKey="memory" title="Memory Usage" color="hsl(185 72% 48%)" unit="%" />
        <MetricsChart data={metrics} dataKey="requests" title="Requests / 5s" color="hsl(38 92% 56%)" />
        <MetricsChart data={metrics} dataKey="errors" title="Errors / 5s" color="hsl(0 72% 56%)" />
      </div>

      {/* Simulator + Live Logs */}
      <LogSimulator onSubmit={handleSimulatorSubmit} onBurst={handleBurst} />
      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Live Log Stream</h2>
        <LogTable logs={logs} maxHeight="360px" />
      </div>
    </div>
  );
}
