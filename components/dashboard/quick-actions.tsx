
import Link from 'next/link';
import {
  ScanSearch,
  FlaskConical,
  FileBarChart,
  ShieldCheck,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

const quickActions: QuickAction[] = [
  {
    label: 'Scan a Prompt',
    description: 'Analyze a prompt for injection and security threats',
    href: '/scanner',
    icon: ScanSearch,
  },
  {
    label: 'Run Attack Lab',
    description: 'Test defenses against known and advanced attack patterns',
    href: '/attack-lab',
    icon: FlaskConical,
  },
  {
    label: 'AI Firewall',
    description: 'Inspect requests through the real security gateway',
    href: '/firewall',
    icon: ShieldCheck,
  },
  {
    label: 'Security Reports',
    description: 'Review threat intelligence and live security telemetry',
    href: '/reports',
    icon: FileBarChart,
  },
];

export function QuickActions() {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Quick Actions
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Security controls and analysis tools
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.href}
              href={action.href}
              className="group outline-none"
            >
              <Card className="h-full border-border bg-card/50 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card hover:shadow-sm group-focus-visible:ring-2 group-focus-visible:ring-primary/50">
                <CardContent className="flex h-full flex-col gap-4 p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>

                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-sm font-semibold text-foreground">
                      {action.label}
                    </span>

                    <p className="text-xs leading-5 text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
