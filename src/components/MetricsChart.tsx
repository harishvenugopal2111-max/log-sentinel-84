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

interface MetricsChartProps {
  data: SystemMetric[];
  dataKey: keyof SystemMetric;
  title: string;
  color: string;
  unit?: string;
}

export function MetricsChart({ data, dataKey, title, color, unit = '' }: MetricsChartProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">{title}</h3>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
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
            fill={`url(#grad-${dataKey})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
