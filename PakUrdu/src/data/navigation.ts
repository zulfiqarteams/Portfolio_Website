import {
  Home,
  LineChart,
  Settings,
  Timer,
  Type,
} from "lucide-react";
import type { NavItem } from "@/types";

export const primaryNav: NavItem[] = [
  { label: "Home", path: "/", icon: Home },
  { label: "Practice", path: "/practice", icon: Type },
  { label: "Tests", path: "/test", icon: Timer },
  { label: "Progress", path: "/progress", icon: LineChart },
];

// "Profile" is intentionally left out here: the mobile menu already surfaces
// the active profile (or a "Create Profile" action) in its own row, and the
// desktop bar surfaces it via the ProfileMenu. Keeping it out of
// secondaryNav avoids showing the same destination twice.
export const secondaryNav: NavItem[] = [
  { label: "Settings", path: "/settings", icon: Settings },
];
