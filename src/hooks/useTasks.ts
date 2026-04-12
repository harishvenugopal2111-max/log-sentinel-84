import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Task {
  id: string;
  user_id: string;
  type: string;
  severity: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Closed';
  description: string | null;
  anomaly_source: string | null;
  cpu_at_detection: number | null;
  memory_at_detection: number | null;
  created_at: string;
  updated_at: string;
}

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (!error && data) {
      setTasks(data as Task[]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchTasks();

    const channel = supabase
      .channel('tasks-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTasks]);

  const updateTaskStatus = useCallback(async (taskId: string, status: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', taskId);
    if (error) console.error('Failed to update task:', error);
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);
    if (error) console.error('Failed to delete task:', error);
  }, []);

  const createTask = useCallback(async (type: string, severity: string, description: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        type,
        severity,
        description,
        status: 'Open',
      });
    if (error) console.error('Failed to create task:', error);
  }, [user]);

  return { tasks, isLoading, updateTaskStatus, deleteTask, createTask, refetch: fetchTasks };
}
