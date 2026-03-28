import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { LogEntry, LogLevel } from '@/lib/mock-data';

export function useLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch logs from database
  const fetchLogs = useCallback(async () => {
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (!error && data) {
      setLogs(data.map((log: any) => ({
        id: log.id,
        timestamp: log.created_at,
        level: log.level as LogLevel,
        source: log.source,
        message: log.message,
        isAnomaly: log.is_anomaly,
      })));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchLogs();

    // Subscribe to realtime log inserts
    const channel = supabase
      .channel('logs-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'logs' },
        (payload) => {
          const log = payload.new as any;
          const entry: LogEntry = {
            id: log.id,
            timestamp: log.created_at,
            level: log.level as LogLevel,
            source: log.source,
            message: log.message,
            isAnomaly: log.is_anomaly,
          };
          setLogs((prev) => [entry, ...prev].slice(0, 500));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLogs]);

  // Insert a log entry
  const insertLog = useCallback(async (level: LogLevel, source: string, message: string) => {
    if (!user) return null;
    
    const isAnomaly = level === 'CRITICAL' || (level === 'ERROR' && Math.random() > 0.5);
    
    const { data, error } = await supabase
      .from('logs')
      .insert({
        level,
        source,
        message,
        is_anomaly: isAnomaly,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to insert log:', error);
      return null;
    }

    // If anomaly, trigger alert
    if (isAnomaly && data) {
      try {
        await supabase.functions.invoke('send-anomaly-alert', {
          body: {
            logId: data.id,
            level,
            source,
            message,
            userEmail: user.email,
          },
        });
      } catch (err) {
        console.error('Failed to send anomaly alert:', err);
      }
    }

    return data;
  }, [user]);

  return { logs, isLoading, insertLog, refetch: fetchLogs };
}
