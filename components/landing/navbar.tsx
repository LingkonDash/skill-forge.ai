"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getTheme, toggleTheme, Theme } from "@/lib/utils/theme";
import { useSession, signOut } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    setThemeState(getTheme());
  }, []);

  const handleToggleTheme = () => {
    const newTheme = toggleTheme();
    setThemeState(newTheme);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <nav className="border-b border-border bg-surface sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Public Routes */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center text-display-md font-bold text-text hover:text-primary transition-colors"
            >
              SkillForge
            </Link>
            <div className="hidden md:flex items-center gap-4">
              <Link href="/explore">
                <Button variant="ghost" size="sm">
                  Explore
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="ghost" size="sm">
                  About
                </Button>
              </Link>
            </div>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleTheme}
              className="w-9 h-9 p-0 flex items-center justify-center text-muted hover:text-text rounded-full"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            >
              {theme === "dark" ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </Button>

            {session ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="sm"
                  className="text-error hover:bg-error/10 hover:text-error"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleTheme}
              className="w-9 h-9 p-0 flex items-center justify-center text-muted hover:text-text rounded-full"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 p-0 flex items-center justify-center text-muted hover:text-text"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-surface px-4 pt-2 pb-4 space-y-2 flex flex-col transition-all">
          <Link href="/explore" onClick={() => setMobileMenuOpen(false)}>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Explore
            </Button>
          </Link>
          <Link href="/about" onClick={() => setMobileMenuOpen(false)}>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              About
            </Button>
          </Link>
          {session ? (
            <>
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  Dashboard
                </Button>
              </Link>
              <Button
                onClick={() => {
                  handleSignOut();
                  setMobileMenuOpen(false);
                }}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-error hover:bg-error/10 hover:text-error"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  Log in
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" size="sm" className="w-full justify-start">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
