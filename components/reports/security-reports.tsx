
'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ScanLine,
  ShieldAlert,
  Ban,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Info,
  ShieldCheck,
  ShieldX,
  Activity,
  Brain,
  Zap,
  Send,
  Trash2,
  RefreshCw,
  Database,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import type {
  RiskLevel,
  ScanStatus,
} from '@/lib/prompt-analyzer';

import {
  reportSummary,
  threatBreakdown,
  threatReports,
  type ThreatReport,
} from '@/lib/report-data';

import {
  getSecurityEvents,
  clearSecurityEvents,
  type SecurityEvent,
} from '@/lib/security-telemetry';

type FilterLevel = 'All' | RiskLevel;

const severityStyles: Record<
  RiskLevel,
  { text: string; bg: string; ring: string }
> = {
  Low: {
    text: 'text-success',
    bg: 'bg-success/10',
    ring: 'ring-success/20',
  },
  Medium: {
    text: 'text-warning',
    bg: 'bg-warning/10',
    ring: 'ring-warning/20',
  },
  High: {
    text: 'text-destructive',
    bg: 'bg-destructive/10',
    ring: 'ring-destructive/20',
  },
  Critical: {
    text: 'text-destructive',
    bg: 'bg-destructive/15',
    ring: 'ring-destructive/30',
  },
};

const decisionStyles: Record<ScanStatus, string> = {
  ALLOW:
    'bg-success/10 text-success ring-success/30',
  REVIEW:
    'bg-warning/10 text-warning ring-warning/30',
  BLOCK:
    'bg-destructive/10 text-destructive ring-destructive/30',
};

const summaryCards = [
  {
    icon: ScanLine,
    label: 'Prompts Analyzed',
    value: reportSummary.promptsAnalyzed,
    accent: 'hsl(200 80% 60%)',
  },
  {
    icon: ShieldAlert,
    label: 'Threats Detected',
    value: reportSummary.threatsDetected,
    accent: 'hsl(38 92% 55%)',
  },
  {
    icon: Ban,
    label: 'Attacks Blocked',
    value: reportSummary.attacksBlocked,
    accent: 'hsl(0 72% 55%)',
  },
  {
    icon: AlertTriangle,
    label: 'Critical Threats',
    value: reportSummary.criticalThreats,
    accent: 'hsl(0 72% 55%)',
  },
];

function formatTime(timestamp: string) {
  try {
    return new Date(timestamp).toLocaleString([], {
      dateStyle: 'short',
      timeStyle: 'medium',
    });
  } catch {
    return timestamp;
  }
}

function getRiskLevel(score: number): RiskLevel {
  if (score >= 75) return 'Critical';
  if (score >= 50) return 'High';
  if (score >= 25) return 'Medium';
  return 'Low';
}

