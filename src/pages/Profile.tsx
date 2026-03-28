import { useState } from 'react';
import { User, Mail, Shield, Calendar, Save, Crown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';

export default function Profile() {
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const { profile, isLoading, updateProfile } = useProfile();
  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize display name from profile
  if (profile && !initialized) {
    setDisplayName(profile.display_name || profile.email?.split('@')[0] || '');
    setInitialized(true);
  }

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await updateProfile({ display_name: displayName }) || {};
    setIsSaving(false);
    if (error) {
      toast({ title: '❌ Error', description: 'Failed to save profile.', variant: 'destructive' });
    } else {
      toast({ title: '✅ Profile Updated', description: 'Your profile has been saved.' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account information</p>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        {/* Avatar section */}
        <div className="flex items-center gap-6 rounded-xl border border-border bg-card p-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <User className="h-10 w-10 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">{displayName || profile?.email?.split('@')[0]}</h2>
              {isAdmin && (
                <span className="flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-xs font-semibold text-warning border border-warning/20">
                  <Crown className="h-3 w-3" />
                  Admin
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{profile?.email || user?.email}</span>
              <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" />{user?.role || 'user'}</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Edit Profile</h3>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Email</label>
              <input
                type="email"
                value={profile?.email || user?.email || ''}
                disabled
                className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
              />
              <p className="mt-1 text-[10px] text-muted-foreground">Email cannot be changed</p>
            </div>
          </div>
          <Button onClick={handleSave} className="gap-2" disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
