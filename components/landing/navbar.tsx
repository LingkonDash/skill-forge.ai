"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getTheme, toggleTheme, Theme } from "@/lib/utils/theme";
import { useSession, signOut } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";

export function Navbar() {
  const [theme, setThemeState] = useState<Theme>("light");
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Only access DOM once mounted on client
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
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex">
            <Link href="/" className="flex items-center text-xl font-bold text-gray-900 dark:text-white">
              SkillForge
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleToggleTheme}
              className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
