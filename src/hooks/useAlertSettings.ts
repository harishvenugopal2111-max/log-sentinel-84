import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AlertSettings {
  id: string;
  user_id: string;
  email_alerts_enabled: boolean;
  alert_on_critical: boolean;
  alert_on_error: boolean;
  alert_on_anomaly: boolean;
}

export function useAlertSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AlertSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('alert_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setSettings(data as AlertSettings);
      }
      setIsLoading(false);
    };

    fetchSettings();
  }, [user]);

  const updateSettings = useCallback(async (updates: Partial<AlertSettings>) => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('alert_settings')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (!error && data) {
      setSettings(data as AlertSettings);
    }
    return { data, error };
  }, [user]);

  return { settings, isLoading, updateSettings };
}
