import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Keyboard, Menu, Moon, Plus, Sun, X } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/Button";
import { useSettings } from "@/features/settings";
import { languageOptions, navigationLabels } from "@/data/localization";
import { primaryNav, secondaryNav } from "@/data/navigation";
import { cn } from "@/lib/cn";
import { useProfiles } from "@/features/profiles/context/ProfileContext";
import { ProfileAvatar } from "@/features/profiles/components/ProfileAvatar";
import { ProfileMenu } from "@/features/profiles/components/ProfileMenu";
import { ProfileFormModal } from "@/features/profiles/components/ProfileFormModal";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateProfileOpen, setIsCreateProfileOpen] = useState(false);
  const { activeProfile } = useProfiles();
  const { darkTheme, language, setSetting } = useSettings();
  const labels = navigationLabels[language];
  const location = useLocation();

  // Close the mobile menu automatically whenever the route changes.
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Let keyboard users dismiss the mobile menu with Escape.
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-paper/90 backdrop-blur">
      <PageContainer className="flex h-16 items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 font-display text-lg font-bold text-ink"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded bg-brand-500 text-white">
            <Keyboard size={18} strokeWidth={2.25} aria-hidden="true" />
          </span>
          PAKURDU
        </Link>

        {/* Desktop navigation */}
        <nav aria-label="Primary" className="hidden items-center gap-4 md:flex">
          {primaryNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-1.5 rounded-sm border-b-2 px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "border-brand-500 bg-brand-50 font-semibold text-brand-700"
                    : "border-transparent font-medium text-ink-soft hover:bg-surface hover:text-ink",
                )
              }
            >
              {item.icon && <item.icon size={15} aria-hidden="true" className="shrink-0" />}
              {labels[item.label] ?? item.label}
            </NavLink>
          ))}

        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <div className="flex items-center gap-1 rounded-md border border-border bg-surface p-1" role="group" aria-label="Language">
            {languageOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSetting("language", option.id)}
                aria-pressed={language === option.id}
                className={cn("rounded-sm px-2 py-1.5 text-xs font-medium transition-colors", language === option.id ? "bg-brand-500 text-white" : "text-ink-soft hover:bg-paper hover:text-ink")}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setSetting("darkTheme", !darkTheme)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-ink-soft transition-colors hover:bg-paper hover:text-ink"
            aria-label={darkTheme ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={darkTheme}
            title={darkTheme ? "Light mode" : "Dark mode"}
          >
            {darkTheme ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
          </button>
          <ProfileMenu onCreateNew={() => setIsCreateProfileOpen(true)} />
          <Button to={activeProfile ? "/learn" : "/profile"} size="md" className="ml-1">
            {labels["Start Learning"]}
          </Button>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-sm p-2 text-ink md:hidden"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-nav"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsMobileMenuOpen((open) => !open)}
        >
          {isMobileMenuOpen ? (
            <X size={22} aria-hidden="true" />
          ) : (
            <Menu size={22} aria-hidden="true" />
          )}
        </button>
      </PageContainer>

      {/* Mobile navigation panel */}
      {isMobileMenuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Primary"
          className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-border bg-paper md:hidden"
        >
          <PageContainer className="flex flex-col gap-1 py-4">
            {primaryNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-sm px-3 py-2.5 text-base",
                    isActive
                      ? "bg-brand-50 font-semibold text-brand-700"
                      : "font-medium text-ink-soft hover:bg-surface hover:text-ink",
                  )
                }
              >
                {item.icon && <item.icon size={18} aria-hidden="true" />}
                {labels[item.label] ?? item.label}
              </NavLink>
            ))}


            <Button to={activeProfile ? "/learn" : "/profile"} size="md" className="mt-3 justify-center">
              {labels["Start Learning"]}
            </Button>

            <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
              <div className="grid grid-cols-3 gap-1 rounded-md border border-border bg-surface p-1" role="group" aria-label="Language">
                {languageOptions.map((option) => (
                  <button key={option.id} type="button" onClick={() => setSetting("language", option.id)} aria-pressed={language === option.id} className={cn("min-h-9 rounded-sm px-2 py-1 text-xs font-medium", language === option.id ? "bg-brand-500 text-white" : "text-ink-soft hover:bg-paper hover:text-ink")}>
                    {option.label}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => setSetting("darkTheme", !darkTheme)} aria-label={darkTheme ? "Switch to light mode" : "Switch to dark mode"} aria-pressed={darkTheme} className="inline-flex min-h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-ink-soft">
                {darkTheme ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
              </button>
            </div>

            <div className="my-3 border-t border-border" />

            {activeProfile ? (
              <Link
                to="/profile"
                className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-base font-medium text-ink-soft hover:bg-surface hover:text-ink"
              >
                <ProfileAvatar
                  name={activeProfile.name}
                  avatarId={activeProfile.avatarId}
                  seed={activeProfile.id}
                  size="sm"
                />
                {activeProfile.name}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setIsCreateProfileOpen(true)}
                className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-base font-medium text-brand-600 hover:bg-brand-50"
              >
                <Plus size={18} aria-hidden="true" />
                {labels["Create Profile"]}
              </button>
            )}

            {secondaryNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-sm px-3 py-2.5 text-base",
                    isActive
                      ? "bg-brand-50 font-semibold text-brand-700"
                      : "font-medium text-ink-soft hover:bg-surface hover:text-ink",
                  )
                }
              >
                {item.icon && <item.icon size={18} aria-hidden="true" />}
                {labels[item.label] ?? item.label}
              </NavLink>
            ))}
          </PageContainer>
        </nav>
      )}

      <ProfileFormModal open={isCreateProfileOpen} onClose={() => setIsCreateProfileOpen(false)} />
    </header>
  );
}