function ReportRow({
  report,
  onToggle,
  isOpen,
}: {
  report: ThreatReport;
  onToggle: () => void;
  isOpen: boolean;
}) {
  const sevStyle = severityStyles[report.severity];

  return (
    <div className="border-b border-border/50 last:border-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/40 md:px-6"
      >
        <span
          className={cn(
            'h-1.5 w-1.5 shrink-0 rounded-full',
            report.severity === 'Critical' ||
              report.severity === 'High'
              ? 'bg-destructive'
              : report.severity === 'Medium'
                ? 'bg-warning'
                : 'bg-success'
          )}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm text-foreground">
            {report.threatType}
          </span>

          <span className="text-xs text-muted-foreground">
            {report.timestamp}
          </span>
        </div>

        <span className="hidden w-12 shrink-0 text-right text-sm tabular-nums text-foreground md:block">
          {report.riskScore}
        </span>

        <span
          className={cn(
            'inline-flex w-20 shrink-0 items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1',
            sevStyle.bg,
            sevStyle.text,
            sevStyle.ring
          )}
        >
          {report.severity}
        </span>

        <span
          className={cn(
            'hidden w-20 shrink-0 items-center justify-center rounded-md px-2 py-0.5 text-[11px] font-bold ring-1 sm:inline-flex',
            decisionStyles[report.decision]
          )}
        >
          {report.decision}
        </span>

        <span className="hidden w-28 shrink-0 truncate text-right text-xs text-muted-foreground lg:block">
          {report.source}
        </span>

        {isOpen ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <div className="space-y-3 px-4 pb-5 pt-2 animate-fade-in md:px-6">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground">
                Attack Type
              </p>

              <p className="text-sm text-foreground">
                {report.threatType}
              </p>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground">
                Risk Score
              </p>

              <p
                className={cn(
                  'text-sm font-semibold',
                  sevStyle.text
                )}
              >
                {report.riskScore} / 100
              </p>
            </div>
          </div>

          {report.categories.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground">
                Detected Categories
              </p>

              <div className="flex flex-wrap gap-2">
                {report.categories.map((cat) => {
                  const catStyle =
                    severityStyles[cat.severity];

                  return (
                    <span
                      key={cat.label}
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1',
                        catStyle.bg,
                        catStyle.text,
                        catStyle.ring
                      )}
                    >
                      {cat.label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {report.indicators.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground">
                Indicators
              </p>

              <div className="space-y-1">
                {report.indicators.map((ind, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />

                    <span className="text-foreground">
                      {ind}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Info className="h-3.5 w-3.5" />
              Explanation
            </p>

            <p className="text-sm leading-relaxed text-muted-foreground">
              {report.explanation}
            </p>
          </div>

          <div
            className={cn(
              'flex items-start gap-2.5 rounded-md p-3 ring-1',
              sevStyle.bg,
              sevStyle.ring
            )}
          >
            {report.decision === 'ALLOW' ? (
              <ShieldCheck
                className={cn(
                  'mt-0.5 h-4 w-4 shrink-0',
                  sevStyle.text
                )}
              />
            ) : (
              <ShieldX
                className={cn(
                  'mt-0.5 h-4 w-4 shrink-0',
                  sevStyle.text
                )}
              />
            )}

            <div className="flex flex-col gap-0.5">
              <p
                className={cn(
                  'text-xs font-semibold',
                  sevStyle.text
                )}
              >
                Recommended Action
              </p>

              <p className="text-sm text-muted-foreground">
                {report.recommendedAction}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TelemetryEventRow({
  event,
}: {
  event: SecurityEvent;
}) {
  const riskLevel = getRiskLevel(event.finalScore);

  return (
    <div className="border-b border-border/50 last:border-0">
      <div className="grid grid-cols-12 items-center gap-2 px-4 py-3 md:px-6">
        {/* Time */}
        <div className="col-span-12 min-w-0 md:col-span-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'h-2 w-2 shrink-0 rounded-full',
                event.decision === 'BLOCK'
                  ? 'bg-destructive'
                  : event.decision === 'REVIEW'
                    ? 'bg-warning'
                    : 'bg-success'
              )}
            />

            <div className="min-w-0">
              <p className="truncate text-xs text-foreground">
                {event.primaryThreat}
              </p>

              <p className="truncate text-[10px] text-muted-foreground">
                {formatTime(event.timestamp)}
              </p>
            </div>
          </div>
        </div>

        {/* Decision */}
        <div className="col-span-4 md:col-span-2">
          <span
            className={cn(
              'inline-flex rounded-md px-2 py-1 text-[10px] font-bold ring-1',
              decisionStyles[event.decision]
            )}
          >
            {event.decision}
          </span>
        </div>

        {/* Risk */}
        <div className="col-span-4 md:col-span-1">
          <p className="text-xs font-semibold text-foreground">
            {event.finalScore}
          </p>

          <p
            className={cn(
              'text-[9px]',
              severityStyles[riskLevel].text
            )}
          >
            {riskLevel}
          </p>
        </div>

        {/* AI */}
        <div className="col-span-4 md:col-span-2">
          <div className="flex items-center gap-1">
            <Brain className="h-3 w-3 text-primary" />

            <span className="text-xs text-foreground">
              {event.aiScore === null
                ? '—'
                : `${event.aiScore}`}
            </span>
          </div>

          <p className="text-[9px] text-muted-foreground">
            {event.aiConfidence === null
              ? 'No AI'
              : `${event.aiConfidence}% confidence`}
          </p>
        </div>

        {/* Latency */}
        <div className="col-span-6 md:col-span-2">
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-warning" />

            <span className="text-xs text-foreground">
              {event.latencyMs} ms
            </span>
          </div>

          <p className="text-[9px] text-muted-foreground">
            {event.promptLength} chars
          </p>
        </div>

        {/* LLM */}
        <div className="col-span-6 md:col-span-2">
          <div className="flex items-center gap-1">
            <Send
              className={cn(
                'h-3 w-3',
                event.llmForwarded
                  ? 'text-success'
                  : 'text-muted-foreground'
              )}
            />

            <span
              className={cn(
                'text-[10px] font-semibold',
                event.llmForwarded
                  ? 'text-success'
                  : 'text-muted-foreground'
              )}
            >
              {event.llmForwarded
                ? event.llmSuccess
                  ? 'FORWARDED'
                  : 'FAILED'
                : 'NOT CALLED'}
            </span>
          </div>

          <p className="truncate text-[9px] text-muted-foreground">
            {event.llmModel || 'Security Gateway'}
          </p>
        </div>
      </div>
    </div>
  );
}

export function SecurityReports() {
  const [filter, setFilter] =
    useState<FilterLevel>('All');

  const [openId, setOpenId] =
    useState<string | null>(null);

  const [telemetry, setTelemetry] =
    useState<SecurityEvent[]>([]);

  const [lastUpdated, setLastUpdated] =
    useState<Date | null>(null);

  const filters: FilterLevel[] = [
    'All',
    'Critical',
    'High',
    'Medium',
    'Low',
  ];

  /*
   * Load real security telemetry.
   */
  const loadTelemetry = () => {
    const events = getSecurityEvents();

    setTelemetry(events);
    setLastUpdated(new Date());
  };

  /*
   * Load once and refresh periodically.
   *
   * This makes the dashboard update after
   * Firewall scans without requiring a manual refresh.
   */
  useEffect(() => {
    loadTelemetry();

    const interval = window.setInterval(
      loadTelemetry,
      1500
    );

    const handleStorage = () => {
      loadTelemetry();
    };

    window.addEventListener(
      'storage',
      handleStorage
    );

    return () => {
      window.clearInterval(interval);

      window.removeEventListener(
        'storage',
        handleStorage
      );
    };
  }, []);

  /*
   * Real telemetry statistics.
   */
  const telemetryStats = useMemo(() => {
    const total = telemetry.length;

    const blocked = telemetry.filter(
      (event) => event.decision === 'BLOCK'
    ).length;

    const review = telemetry.filter(
      (event) => event.decision === 'REVIEW'
    ).length;

    const allowed = telemetry.filter(
      (event) => event.decision === 'ALLOW'
    ).length;

    const forwarded = telemetry.filter(
      (event) => event.llmForwarded
    ).length;

    const successfulLLM = telemetry.filter(
      (event) =>
        event.llmForwarded &&
        event.llmSuccess
    ).length;

    const avgRisk =
      total > 0
        ? Math.round(
            telemetry.reduce(
              (sum, event) =>
                sum + event.finalScore,
              0
            ) / total
          )
        : 0;

    const avgLatency =
      total > 0
        ? Math.round(
            telemetry.reduce(
              (sum, event) =>
                sum + event.latencyMs,
              0
            ) / total
          )
        : 0;

    const aiEvents = telemetry.filter(
      (event) =>
        event.aiConfidence !== null
    );

    const avgConfidence =
      aiEvents.length > 0
        ? Math.round(
            aiEvents.reduce(
              (sum, event) =>
                sum +
                (event.aiConfidence || 0),
              0
            ) / aiEvents.length
          )
        : 0;

    return {
      total,
      blocked,
      review,
      allowed,
      forwarded,
      successfulLLM,
      avgRisk,
      avgLatency,
      avgConfidence,
    };
  }, [telemetry]);

  /*
   * Calculate real threat distribution.
   */
  const telemetryThreats = useMemo(() => {
    const counts = new Map<string, number>();

    telemetry.forEach((event) => {
      const key =
        event.primaryThreat || 'Unknown';

      counts.set(
        key,
        (counts.get(key) || 0) + 1
      );
    });

    return Array.from(counts.entries())
      .map(([label, count]) => ({
        label,
        count,
        percentage:
          telemetry.length > 0
            ? Math.round(
                (count / telemetry.length) *
                  100
              )
            : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [telemetry]);

  const maxTelemetryThreatCount =
    Math.max(
      1,
      ...telemetryThreats.map(
        (item) => item.count
      )
    );

  const filteredReports =
    filter === 'All'
      ? threatReports
      : threatReports.filter(
          (r) => r.severity === filter
        );

  const maxBreakdownCount = Math.max(
    ...threatBreakdown.map((t) => t.count)
  );

  const handleClearTelemetry = () => {
    clearSecurityEvents();
    setTelemetry([]);
    setLastUpdated(new Date());
  };

  return (
    <div className="space-y-8">
      {/* ====================================================== */}
      {/* LIVE SECURITY TELEMETRY */}
      {/* ====================================================== */}

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />

              <h2 className="text-sm font-semibold text-foreground">
                Live Security Telemetry
              </h2>

              <span className="rounded-full bg-success/10 px-2 py-0.5 text-[9px] font-bold text-success ring-1 ring-success/20">
                LIVE
              </span>
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              Real events captured by the PromptShield
              security gateway.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="hidden text-[10px] text-muted-foreground sm:block">
                Updated{' '}
                {lastUpdated.toLocaleTimeString()}
              </span>
            )}

            <Button
              onClick={loadTelemetry}
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>

            {telemetry.length > 0 && (
              <Button
                onClick={handleClearTelemetry}
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Live KPI cards */}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-6">
          <Card className="border-border bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-medium text-muted-foreground">
                  Requests
                </p>

                <Database className="h-4 w-4 text-primary" />
              </div>

              <p className="mt-2 text-2xl font-bold text-foreground">
                {telemetryStats.total}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-medium text-muted-foreground">
                  Blocked
                </p>

                <Ban className="h-4 w-4 text-destructive" />
              </div>

              <p className="mt-2 text-2xl font-bold text-destructive">
                {telemetryStats.blocked}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-medium text-muted-foreground">
                  Review
                </p>

                <AlertTriangle className="h-4 w-4 text-warning" />
              </div>

              <p className="mt-2 text-2xl font-bold text-warning">
                {telemetryStats.review}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-medium text-muted-foreground">
                  Allowed
                </p>

                <ShieldCheck className="h-4 w-4 text-success" />
              </div>

              <p className="mt-2 text-2xl font-bold text-success">
                {telemetryStats.allowed}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-medium text-muted-foreground">
                  Avg Risk
                </p>

                <ShieldAlert className="h-4 w-4 text-warning" />
              </div>

              <p className="mt-2 text-2xl font-bold text-foreground">
                {telemetryStats.avgRisk}
                <span className="text-xs font-normal text-muted-foreground">
                  {' '}
                  / 100
                </span>
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-medium text-muted-foreground">
                  LLM Forwarded
                </p>

                <Send className="h-4 w-4 text-primary" />
              </div>

              <p className="mt-2 text-2xl font-bold text-foreground">
                {telemetryStats.forwarded}
              </p>

              <p className="text-[9px] text-muted-foreground">
                {telemetryStats.successfulLLM}{' '}
                successful
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Security performance */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="border-border bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs">
                Decision Distribution
              </CardTitle>
            </CardHeader>

            <CardContent>
              {telemetryStats.total === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Run a Firewall scan to populate
                  telemetry.
                </p>
              ) : (
                <div className="space-y-3">
                  {[
                    {
                      label: 'BLOCK',
                      value: telemetryStats.blocked,
                      style:
                        'bg-destructive',
                    },
                    {
                      label: 'REVIEW',
                      value: telemetryStats.review,
                      style: 'bg-warning',
                    },
                    {
                      label: 'ALLOW',
                      value: telemetryStats.allowed,
                      style: 'bg-success',
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="space-y-1"
                    >
                      <div className="flex justify-between text-[10px]">
                        <span className="font-medium text-foreground">
                          {item.label}
                        </span>

                        <span className="text-muted-foreground">
                          {item.value}
                        </span>
                      </div>

                      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            item.style
                          )}
                          style={{
                            width: `${
                              (item.value /
                                telemetryStats
                                  .total) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs">
                AI Security Performance
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />

                  <span className="text-xs text-muted-foreground">
                    Avg AI Confidence
                  </span>
                </div>

                <span className="text-sm font-bold text-foreground">
                  {telemetryStats.avgConfidence}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{
                    width: `${telemetryStats.avgConfidence}%`,
                  }}
                />
              </div>

              <p className="text-[10px] text-muted-foreground">
                Gemini semantic analysis confidence
                across captured requests.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs">
                Gateway Performance
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-warning" />

                  <span className="text-xs text-muted-foreground">
                    Average Latency
                  </span>
                </div>

                <span className="text-sm font-bold text-foreground">
                  {telemetryStats.avgLatency} ms
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  LLM Requests
                </span>

                <span className="text-xs font-semibold text-foreground">
                  {telemetryStats.forwarded}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  Successful LLM Responses
                </span>

                <span className="text-xs font-semibold text-success">
                  {telemetryStats.successfulLLM}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real threat distribution */}
        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs">
              Detected Threat Distribution
            </CardTitle>
          </CardHeader>

          <CardContent>
            {telemetryThreats.length === 0 ? (
              <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
                <Activity className="h-4 w-4" />
                No live threats recorded yet.
              </div>
            ) : (
              <div className="space-y-4">
                {telemetryThreats.map(
                  (threat) => (
                    <div
                      key={threat.label}
                      className="space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 text-foreground">
                          <span className="h-2 w-2 rounded-full bg-destructive" />
                          {threat.label}
                        </span>

                        <span className="text-muted-foreground">
                          {threat.count}{' '}
                          <span className="text-muted-foreground/60">
                            ({threat.percentage}%)
                          </span>
                        </span>
                      </div>

                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-destructive transition-all duration-500"
                          style={{
                            width: `${
                              (threat.count /
                                maxTelemetryThreatCount) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Real event stream */}
        <Card className="border-border bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-xs">
                Security Event Stream
              </CardTitle>

              <p className="mt-1 text-[10px] text-muted-foreground">
                Latest firewall decisions captured
                locally.
              </p>
            </div>

            <span className="rounded-full bg-primary/10 px-2 py-1 text-[9px] font-bold text-primary ring-1 ring-primary/20">
              {telemetry.length} EVENTS
            </span>
          </CardHeader>

          <CardContent className="p-0">
            {telemetry.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
                <Activity className="h-8 w-8 text-muted-foreground/40" />

                <p className="text-sm font-medium text-foreground">
                  No telemetry yet
                </p>

                <p className="max-w-md text-xs text-muted-foreground">
                  Go to the AI Firewall and inspect a
                  prompt. Every security decision will
                  appear here automatically.
                </p>
              </div>
            ) : (
              <>
                <div className="hidden grid-cols-12 gap-2 border-y border-border/50 bg-secondary/20 px-6 py-2 md:grid">
                  <span className="col-span-3 text-[9px] font-semibold text-muted-foreground">
                    THREAT / TIME
                  </span>

                  <span className="col-span-2 text-[9px] font-semibold text-muted-foreground">
                    DECISION
                  </span>

                  <span className="col-span-1 text-[9px] font-semibold text-muted-foreground">
                    RISK
                  </span>

                  <span className="col-span-2 text-[9px] font-semibold text-muted-foreground">
                    AI
                  </span>

                  <span className="col-span-2 text-[9px] font-semibold text-muted-foreground">
                    PERFORMANCE
                  </span>

                  <span className="col-span-2 text-[9px] font-semibold text-muted-foreground">
                    LLM
                  </span>
                </div>

                {telemetry
                  .slice(0, 50)
                  .map((event) => (
                    <TelemetryEventRow
                      key={event.id}
                      event={event}
                    />
                  ))}
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-4 py-3">
          <Info className="h-4 w-4 shrink-0 text-primary" />

          <p className="text-[10px] leading-relaxed text-muted-foreground">
            Telemetry is privacy-preserving: PromptShield
            stores the prompt length and SHA-256 fingerprint,
            not the raw prompt content. Current telemetry is
            stored locally in the browser for this demo.
          </p>
        </div>
      </section>

      {/* ====================================================== */}
      {/* EXISTING DEMO REPORTS */}
      {/* ====================================================== */}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Security Summary
          </h2>

          <span className="text-[11px] text-muted-foreground">
            Demo dataset
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <Card
                key={card.label}
                className="border-border bg-card/50 transition-colors hover:border-primary/30"
              >
                <CardContent className="flex items-start justify-between p-5">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      {card.label}
                    </p>

                    <p className="text-2xl font-bold tracking-tight text-foreground">
                      {card.value.toLocaleString()}
                    </p>
                  </div>

                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1"
                    style={{
                      backgroundColor: `${card.accent}1a`,
                      color: card.accent,
                      borderColor: `${card.accent}33`,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">
          Threat Breakdown
        </h2>

        <Card className="border-border bg-card/50">
          <CardContent className="space-y-4 p-6">
            {threatBreakdown.map((threat) => (
              <div
                key={threat.key}
                className="space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-foreground">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor:
                          threat.color,
                      }}
                    />

                    {threat.label}
                  </span>

                  <span className="text-muted-foreground">
                    {threat.count}{' '}
                    <span className="text-muted-foreground/60">
                      ({threat.percentage}%)
                    </span>
                  </span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        (threat.count /
                          maxBreakdownCount) *
                        100
                      }%`,
                      backgroundColor:
                        threat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Recent Threat Reports
          </h2>

          <div className="flex flex-wrap gap-1.5">
            {filters.map((f) => (
              <Button
                key={f}
                onClick={() => setFilter(f)}
                size="sm"
                variant={
                  filter === f
                    ? 'default'
                    : 'outline'
                }
                className={cn(
                  'h-7 px-2.5 text-xs',
                  filter === f && 'gap-1.5'
                )}
              >
                {f === 'All' && (
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                )}

                {f !== 'All' && (
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      f === 'Critical' ||
                        f === 'High'
                        ? 'bg-destructive'
                        : f === 'Medium'
                          ? 'bg-warning'
                          : 'bg-success'
                    )}
                  />
                )}

                {f}
              </Button>
            ))}
          </div>
        </div>

        <Card className="border-border bg-card/50">
          <div className="flex items-center gap-3 border-b border-border/50 px-4 py-2.5 md:px-6">
            <span className="w-1.5 shrink-0" />

            <span className="flex-1 text-[11px] font-semibold text-muted-foreground">
              Threat / Timestamp
            </span>

            <span className="hidden w-12 text-right text-[11px] font-semibold text-muted-foreground md:block">
              Score
            </span>

            <span className="w-20 text-center text-[11px] font-semibold text-muted-foreground">
              Severity
            </span>

            <span className="hidden w-20 text-center text-[11px] font-semibold text-muted-foreground sm:block">
              Decision
            </span>

            <span className="hidden w-28 text-right text-[11px] font-semibold text-muted-foreground lg:block">
              Source
            </span>

            <span className="w-4 shrink-0" />
          </div>

          {filteredReports.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">
              No reports match this filter.
            </div>
          ) : (
            filteredReports.map((report) => (
              <ReportRow
                key={report.id}
                report={report}
                isOpen={
                  openId === report.id
                }
                onToggle={() =>
                  setOpenId(
                    openId === report.id
                      ? null
                      : report.id
                  )
                }
              />
            ))
          )}
        </Card>
      </section>

      <p className="text-center text-[11px] text-muted-foreground">
        PromptShield telemetry is locally stored for
        this demonstration. Production deployments
        should use a server-side security event store.
      </p>
    </div>
  );
}
