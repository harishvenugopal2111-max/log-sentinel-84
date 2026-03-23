import { useState } from 'react';
import { Settings, Bell, Shield, Database, Palette, Save, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    emailAlerts: true,
    anomalyDetection: true,
    autoHeal: false,
    logRetention: '30',
    refreshRate: '2',
    theme: 'dark',
    timezone: 'UTC',
  });

  const handleSave = () => {
    toast({ title: '✅ Settings Saved', description: 'Your preferences have been updated.' });
  };

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure Log Guardian preferences</p>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        {/* Notifications */}
        <section className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
          </div>
          <ToggleRow label="Email Alerts" desc="Receive alert emails for critical events" value={settings.emailAlerts} onChange={() => toggle('emailAlerts')} />
          <ToggleRow label="Anomaly Detection" desc="Enable ML-powered anomaly detection" value={settings.anomalyDetection} onChange={() => toggle('anomalyDetection')} />
          <ToggleRow label="Auto-Healing" desc="Automatically trigger recovery actions" value={settings.autoHeal} onChange={() => toggle('autoHeal')} />
        </section>

        {/* Data */}
        <section className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Data & Performance</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Log Retention (days)</label>
              <select
                value={settings.logRetention}
                onChange={(e) => setSettings((s) => ({ ...s, logRetention: e.target.value }))}
                className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Refresh Rate (seconds)</label>
              <select
                value={settings.refreshRate}
                onChange={(e) => setSettings((s) => ({ ...s, refreshRate: e.target.value }))}
                className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="1">1s</option>
                <option value="2">2s</option>
                <option value="5">5s</option>
                <option value="10">10s</option>
              </select>
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Appearance</h3>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Timezone</label>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <select
                value={settings.timezone}
                onChange={(e) => setSettings((s) => ({ ...s, timezone: e.target.value }))}
                className="flex-1 bg-transparent focus:outline-none"
              >
                <option value="UTC">UTC</option>
                <option value="EST">EST</option>
                <option value="PST">PST</option>
                <option value="CET">CET</option>
                <option value="IST">IST</option>
              </select>
            </div>
          </div>
        </section>

        <Button onClick={handleSave} className="w-full gap-2">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}

function ToggleRow({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative h-6 w-11 rounded-full transition-colors ${value ? 'bg-primary' : 'bg-muted'}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-foreground transition-transform ${
            value ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}
