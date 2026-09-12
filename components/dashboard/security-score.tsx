
'use client';

import { useEffect, useState } from 'react';
import { Shield, Activity } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { getSecurityEvents } from '@/lib/security-telemetry';

type TelemetryEvent = ReturnType<typeof getSecurityEvents>[number];

function calculateSecurityScore(events: TelemetryEvent[]) {
  if (events.length === 0) {
    return 100;
  }

  const blocked = events.filter(
    (event) => event.decision === 'BLOCK'
  ).length;

  const review = events.filter(
    (event) => event.decision === 'REVIEW'
  ).length;

  const averageRisk =
    events.reduce((sum, event) => sum + event.finalScore, 0) /
    events.length;

  const blockRate = blocked / events.length;
  const reviewRate = review / events.length;

  const score = Math.round(
    100 -
      averageRisk * 0.45 -
      blockRate * 8 -
      reviewRate * 3
  );

  return Math.max(0, Math.min(100, score));
}

function getScoreLabel(score: number) {
  if (score >= 90) {
    return 'Strong Protection';
  }

  if (score >= 75) {
    return 'Good Protection';
  }

  if (score >= 50) {
    return 'Needs Attention';
  }

  return 'High Risk';
}

export function SecurityScore() {
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

  const score = calculateSecurityScore(events);

  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const label = getScoreLabel(score);

  return (
    <Card className="border-border bg-card/50">
      <CardContent className="flex flex-col items-center gap-6 p-6 md:flex-row md:items-center md:gap-8">
        {/* Score ring */}
        <div className="relative flex h-44 w-44 shrink-0 items-center justify-center">
          <svg
            className="h-full w-full -rotate-90"
            viewBox="0 0 176 176"
            fill="none"
          >
            <circle
              cx="88"
              cy="88"
              r={radius}
              stroke="hsl(var(--border))"
              strokeWidth="10"
              fill="none"
            />

            <circle
              cx="88"
              cy="88"
              r={radius}
              stroke="hsl(var(--primary))"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-700"
            />
          </svg>

          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-bold text-foreground">
              {score}
            </span>

            <span className="text-xs text-muted-foreground">
              / 100
            </span>
          </div>
        </div>

        {/* Score explanation */}
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/30">
              <Shield className="h-4 w-4 text-primary" />
            </div>

            <h3 className="text-base font-semibold text-foreground">
              Security Score
            </h3>
          </div>

          <div>
            <p className="text-lg font-semibold text-primary">
              {label}
            </p>

            <p className="text-sm leading-6 text-muted-foreground">
              {events.length > 0
                ? 'Score calculated from real PromptShield gateway telemetry, risk levels, and security decisions.'
                : 'Analyze a prompt through PromptShield to generate a live security posture score.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/50 px-2.5 py-1 text-muted-foreground">
              <Activity className="h-3.5 w-3.5 text-primary" />
              <span>
                {events.length} request{events.length === 1 ? '' : 's'} analyzed
              </span>
            </div>

            {events.length > 0 && (
              <div className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-primary">
                Live telemetry
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
