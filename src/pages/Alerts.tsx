import { useState } from 'react';
import { Bell, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  enabled: boolean;
  lastTriggered?: string;
}

const defaultRules: AlertRule[] = [
  { id: '1', name: 'Critical Error Alert', condition: 'Level = CRITICAL', enabled: true, lastTriggered: '2 min ago' },
  { id: '2', name: 'High Error Rate', condition: 'Error rate > 20%', enabled: true, lastTriggered: '15 min ago' },
  { id: '3', name: 'Service Down', condition: 'Health check failed', enabled: false },
  { id: '4', name: 'Memory Threshold', condition: 'Memory > 90%', enabled: true, lastTriggered: '1 hour ago' },
];

export default function Alerts() {
  const [rules, setRules] = useState(defaultRules);
  const { toast } = useToast();

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const sendTestAlert = () => {
    toast({
      title: '📧 Test Alert Sent',
      description: 'A test alert email would be sent to your registered email address.',
    });
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alerts</h1>
          <p className="text-sm text-muted-foreground">Configure alert rules and email notifications</p>
        </div>
        <Button onClick={sendTestAlert} className="gap-2">
          <Mail className="h-4 w-4" />
          Send Test Alert
        </Button>
      </div>

      <div className="space-y-3">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="flex items-center justify-between rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30"
          >
            <div className="flex items-center gap-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${rule.enabled ? 'bg-primary/10' : 'bg-muted'}`}>
                <Bell className={`h-5 w-5 ${rule.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className="font-medium text-foreground">{rule.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{rule.condition}</p>
                {rule.lastTriggered && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Last triggered: {rule.lastTriggered}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {rule.enabled ? (
                <CheckCircle className="h-4 w-4 text-success" />
              ) : (
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              )}
              <button
                onClick={() => toggleRule(rule.id)}
                className={`relative h-6 w-11 rounded-full transition-colors ${rule.enabled ? 'bg-primary' : 'bg-muted'}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-foreground transition-transform ${
                    rule.enabled ? 'left-[22px]' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
