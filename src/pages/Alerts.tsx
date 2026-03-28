import { useState } from 'react';
import { Bell, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAlertSettings } from '@/hooks/useAlertSettings';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  settingKey: 'alert_on_critical' | 'alert_on_error' | 'alert_on_anomaly' | 'email_alerts_enabled';
  lastTriggered?: string;
}

const alertRules: AlertRule[] = [
  { id: '1', name: 'Critical Error Alert', condition: 'Level = CRITICAL', settingKey: 'alert_on_critical', lastTriggered: 'When detected' },
  { id: '2', name: 'Error Anomaly Alert', condition: 'Level = ERROR + Anomaly', settingKey: 'alert_on_error', lastTriggered: 'When detected' },
  { id: '3', name: 'All Anomaly Alerts', condition: 'is_anomaly = true', settingKey: 'alert_on_anomaly' },
  { id: '4', name: 'Email Notifications', condition: 'Master toggle', settingKey: 'email_alerts_enabled', lastTriggered: 'Always' },
];

export default function Alerts() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { settings, updateSettings } = useAlertSettings();

  const toggleRule = async (key: 'alert_on_critical' | 'alert_on_error' | 'alert_on_anomaly' | 'email_alerts_enabled') => {
    if (!settings) return;
    await updateSettings({ [key]: !settings[key] });
    toast({ title: '✅ Alert Updated', description: `Alert rule toggled.` });
  };

  const sendTestAlert = async () => {
    if (!user) return;
    try {
      const { error } = await supabase.functions.invoke('send-anomaly-alert', {
        body: {
          logId: crypto.randomUUID(),
          level: 'CRITICAL',
          source: 'test-alert',
          message: 'This is a test alert from Log Guardian. Your email notifications are working correctly.',
          userEmail: user.email,
        },
      });
      if (error) throw error;
      toast({
        title: '📧 Test Alert Sent',
        description: `Alert sent to ${user.email}. Check your inbox.`,
      });
    } catch (err) {
      toast({
        title: '❌ Failed',
        description: 'Could not send test alert. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alerts</h1>
          <p className="text-sm text-muted-foreground">Configure alert rules — emails sent to your login email</p>
        </div>
        <Button onClick={sendTestAlert} className="gap-2">
          <Mail className="h-4 w-4" />
          Send Test Alert
        </Button>
      </div>

      {user && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm text-foreground">
            📧 Alert emails will be sent to: <span className="font-mono font-semibold text-primary">{user.email}</span>
          </p>
        </div>
      )}

      <div className="space-y-3">
        {alertRules.map((rule) => {
          const isEnabled = settings ? settings[rule.settingKey] : true;
          return (
            <div
              key={rule.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isEnabled ? 'bg-primary/10' : 'bg-muted'}`}>
                  <Bell className={`h-5 w-5 ${isEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <p className="font-medium text-foreground">{rule.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{rule.condition}</p>
                  {rule.lastTriggered && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Triggers: {rule.lastTriggered}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isEnabled ? (
                  <CheckCircle className="h-4 w-4 text-success" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                )}
                <button
                  onClick={() => toggleRule(rule.settingKey)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${isEnabled ? 'bg-primary' : 'bg-muted'}`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-foreground transition-transform ${
                      isEnabled ? 'left-[22px]' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
