import type { LucideIcon } from 'lucide-react';

import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent } from '@/components/ui/card';

interface PlaceholderPageProps {
  title: string;
  subtitle: string;
  featureName: string;
  description: string;
  icon: LucideIcon;
  steps: string[];
}

export function PlaceholderPage({
  title,
  subtitle,
  featureName,
  description,
  icon: Icon,
  steps,
}: PlaceholderPageProps) {
  return (
    <AppShell title={title} subtitle={subtitle}>
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-2xl border-border bg-card/50 text-center">
          <CardContent className="flex flex-col items-center gap-5 p-8 md:p-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
              <Icon className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground md:text-2xl">
                {featureName}
              </h2>
              <p className="text-sm text-muted-foreground md:text-base">
                {description}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/50 px-4 py-2.5">
              <span className="text-xs font-medium text-muted-foreground">
                Coming in a later development step
              </span>
            </div>
            <div className="mt-2 w-full space-y-2 text-left">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary ring-1 ring-primary/20">
                    {index + 1}
                  </span>
                  {step}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
