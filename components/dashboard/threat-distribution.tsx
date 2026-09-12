'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getSecurityEvents } from '@/lib/security-telemetry';

type TelemetryEvent = ReturnType<typeof getSecurityEvents>[number];

const threatLabels: Record<string, string> = {
  direct_injection: 'Prompt Injection',
  jailbreak: 'Jailbreak',
  system_prompt_extraction: 'System Prompt Extraction',
  instruction_override: 'Instruction Override',
  data_exfiltration: 'Data Exfiltration',
  obfuscation: 'Obfuscation',
  roleplay_jailbreak: 'Role-Play Jailbreak',
  multilingual_injection: 'Multilingual Injection',
  unicode_homoglyph: 'Unicode / Homoglyph',
  delimiter_smuggling: 'Delimiter Smuggling',
  tool_abuse: 'Tool Abuse',
  context_manipulation: 'Context Manipulation',
};

export function ThreatDistribution() {
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

  const threats = useMemo(() => {
    const counts = new Map<string, number>();

    events.forEach((event) => {
      if (!event.primaryThreat) {
        return;
      }

      counts.set(
        event.primaryThreat,
        (counts.get(event.primaryThreat) ?? 0) + 1
      );
    });

    return Array.from(counts.entries())
      .map(([key, count]) => ({
        key,
        label: threatLabels[key] ?? key.replace(/_/g, ' '),
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [events]);

  const maxCount = Math.max(...threats.map((threat) => threat.count), 1);
  const totalThreats = threats.reduce(
    (sum, threat) => sum + threat.count,
    0
  );

  return (
    <Card className="border-border bg-card/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-sm font-semibold">
          Threat Distribution
        </CardTitle>

        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Live telemetry
        </span>
      </CardHeader>

      <CardContent className="space-y-4 p-6 pt-0">
        {threats.length > 0 ? (
          threats.map((threat) => {
            const percentage =
              totalThreats > 0
                ? Math.round((threat.count / totalThreats) * 100)
                : 0;

            return (
              <div key={threat.key} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="min-w-0 truncate text-foreground">
                    {threat.label}
                  </span>

                  <span className="shrink-0 text-muted-foreground">
                    {threat.count}{' '}
                    <span className="text-muted-foreground/60">
                      ({percentage}%)
                    </span>
                  </span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{
                      width: `${(threat.count / maxCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            </div>

            <p className="text-sm font-medium text-foreground">
              No threats detected yet
            </p>

            <p className="mt-1 max-w-[220px] text-xs leading-5 text-muted-foreground">
              Analyze prompts through the PromptShield gateway to populate
              threat intelligence.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
