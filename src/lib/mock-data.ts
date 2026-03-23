export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: string;
  message: string;
  isAnomaly: boolean;
}

export interface SystemMetric {
  time: string;
  cpu: number;
  memory: number;
  requests: number;
  errors: number;
}

const sources = ['api-gateway', 'auth-service', 'db-manager', 'cache-layer', 'worker-1', 'worker-2', 'load-balancer', 'scheduler'];

const messages: Record<LogLevel, string[]> = {
  INFO: [
    'Request processed successfully',
    'Cache hit for key user:session',
    'Health check passed',
    'Connection pool stable at 42 connections',
    'Scheduled job completed in 234ms',
    'New session created for user',
  ],
  WARN: [
    'Response time exceeded 2000ms threshold',
    'Memory usage at 78% capacity',
    'Rate limit approaching for IP range',
    'Certificate expires in 14 days',
    'Retry attempt 2/3 for downstream service',
  ],
  ERROR: [
    'Connection refused to database replica',
    'Failed to parse request body: unexpected token',
    'Authentication token expired mid-request',
    'Disk I/O timeout after 5000ms',
    'Unhandled exception in request pipeline',
  ],
  CRITICAL: [
    'PRIMARY DATABASE UNREACHABLE - failover initiated',
    'Out of memory: process killed by OOM killer',
    'SSL certificate verification failed',
    'Data corruption detected in write-ahead log',
    'Cascading failure across service mesh',
  ],
};

let logCounter = 0;

export function generateLogEntry(): LogEntry {
  const rand = Math.random();
  let level: LogLevel;
  if (rand < 0.5) level = 'INFO';
  else if (rand < 0.75) level = 'WARN';
  else if (rand < 0.92) level = 'ERROR';
  else level = 'CRITICAL';

  const levelMessages = messages[level];
  const message = levelMessages[Math.floor(Math.random() * levelMessages.length)];
  const source = sources[Math.floor(Math.random() * sources.length)];

  logCounter++;
  return {
    id: `log-${logCounter}-${Date.now()}`,
    timestamp: new Date().toISOString(),
    level,
    source,
    message,
    isAnomaly: level === 'CRITICAL' || (level === 'ERROR' && Math.random() > 0.5),
  };
}

export function generateMetrics(count: number): SystemMetric[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const time = new Date(now - (count - i) * 5000).toLocaleTimeString();
    return {
      time,
      cpu: 20 + Math.random() * 60 + (Math.random() > 0.9 ? 20 : 0),
      memory: 40 + Math.random() * 30,
      requests: Math.floor(80 + Math.random() * 200),
      errors: Math.floor(Math.random() * (Math.random() > 0.8 ? 25 : 8)),
    };
  });
}

export function generateInitialLogs(count: number): LogEntry[] {
  return Array.from({ length: count }, () => generateLogEntry());
}
