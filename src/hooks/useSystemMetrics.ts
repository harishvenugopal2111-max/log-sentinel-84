import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RealMetric {
  id: string;
  cpu_usage: number;
  memory_usage: number;
  process_count: number;
  created_at: string;
}

export function useSystemMetrics() {
  const [metrics, setMetrics] = useState<RealMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    const { data, error } = await supabase
      .from('system_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setMetrics((data as RealMetric[]).reverse());
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchMetrics();

    const channel = supabase
      .channel('metrics-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'system_metrics' },
        (payload) => {
          const m = payload.new as RealMetric;
          setMetrics((prev) => [...prev.slice(-49), m]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMetrics]);

  return { metrics, isLoading, refetch: fetchMetrics };
}
