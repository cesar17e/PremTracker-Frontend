import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/app/_providers/app-providers";

export const metadata: Metadata = {
  title: {
    default: "PremTracker",
    template: "%s | PremTracker",
  },
  description:
    "Premier League analytics frontend for browsing team form, fixtures, and explainable trends.",
  applicationName: "PremTracker",
};

const themeInitScript = `
  (() => {
    const storageKey = "premtracker-theme";

    try {
      const stored = window.localStorage.getItem(storageKey);
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      const theme = stored === "light" || stored === "dark" ? stored : systemTheme;
      document.documentElement.setAttribute(
        "data-theme",
        theme === "dark" ? "premtracker-dark" : "premtracker-light"
      );
      document.documentElement.style.colorScheme = theme;
    } catch {
      document.documentElement.setAttribute("data-theme", "premtracker-dark");
      document.documentElement.style.colorScheme = "dark";
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="premtracker-dark"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
