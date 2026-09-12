
'use client';

import { useEffect, useState } from 'react';
import { Activity, ShieldCheck } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSecurityEvents } from '@/lib/security-telemetry';

type TelemetryEvent = ReturnType<typeof getSecurityEvents>[number];

function getSeverity(score: number) {
  if (score >= 75) return 'Critical';
  if (score >= 50) return 'High';
  if (score >= 25) return 'Medium';
  return 'Low';
}

function getSeverityStyle(severity: string) {
  switch (severity) {
    case 'Critical':
      return 'bg-destructive/15 text-destructive ring-destructive/30';
    case 'High':
      return 'bg-destructive/10 text-destructive ring-destructive/20';
    case 'Medium':
      return 'bg-warning/10 text-warning ring-warning/20';
    default:
      return 'bg-success/10 text-success ring-success/20';
  }
}

function getStatus(event: TelemetryEvent) {
  switch (event.decision) {
    case 'BLOCK':
      return 'Blocked';
    case 'REVIEW':
      return 'Review';
    default:
      return 'Allowed';
  }
}

function getStatusStyle(status: string) {
  switch (status) {
    case 'Blocked':
      return 'text-destructive';
    case 'Review':
      return 'text-warning';
    default:
      return 'text-success';
  }
}

function formatTime(timestamp: string) {
  const date = new Date(timestamp);
  const diff = Date.now() - date.getTime();

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  const seconds = Math.floor(diff / 1000);

  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatThreat(threat: string | null | undefined) {
  if (!threat) {
    return 'Security request analyzed';
  }

  return threat
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function RecentActivity() {
  const [events, setEvents] = useState<TelemetryEvent[]>([]);

  useEffect(() => {
    const loadEvents = () => {
      setEvents(getSecurityEvents());
    };

    loadEvents();

    window.addEventListener('storage', loadEvents);

    const interval = window.setInterval(loadEvents, 3000);

    return () => {
      window.removeEventListener('storage', loadEvents);
      window.clearInterval(interval);
    };
  }, []);

  const recentEvents = events.slice(0, 8);

  return (
    <Card className="border-border bg-card/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-semibold">
            Recent Security Activity
          </CardTitle>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Live
          </span>
        </div>

        <span className="text-[11px] text-muted-foreground">
          {events.length} event{events.length === 1 ? '' : 's'}
        </span>
      </CardHeader>

      <CardContent className="space-y-1 p-0">
        {recentEvents.length > 0 ? (
          recentEvents.map((event, index) => {
            const severity = getSeverity(event.finalScore);
            const status = getStatus(event);

            return (
              <div
                key={event.id}
                className={cn(
                  'flex items-center gap-3 px-6 py-3 transition-colors hover:bg-secondary/50',
                  index !== recentEvents.length - 1 &&
                    'border-b border-border/50'
                )}
              >
                <span
                  className={cn(
                    'inline-flex h-1.5 w-1.5 shrink-0 rounded-full ring-2',
                    severity === 'Critical' &&
                      'bg-destructive ring-destructive/20',
                    severity === 'High' &&
                      'bg-destructive ring-destructive/20',
                    severity === 'Medium' &&
                      'bg-warning ring-warning/20',
                    severity === 'Low' &&
                      'bg-success ring-success/20'
                  )}
                />

                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm text-foreground">
                    {formatThreat(event.primaryThreat)}
                  </span>

                  <span className="text-xs text-muted-foreground">
                    {formatTime(event.timestamp)}
                  </span>
                </div>

                <span
                  className={cn(
                    'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1',
                    getSeverityStyle(severity)
                  )}
                >
                  {severity}
                </span>

                <span
                  className={cn(
                    'hidden w-16 shrink-0 text-right text-xs font-medium sm:block',
                    getStatusStyle(status)
                  )}
                >
                  {status}
                </span>
              </div>
            );
          })
        ) : (
          <div className="flex min-h-[180px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>

            <p className="text-sm font-medium text-foreground">
              Gateway ready
            </p>

            <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
              Security events will appear here automatically when prompts are
              analyzed through PromptShield.
            </p>
          </div>
        )}

        {events.length > 8 && (
          <div className="flex items-center justify-center gap-2 border-t border-border/50 px-6 py-3 text-xs text-muted-foreground">
            <Activity className="h-3.5 w-3.5" />
            Showing the 8 most recent events
          </div>
        )}
      </CardContent>
    </Card>
  );
}
