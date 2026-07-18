/**
 * Theme utility — controls the data-theme attribute on <html>.
 * Used by the root layout (inline script for FOUC prevention) and
 * by the theme toggle component built in Phase 3.
 *
 * Why a client-side module rather than a React context here:
 * The root layout runs on the server; we need a tiny inline script
 * to set data-theme before the first paint to avoid flash.
 * The actual React state/toggle lives in Phase 3's ThemeProvider.
 */

export type Theme = "light" | "dark";

const STORAGE_KEY = "sf-theme";

/**
 * Returns the script string to inline in <head> for FOUC prevention.
 * Reads localStorage first, falls back to OS preference.
 */
export function getThemeInitScript(): string {
  return `(function(){
    try {
      var saved = localStorage.getItem('${STORAGE_KEY}');
      if (saved === 'light' || saved === 'dark') {
        document.documentElement.setAttribute('data-theme', saved);
      } else {
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      }
    } catch(e) {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  })();`;
}

/**
 * Set the theme, persisting to localStorage and updating the DOM attribute.
 * Safe to call on the client only.
 */
export function setTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage unavailable — attribute is still set for this session.
  }
}

/**
 * Read the current resolved theme from the DOM attribute.
 * Returns 'light' as a safe fallback.
 */
export function getTheme(): Theme {
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "dark" ? "dark" : "light";
}

/**
 * Toggle between light and dark, persist, and return the new value.
 */
export function toggleTheme(): Theme {
  const next: Theme = getTheme() === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}
