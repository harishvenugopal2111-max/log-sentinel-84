import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { LogEntry, LogLevel } from '@/lib/mock-data';

export interface AnomalyResult {
  isAnomaly: boolean;
  score: number;
  reason?: string;
  method?: string;
}

export function useLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<(LogEntry & { anomalyScore?: number; anomalyReason?: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // AI-powered anomaly analysis + insert
  const insertLog = useCallback(async (level: LogLevel, source: string, message: string) => {
    if (!user) return null;

    // Call AI anomaly detection
    let anomalyResult: AnomalyResult = {
      isAnomaly: level === 'CRITICAL' || (level === 'ERROR' && Math.random() > 0.5),
      score: 0.5,
    };

    try {
      const { data: aiData, error: aiError } = await supabase.functions.invoke('analyze-anomaly', {
        body: { level, source, message },
      });
      if (!aiError && aiData) {
        anomalyResult = aiData as AnomalyResult;
      }
    } catch (err) {
      console.error('AI anomaly detection failed, using fallback:', err);
    }

    const { data, error } = await supabase
      .from('logs')
      .insert({
        level,
        source,
        message,
        is_anomaly: anomalyResult.isAnomaly,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to insert log:', error);
      return null;
    }

    // If anomaly, trigger alert
    if (anomalyResult.isAnomaly && data) {
      try {
        await supabase.functions.invoke('send-anomaly-alert', {
          body: {
            logId: data.id,
            level,
            source,
            message,
            userEmail: user.email,
            anomalyScore: anomalyResult.score,
            anomalyReason: anomalyResult.reason,
          },
        });
      } catch (err) {
        console.error('Failed to send anomaly alert:', err);
      }
    }

    return { ...data, anomalyScore: anomalyResult.score, anomalyReason: anomalyResult.reason };
  }, [user]);

  return { logs, isLoading, insertLog, refetch: fetchLogs };
}
