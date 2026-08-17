import {
  Home,
  LineChart,
  Settings,
  Timer,
  Type,
  UserCircle,
} from "lucide-react";
import type { NavItem } from "@/types";

export const primaryNav: NavItem[] = [
  { label: "Home", path: "/", icon: Home },
  { label: "Practice", path: "/practice", icon: Type },
  { label: "Tests", path: "/test", icon: Timer },
  { label: "Progress", path: "/progress", icon: LineChart },
];

export const secondaryNav: NavItem[] = [
  { label: "Profile", path: "/profile", icon: UserCircle },
  { label: "Settings", path: "/settings", icon: Settings },
];
