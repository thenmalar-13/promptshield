import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  ScanSearch,
  FlaskConical,
  FileBarChart,
  ShieldCheck,
  Settings,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Prompt Scanner', href: '/scanner', icon: ScanSearch },
  { label: 'Attack Lab', href: '/attack-lab', icon: FlaskConical },
  { label: 'Security Reports', href: '/reports', icon: FileBarChart },
  { label: 'AI Firewall', href: '/firewall', icon: ShieldCheck },
  { label: 'Settings', href: '/settings', icon: Settings },
];
