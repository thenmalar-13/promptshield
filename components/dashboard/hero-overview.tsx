
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  ScanSearch,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

export function HeroOverview() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card p-6 shadow-sm md:p-8">
      {/* Background glow */}
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          {/* Main message */}
          <div className="max-w-3xl space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>

                <span className="text-xs font-semibold text-primary">
                  PromptShield Gateway Active
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                AI + Rule Engine
              </div>
            </div>

            <div>
              <h2 className="max-w-3xl text-2xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
                Protect your AI applications{' '}
                <span className="text-primary">before threats reach the LLM.</span>
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                PromptShield analyzes LLM inputs for prompt injection,
                jailbreaks, instruction manipulation, data exfiltration,
                obfuscation, tool abuse, and advanced attack patterns.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2 shadow-sm">
                <Link href="/scanner">
                  <ScanSearch className="h-4 w-4" />
                  Scan a Prompt
                </Link>
              </Button>

              <Button asChild size="lg" variant="outline" className="gap-2">
                <Link href="/attack-lab">
                  Run Security Tests
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Security posture card */}
          <div className="w-full shrink-0 lg:w-[270px]">
            <div className="rounded-2xl border border-primary/20 bg-background/70 p-5 backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Security Posture
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      Protected
                    </p>
                  </div>
                </div>

                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>

              <div className="mt-5">
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-bold tracking-tight text-foreground">
                    19/19
                  </span>
                  <span className="mb-1 text-xs font-semibold text-primary">
                    100% detected
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-full rounded-full bg-primary" />
                </div>

                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  Controlled security test suite passed successfully across
                  direct and advanced prompt-injection scenarios.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Defense indicators */}
        <div className="mt-8 grid grid-cols-2 gap-3 border-t border-border pt-6 sm:grid-cols-4">
          {[
            ['12', 'Threat categories'],
            ['19', 'Security scenarios'],
            ['100%', 'Test detection'],
            ['HITL', 'Safe review gate'],
          ].map(([value, label]) => (
            <div key={label} className="rounded-xl border border-border/70 bg-background/40 p-3">
              <p className="text-lg font-bold text-foreground">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

