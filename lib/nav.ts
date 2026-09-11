import { Home, BookOpen, Brain, PenTool, BarChart3, Users, Trophy, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const PRIMARY_NAV: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/subjects", label: "Subjects", icon: BookOpen },
  { href: "/revision", label: "Revision", icon: Brain },
  { href: "/practice", label: "Practice", icon: PenTool },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/friends", label: "Friends", icon: Users },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/settings", label: "Settings", icon: Settings },
];

export const MOBILE_PRIMARY_NAV: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/subjects", label: "Subjects", icon: BookOpen },
  { href: "/revision", label: "Revision", icon: Brain },
  { href: "/progress", label: "Progress", icon: BarChart3 },
];

export const MOBILE_MORE_NAV: NavItem[] = [
  { href: "/practice", label: "Practice", icon: PenTool },
  { href: "/friends", label: "Friends", icon: Users },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/settings", label: "Settings", icon: Settings },
];
