"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
type TeamCrestModel = {
  name: string;
  shortName: string | null;
  symbolicName?: string | null;
  logoUrl?: string | null;
};

// These crest URLs are stored in the backend and may come from varying remote domains.
// A fixed-size <img> keeps the card stable without introducing image-domain config.
function getFallbackMonogram(team: TeamCrestModel) {
  const source = team.symbolicName?.trim() || team.shortName?.trim() || team.name.trim();
  const letters = source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return letters || "FC";
}

export function TeamCrest({
  team,
  accent,
}: {
  team: TeamCrestModel;
  accent: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const logoUrl = team.logoUrl?.trim() || null;
  const showImage = Boolean(logoUrl && !imageFailed);

  return (
    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-base-content/10 bg-base-content/[0.05] shadow-sm">
      <div
        className="absolute inset-0 opacity-12"
        style={{ backgroundColor: accent }}
        aria-hidden="true"
      />

      {showImage ? (
        <img
          src={logoUrl ?? ""}
          alt={`${team.name} crest`}
          className="relative z-10 h-full w-full object-contain p-2.5"
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span
          className="relative z-10 text-sm font-semibold text-white"
          style={{ color: accent }}
          aria-label={`${team.name} crest fallback`}
        >
          {getFallbackMonogram(team)}
        </span>
      )}
    </div>
  );
}
