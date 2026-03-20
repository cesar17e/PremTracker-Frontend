"use client";

const STORAGE_KEY = "premtracker-theme";

function readThemeFromDom() {
  return document.documentElement.getAttribute("data-theme") === "premtracker-light"
    ? "light"
    : "dark";
}

function applyTheme(theme: "light" | "dark") {
  document.documentElement.setAttribute(
    "data-theme",
    theme === "dark" ? "premtracker-dark" : "premtracker-light"
  );
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem(STORAGE_KEY, theme);
}

export function ThemeToggle() {
  function handleToggle() {
    const nextTheme = readThemeFromDom() === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="btn btn-ghost rounded-full border border-base-content/10 px-4 text-base-content/78"
      aria-label="Toggle theme"
      title="Toggle theme"
      suppressHydrationWarning
    >
      <span className="theme-icon theme-icon-dark" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="h-4 w-4">
          <path
            fill="currentColor"
            d="M21 12.79A9 9 0 0 1 11.21 3a1 1 0 0 0-1.21 1.23 7.5 7.5 0 1 0 9.77 9.77A1 1 0 0 0 21 12.79Z"
          />
        </svg>
      </span>
      <span className="theme-icon theme-icon-light" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="h-4 w-4">
          <path
            fill="currentColor"
            d="M12 4.75a1 1 0 0 1 1 1V7a1 1 0 1 1-2 0V5.75a1 1 0 0 1 1-1Zm0 11.25a4 4 0 1 0 0-8a4 4 0 0 0 0 8Zm7.25-5a1 1 0 1 1 0 2H18a1 1 0 1 1 0-2h1.25ZM7 12a1 1 0 0 1-1 1H4.75a1 1 0 1 1 0-2H6a1 1 0 0 1 1 1Zm9.42 4.83a1 1 0 0 1 1.41 0l.89.88a1 1 0 1 1-1.42 1.42l-.88-.89a1 1 0 0 1 0-1.41Zm-9.96 0a1 1 0 0 1 0 1.41l-.88.89a1 1 0 1 1-1.42-1.42l.89-.88a1 1 0 0 1 1.41 0Zm11.37-11.37a1 1 0 0 1 0 1.41l-.89.88a1 1 0 1 1-1.41-1.41l.88-.89a1 1 0 0 1 1.42 0ZM6.46 6.46a1 1 0 0 1-1.41 1.41l-.89-.88a1 1 0 1 1 1.42-1.42l.88.89Z"
          />
        </svg>
      </span>
      <span className="text-sm">Theme</span>
    </button>
  );
}
