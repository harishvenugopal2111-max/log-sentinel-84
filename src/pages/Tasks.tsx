import { useState } from 'react';
import { useTasks, type Task } from '@/hooks/useTasks';
import { motion } from 'framer-motion';
import { ClipboardList, Plus, Trash2, AlertTriangle, CheckCircle2, Clock, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const severityColors: Record<string, string> = {
  High: 'bg-destructive/10 text-destructive border-destructive/30',
  Medium: 'bg-warning/10 text-warning border-warning/30',
  Low: 'bg-primary/10 text-primary border-primary/30',
};

const statusIcons: Record<string, React.ReactNode> = {
  Open: <AlertTriangle className="h-3.5 w-3.5 text-destructive" />,
  'In Progress': <Clock className="h-3.5 w-3.5 text-warning" />,
  Closed: <CheckCircle2 className="h-3.5 w-3.5 text-primary" />,
};

export default function Tasks() {
  const { tasks, isLoading, updateTaskStatus, deleteTask, createTask } = useTasks();
  const { toast } = useToast();
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({ type: '', severity: 'Medium', description: '' });

  const filtered = tasks.filter((t) => {
    if (severityFilter !== 'all' && t.severity !== severityFilter) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    return true;
  });

  const openCount = tasks.filter((t) => t.status === 'Open').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;
  const closedCount = tasks.filter((t) => t.status === 'Closed').length;

  const handleCreate = async () => {
    if (!newTask.type.trim()) return;
    await createTask(newTask.type, newTask.severity, newTask.description);
    setNewTask({ type: '', severity: 'Medium', description: '' });
    setDialogOpen(false);
    toast({ title: 'Task created' });
  };

  const handleStatusChange = async (id: string, status: string) => {
    await updateTaskStatus(id, status);
    toast({ title: `Task marked as ${status}` });
  };

  const handleDelete = async (id: string) => {
    await deleteTask(id);
    toast({ title: 'Task deleted', variant: 'destructive' });
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Task Manager</h1>
          <p className="text-sm text-muted-foreground">Auto-created from anomaly detection • Manage system incidents</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> New Task</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Task</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <Input placeholder="Task type (e.g. High CPU Usage)" value={newTask.type} onChange={(e) => setNewTask({ ...newTask, type: e.target.value })} />
              <Select value={newTask.severity} onValueChange={(v) => setNewTask({ ...newTask, severity: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Description" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} />
              <Button onClick={handleCreate} className="w-full">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-destructive/30 bg-card p-4 text-center">
          <p className="text-2xl font-bold text-destructive">{openCount}</p>
          <p className="text-xs text-muted-foreground">Open</p>
        </div>
        <div className="rounded-xl border border-warning/30 bg-card p-4 text-center">
          <p className="text-2xl font-bold text-warning">{inProgressCount}</p>
          <p className="text-xs text-muted-foreground">In Progress</p>
        </div>
        <div className="rounded-xl border border-primary/30 bg-card p-4 text-center">
          <p className="text-2xl font-bold text-primary">{closedCount}</p>
          <p className="text-xs text-muted-foreground">Closed</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} tasks</span>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading tasks...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No tasks found</p>
            <p className="text-xs text-muted-foreground">Tasks are auto-created when anomalies are detected</p>
          </div>
        ) : (
          filtered.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-xl border border-border bg-card p-4 hover:border-primary/20 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {statusIcons[task.status]}
                    <span className="font-semibold text-sm text-foreground">{task.type}</span>
                    <Badge variant="outline" className={severityColors[task.severity]}>{task.severity}</Badge>
                    {task.anomaly_source && (
                      <Badge variant="outline" className="text-[10px] border-muted-foreground/20 text-muted-foreground">auto</Badge>
                    )}
                  </div>
                  {task.description && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{task.description}</p>}
                  <div className="flex gap-3 text-[10px] text-muted-foreground">
                    <span>{new Date(task.created_at).toLocaleString()}</span>
                    {task.cpu_at_detection != null && <span>CPU: {task.cpu_at_detection.toFixed(1)}%</span>}
                    {task.memory_at_detection != null && <span>MEM: {task.memory_at_detection.toFixed(1)}%</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Select value={task.status} onValueChange={(v) => handleStatusChange(task.id, v)}>
                    <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(task.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
