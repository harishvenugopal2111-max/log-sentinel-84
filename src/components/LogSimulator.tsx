import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { type LogLevel } from '@/lib/mock-data';
import { Send, Zap } from 'lucide-react';

interface LogSimulatorProps {
  onSubmit: (level: LogLevel, source: string, message: string) => void;
  onBurst: () => void;
}

export function LogSimulator({ onSubmit, onBurst }: LogSimulatorProps) {
  const [level, setLevel] = useState<LogLevel>('INFO');
  const [source, setSource] = useState('api-gateway');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSubmit(level, source, message);
    setMessage('');
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Log Simulator</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-3">
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as LogLevel)}
            className="rounded-lg border border-border bg-muted px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="INFO">INFO</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="rounded-lg border border-border bg-muted px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="api-gateway">api-gateway</option>
            <option value="auth-service">auth-service</option>
            <option value="db-manager">db-manager</option>
            <option value="worker-1">worker-1</option>
          </select>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter log message..."
            className="flex-1 rounded-lg border border-border bg-muted px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button type="submit" size="sm" className="gap-1.5">
            <Send className="h-3.5 w-3.5" />
            Send
          </Button>
          <Button type="button" size="sm" variant="secondary" className="gap-1.5" onClick={onBurst}>
            <Zap className="h-3.5 w-3.5" />
            Burst
          </Button>
        </div>
      </form>
    </div>
  );
}
