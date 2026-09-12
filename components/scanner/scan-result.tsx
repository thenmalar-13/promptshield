import { ShieldCheck, ShieldAlert, ShieldX, Info } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type {
  AnalysisResult,
  RiskLevel,
  ScanStatus,
} from '@/lib/prompt-analyzer';

const levelStyles: Record<RiskLevel, { text: string; bg: string; ring: string; icon: typeof ShieldCheck }> = {
  Low: {
    text: 'text-success',
    bg: 'bg-success/10',
    ring: 'ring-success/20',
    icon: ShieldCheck,
  },
  Medium: {
    text: 'text-warning',
    bg: 'bg-warning/10',
    ring: 'ring-warning/20',
    icon: ShieldAlert,
  },
  High: {
    text: 'text-destructive',
    bg: 'bg-destructive/10',
    ring: 'ring-destructive/20',
    icon: ShieldX,
  },
  Critical: {
    text: 'text-destructive',
    bg: 'bg-destructive/15',
    ring: 'ring-destructive/30',
    icon: ShieldX,
  },
};

const statusStyles: Record<ScanStatus, string> = {
  ALLOW: 'bg-success/10 text-success ring-success/30',
  REVIEW: 'bg-warning/10 text-warning ring-warning/30',
  BLOCK: 'bg-destructive/10 text-destructive ring-destructive/30',
};

function ScoreRing({ score, level }: { score: number; level: RiskLevel }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = levelStyles[level].text.replace('text-', '');

  const colorMap: Record<RiskLevel, string> = {
    Low: 'hsl(142 65% 45%)',
    Medium: 'hsl(38 92% 55%)',
    High: 'hsl(0 72% 55%)',
    Critical: 'hsl(0 72% 55%)',
  };

  return (
    <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r={radius} stroke="hsl(var(--border))" strokeWidth="8" fill="none" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke={colorMap[level]}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={cn('text-2xl font-bold', levelStyles[level].text)}>
          {score}
        </span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

interface ScanResultProps {
  result: AnalysisResult;
}

export function ScanResult({ result }: ScanResultProps) {
  const style = levelStyles[result.riskLevel];
  const StatusIcon = style.icon;

  return (
    <div className="space-y-4 animate-fade-in">
      <Card className={cn('border-border bg-card/50', 'ring-1', style.ring)}>
        <CardContent className="flex flex-col items-center gap-5 p-6 md:flex-row md:gap-6">
          <ScoreRing score={result.score} level={result.riskLevel} />
          <div className="flex flex-1 flex-col items-center gap-3 md:items-start">
            <div className="flex items-center gap-2">
              <StatusIcon className={cn('h-5 w-5', style.text)} />
              <span className="text-sm font-medium text-muted-foreground">
                Security Analysis
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className={cn('text-xl font-bold', style.text)}>
                {result.riskLevel}
              </span>
              <span
                className={cn(
                  'inline-flex items-center rounded-md px-3 py-1 text-sm font-bold ring-1',
                  statusStyles[result.status]
                )}
              >
                {result.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Risk Score: {result.score} / 100
            </p>
          </div>
        </CardContent>
      </Card>

      {result.categories.length > 0 && (
        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Threat Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-6 pt-0">
            {result.categories.map((cat) => {
              const catStyle = levelStyles[cat.severity];
              return (
                <div
                  key={cat.key}
                  className="flex items-center justify-between rounded-md border border-border/50 bg-secondary/30 px-4 py-2.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground">{cat.label}</span>
                    <span className="text-xs text-muted-foreground">
                      ({cat.indicatorCount}{' '}
                      {cat.indicatorCount > 1 ? 'indicators' : 'indicator'})
                    </span>
                  </div>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1',
                      catStyle.bg,
                      catStyle.text,
                      catStyle.ring
                    )}
                  >
                    {cat.severity}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {result.indicators.length > 0 && (
        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Detected Indicators
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 p-6 pt-0">
            {result.indicators.map((indicator, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-md px-4 py-2 text-sm"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-foreground">{indicator.pattern}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    &quot;{indicator.matchedText}&quot;
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="border-border bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Info className="h-4 w-4 text-muted-foreground" />
            Why this was flagged
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {result.explanation}
          </p>
        </CardContent>
      </Card>

      <Card className={cn('border-border bg-card/50 ring-1', style.ring)}>
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <StatusIcon className={cn('mt-0.5 h-5 w-5 shrink-0', style.text)} />
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-foreground">
                Recommended Action
              </span>
              <p className="text-sm text-muted-foreground">
                {result.recommendedAction}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-[11px] text-muted-foreground">
        Rule-based prototype detection — not a complete security solution
      </p>
    </div>
  );
}
