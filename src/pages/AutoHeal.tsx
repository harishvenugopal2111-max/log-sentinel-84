import { useState } from 'react';
import { Zap, Server, Cpu, RefreshCw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface HealAction {
  id: string;
  trigger: string;
  action: string;
  icon: typeof Server;
  status: 'idle' | 'running' | 'completed';
  lastRun?: string;
}

export default function AutoHeal() {
  const { toast } = useToast();
  const [actions, setActions] = useState<HealAction[]>([
    { id: '1', trigger: 'Server Down', action: 'Restart simulation', icon: Server, status: 'idle', lastRun: '30 min ago' },
    { id: '2', trigger: 'High CPU (>90%)', action: 'Scale simulation', icon: Cpu, status: 'idle', lastRun: '2 hours ago' },
    { id: '3', trigger: 'Memory Leak', action: 'Garbage collection trigger', icon: RefreshCw, status: 'idle' },
  ]);

  const runAction = (id: string) => {
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'running' as const } : a)));
    setTimeout(() => {
      setActions((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: 'completed' as const, lastRun: 'Just now' } : a
        )
      );
      toast({
        title: '✅ Auto-Heal Complete',
        description: 'The healing action has been simulated successfully.',
      });
    }, 2000);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Auto-Healing</h1>
        <p className="text-sm text-muted-foreground">Automated recovery actions for common failures</p>
      </div>

      <div className="space-y-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <div
              key={action.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                  <Icon className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{action.trigger}</p>
                  <p className="text-sm text-muted-foreground">{action.action}</p>
                  {action.lastRun && (
                    <p className="mt-1 text-xs text-muted-foreground">Last run: {action.lastRun}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {action.status === 'completed' && <CheckCircle className="h-5 w-5 text-success" />}
                <Button
                  onClick={() => runAction(action.id)}
                  disabled={action.status === 'running'}
                  variant="secondary"
                  className="gap-2"
                >
                  {action.status === 'running' ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Trigger
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
