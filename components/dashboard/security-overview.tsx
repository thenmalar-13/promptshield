
'use client';

import { useEffect, useState } from 'react';
import {
  Shield,
  ScanLine,
  Ban,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { getSecurityEvents } from '@/lib/security-telemetry';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  sublabel: string;
  accent: string;
}

function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  accent,
}: StatCardProps) {
  return (
    <Card className="border-border bg-card/50 transition-colors hover:border-primary/30">
      <CardContent className="flex items-start justify-between p-5">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            {label}
          </p>

          <p className="text-2xl font-bold tracking-tight text-foreground">
            {value}
          </p>

          <p className="text-[11px] text-muted-foreground">{sublabel}</p>
        </div>

        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1"
          style={{
            backgroundColor: `${accent}1a`,
            color: accent,
            borderColor: `${accent}33`,
          }}
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

type TelemetryEvent = ReturnType<typeof getSecurityEvents>[number];

function calculateSecurityScore(events: TelemetryEvent[]) {
  if (events.length === 0) {
    return 100;
  }

  const averageRisk =
    events.reduce((sum, event) => sum + event.finalScore, 0) / events.length;

  return Math.max(
    0,
    Math.min(100, Math.round(100 - averageRisk * 0.65))
  );
}

export function SecurityOverview() {
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

  const promptsScanned = events.length;

  const threatsBlocked = events.filter(
    (event) => event.decision === 'BLOCK'
  ).length;

  const highRiskDetected = events.filter(
    (event) => event.finalScore >= 50
  ).length;

  const securityScore = calculateSecurityScore(events);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">
            Security Overview
          </h3>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Live telemetry
          </span>
        </div>

        <span className="text-[11px] text-muted-foreground">
          {events.length > 0 ? 'Updated automatically' : 'Awaiting activity'}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Shield}
          label="AI Security Score"
          value={`${securityScore}/100`}
          sublabel={
            events.length > 0
              ? `Based on ${events.length} request${
                  events.length === 1 ? '' : 's'
                }`
              : 'No requests analyzed yet'
          }
          accent="hsl(152 65% 45%)"
        />

        <StatCard
          icon={ScanLine}
          label="Prompts Scanned"
          value={promptsScanned.toLocaleString()}
          sublabel="Real gateway requests"
          accent="hsl(200 80% 60%)"
        />

        <StatCard
          icon={Ban}
          label="Threats Blocked"
          value={threatsBlocked.toLocaleString()}
          sublabel={
            promptsScanned > 0
              ? `${Math.round(
                  (threatsBlocked / promptsScanned) * 100
                )}% of requests`
              : 'No threats blocked yet'
          }
          accent="hsl(38 92% 55%)"
        />

        <StatCard
          icon={AlertTriangle}
          label="High Risk Detected"
          value={highRiskDetected.toLocaleString()}
          sublabel="Risk score ≥ 50"
          accent="hsl(0 72% 55%)"
        />
      </div>
    </section>
  );
}
