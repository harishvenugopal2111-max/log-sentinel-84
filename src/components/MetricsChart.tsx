import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { type SystemMetric } from '@/lib/mock-data';
import { motion } from 'framer-motion';

interface MetricsChartProps {
  data: SystemMetric[];
  dataKey: keyof SystemMetric;
  title: string;
  color: string;
  unit?: string;
}

export function MetricsChart({ data, dataKey, title, color, unit = '' }: MetricsChartProps) {
  const latestValue = data.length > 0 ? data[data.length - 1][dataKey] : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/20"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-foreground font-mono">
            {typeof latestValue === 'number' ? latestValue.toFixed(1) : latestValue}{unit}
          </span>
          <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: color }} />
        </div>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`grad-${String(dataKey)}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 18%)" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: 'hsl(215 12% 52%)' }}
            axisLine={{ stroke: 'hsl(220 14% 18%)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'hsl(215 12% 52%)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(220 18% 10%)',
              border: '1px solid hsl(220 14% 18%)',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'hsl(210 20% 92%)',
            }}
            formatter={(value: number) => [`${value.toFixed(1)}${unit}`, title]}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#grad-${String(dataKey)})`}
            animationDuration={300}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
