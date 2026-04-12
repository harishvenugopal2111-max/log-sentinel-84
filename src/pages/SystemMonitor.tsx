import { useSystemMetrics } from '@/hooks/useSystemMetrics';
import { MetricsChart } from '@/components/MetricsChart';
import { motion } from 'framer-motion';
import { Cpu, HardDrive, Activity, Download, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function SystemMonitor() {
  const { metrics, isLoading } = useSystemMetrics();
  const [showAgent, setShowAgent] = useState(false);

  const chartData = metrics.map((m) => ({
    time: new Date(m.created_at).toLocaleTimeString(),
    cpu: m.cpu_usage,
    memory: m.memory_usage,
    processes: m.process_count,
  }));

  const latest = metrics[metrics.length - 1];

  const agentScript = `#!/usr/bin/env python3
"""
Log Guardian - System Monitoring Agent
Collects real system metrics and sends to your Log Guardian dashboard.

Install: pip install psutil requests
Usage:   python monitor_agent.py
"""
import psutil, requests, time, json, sys

# ── Configuration ─────────────────────────────────────────
SUPABASE_URL = "${window.location.origin.includes('localhost') ? 'https://lbxvowgcptmrsjrbbsvp.supabase.co' : 'https://lbxvowgcptmrsjrbbsvp.supabase.co'}"
FUNCTION_URL = f"{SUPABASE_URL}/functions/v1/ingest-system-data"
INTERVAL = 5  # seconds

# ── Get your access token ─────────────────────────────────
# 1. Log in to your Log Guardian dashboard
# 2. Open browser DevTools → Console
# 3. Run: (await supabase.auth.getSession()).data.session.access_token
# 4. Paste it below:
ACCESS_TOKEN = "YOUR_ACCESS_TOKEN_HERE"

def collect_metrics():
    return {
        "cpu_usage": psutil.cpu_percent(interval=1),
        "memory_usage": psutil.virtual_memory().percent,
        "process_count": len(psutil.pids()),
    }

def send_metrics(data):
    try:
        r = requests.post(
            FUNCTION_URL,
            json=data,
            headers={
                "Authorization": f"Bearer {ACCESS_TOKEN}",
                "Content-Type": "application/json",
            },
            timeout=10,
        )
        result = r.json()
        anomalies = result.get("anomalies_detected", 0)
        status = f"✅ Sent | CPU: {data['cpu_usage']:.1f}% | MEM: {data['memory_usage']:.1f}% | Procs: {data['process_count']}"
        if anomalies > 0:
            status += f" | 🚨 {anomalies} anomalies detected!"
        print(status)
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    if ACCESS_TOKEN == "YOUR_ACCESS_TOKEN_HERE":
        print("⚠️  Please set your ACCESS_TOKEN first!")
        print("   See instructions in the script comments.")
        sys.exit(1)

    print("🛡️  Log Guardian System Monitor")
    print(f"   Sending metrics every {INTERVAL}s to {FUNCTION_URL}")
    print("   Press Ctrl+C to stop\\n")

    while True:
        data = collect_metrics()
        send_metrics(data)
        time.sleep(INTERVAL)
`;

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Monitor</h1>
          <p className="text-sm text-muted-foreground">Real-time metrics from your local monitoring agent</p>
        </div>
        <Dialog open={showAgent} onOpenChange={setShowAgent}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Get Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><Terminal className="h-5 w-5" /> Python Monitoring Agent</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Copy this script to your machine and run it to send real system metrics.</p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Install dependencies: <code className="bg-muted px-1 rounded">pip install psutil requests</code></li>
                <li>Save the script as <code className="bg-muted px-1 rounded">monitor_agent.py</code></li>
                <li>Get your access token from browser DevTools console</li>
                <li>Replace <code className="bg-muted px-1 rounded">YOUR_ACCESS_TOKEN_HERE</code> in the script</li>
                <li>Run: <code className="bg-muted px-1 rounded">python monitor_agent.py</code></li>
              </ol>
              <pre className="bg-muted rounded-lg p-4 text-xs overflow-auto max-h-96 font-mono whitespace-pre-wrap">{agentScript}</pre>
              <Button className="w-full" onClick={() => { navigator.clipboard.writeText(agentScript); }}>
                Copy to Clipboard
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Live Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Cpu className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground font-mono">{latest ? `${latest.cpu_usage.toFixed(1)}%` : '—'}</p>
              <p className="text-xs text-muted-foreground">CPU Usage</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <HardDrive className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground font-mono">{latest ? `${latest.memory_usage.toFixed(1)}%` : '—'}</p>
              <p className="text-xs text-muted-foreground">Memory Usage</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <Activity className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground font-mono">{latest ? latest.process_count : '—'}</p>
              <p className="text-xs text-muted-foreground">Processes</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      {chartData.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <MetricsChart data={chartData as any} dataKey="cpu" title="CPU Usage (Live)" color="hsl(160 84% 44%)" unit="%" />
          <MetricsChart data={chartData as any} dataKey="memory" title="Memory Usage (Live)" color="hsl(185 72% 48%)" unit="%" />
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <Terminal className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground font-medium">No metrics received yet</p>
          <p className="text-xs text-muted-foreground mt-1">Run the Python monitoring agent on your machine to start collecting real system data</p>
          <Button variant="outline" size="sm" className="mt-4 gap-2" onClick={() => setShowAgent(true)}>
            <Download className="h-3.5 w-3.5" /> Get Monitoring Agent
          </Button>
        </div>
      )}

      {metrics.length > 0 && (
        <div className="text-xs text-muted-foreground text-center">
          Showing {metrics.length} data points • Last update: {latest ? new Date(latest.created_at).toLocaleString() : '—'}
        </div>
      )}
    </div>
  );
}
