import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

export function StatCard({ title, value, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg',
            variant === 'success' && 'bg-success/10 text-success',
            variant === 'warning' && 'bg-warning/10 text-warning',
            variant === 'destructive' && 'bg-destructive/10 text-destructive',
            variant === 'default' && 'bg-primary/10 text-primary'
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      {trend && (
        <p className="mt-1 text-xs text-muted-foreground">{trend}</p>
      )}
    </div>
  );
}
