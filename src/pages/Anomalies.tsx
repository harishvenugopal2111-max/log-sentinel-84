import { LogTable } from '@/components/LogTable';
import { useLogs } from '@/hooks/useLogs';
import { AlertTriangle, Brain, TrendingUp, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function Anomalies() {
  const { logs } = useLogs();
  const anomalies = logs.filter((l) => l.isAnomaly);
  const errorAnomalies = anomalies.filter((l) => l.level === 'ERROR').length;
  const criticalAnomalies = anomalies.filter((l) => l.level === 'CRITICAL').length;
  const warnAnomalies = anomalies.filter((l) => l.level === 'WARN').length;

  const pieData = [
    { name: 'CRITICAL', value: criticalAnomalies, color: 'hsl(0 72% 56%)' },
    { name: 'ERROR', value: errorAnomalies, color: 'hsl(38 92% 56%)' },
    { name: 'WARN', value: warnAnomalies, color: 'hsl(38 92% 70%)' },
  ].filter((d) => d.value > 0);

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Anomaly Detection</h1>
        <p className="text-sm text-muted-foreground">AI-powered anomaly detection (Isolation Forest via Lovable AI)</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
          className="rounded-xl border border-destructive/30 bg-card p-5 hover:border-destructive/50 transition-all">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{anomalies.length}</p>
              <p className="text-xs text-muted-foreground">Total Anomalies</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-all">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">AI Model</p>
              <p className="text-xs text-muted-foreground">Isolation Forest</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-xl border border-warning/30 bg-card p-5 hover:border-warning/50 transition-all">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <TrendingUp className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {((anomalies.length / Math.max(logs.length, 1)) * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">Anomaly Rate</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-all">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Shield className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{logs.length - anomalies.length}</p>
              <p className="text-xs text-muted-foreground">Normal Logs</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Distribution Chart */}
      {pieData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Anomaly Distribution by Severity</h3>
          <div className="flex items-center gap-8">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" strokeWidth={0}>
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(220 18% 10%)',
                    border: '1px solid hsl(220 14% 18%)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'hsl(210 20% 92%)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="font-bold text-foreground">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Detected Anomalies</h2>
        <LogTable logs={anomalies} maxHeight="calc(100vh - 500px)" />
      </div>
    </div>
  );
}
