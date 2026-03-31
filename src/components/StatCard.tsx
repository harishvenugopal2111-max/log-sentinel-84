import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

export function StatCard({ title, value, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "rounded-xl border bg-card p-5 transition-all hover:scale-[1.02]",
        variant === 'destructive' && 'border-destructive/30 hover:border-destructive/50 hover:shadow-[0_0_20px_hsl(0_72%_56%/0.1)]',
        variant === 'warning' && 'border-warning/30 hover:border-warning/50 hover:shadow-[0_0_20px_hsl(38_92%_56%/0.1)]',
        variant === 'success' && 'border-success/30 hover:border-success/50 hover:shadow-[0_0_20px_hsl(142_72%_44%/0.1)]',
        variant === 'default' && 'border-border hover:border-primary/30 hover:shadow-[0_0_20px_hsl(160_84%_44%/0.1)]',
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            variant === 'success' && 'bg-success/10 text-success',
            variant === 'warning' && 'bg-warning/10 text-warning',
            variant === 'destructive' && 'bg-destructive/10 text-destructive',
            variant === 'default' && 'bg-primary/10 text-primary'
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-2 text-3xl font-bold text-foreground tracking-tight">{value}</p>
      {trend && (
        <p className="mt-1 text-xs text-muted-foreground">{trend}</p>
      )}
    </motion.div>
  );
}
