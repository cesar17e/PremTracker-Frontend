"use client";

import {
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  addMyFavorite,
  getMyFavorites,
  removeMyFavorite,
  type FavoriteTeamCandidate,
} from "@/lib/api/me";
import { isAppApiError } from "@/lib/api/errors";
import { getTeams } from "@/lib/api/teams";
import { useAuth } from "@/hooks/use-auth";
import type { FavoriteTeam } from "@/types/me";
import type { TeamListItem } from "@/types/teams";

type FavoritesStatus = "idle" | "loading" | "ready" | "error";

type FavoritesContextValue = {
  favorites: FavoriteTeam[];
  favoriteIds: Set<number>;
  status: FavoritesStatus;
  errorMessage: string | null;
  pendingTeamIds: Set<number>;
  refreshFavorites: () => Promise<void>;
  isFavorite: (teamId: number) => boolean;
  toggleFavorite: (
    teamId: number,
    team?: FavoriteTeamCandidate
  ) => Promise<boolean>;
};

export const FavoritesContext = createContext<FavoritesContextValue | undefined>(
  undefined
);

function getFavoritesError(error: unknown) {
  if (isAppApiError(error)) {
    if (error.status === 429) {
      return "Favorites are being rate limited right now. Please wait a moment and try again.";
    }

    return error.message;
  }

  return "We couldn't load your saved clubs right now.";
}

function candidateToFavorite(team: FavoriteTeamCandidate): FavoriteTeam {
  return {
    ...team,
    favoritedAt: new Date().toISOString(),
  };
}

function mergeFavoriteMetadata(
  favorites: FavoriteTeam[],
  teamsDirectory: TeamListItem[] | null
) {
  if (!teamsDirectory) {
    return favorites;
  }

  const teamMap = new Map(teamsDirectory.map((team) => [team.id, team]));

  return favorites.map((favorite) => {
    const directoryTeam = teamMap.get(favorite.id);
    if (!directoryTeam) {
      return favorite;
    }

    return {
      ...favorite,
      shortName: favorite.shortName ?? directoryTeam.shortName,
      symbolicName: directoryTeam.symbolicName,
      logoUrl: directoryTeam.logoUrl,
      color: favorite.color ?? directoryTeam.color,
      awayColor: favorite.awayColor ?? directoryTeam.awayColor,
      imageVersion: favorite.imageVersion ?? directoryTeam.imageVersion,
    };
  });
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { status: authStatus } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteTeam[]>([]);
  const [status, setStatus] = useState<FavoritesStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingTeamIds, setPendingTeamIds] = useState<Set<number>>(new Set());
  const loadVersionRef = useRef(0);

  async function refreshFavorites() {
    const loadVersion = ++loadVersionRef.current;
    setStatus("loading");
    setErrorMessage(null);

    try {
      const [response, teamsDirectory] = await Promise.all([
        getMyFavorites(),
        getTeams().catch(() => null),
      ]);
      if (loadVersion !== loadVersionRef.current) {
        return;
      }

      setFavorites(mergeFavoriteMetadata(response.favorites, teamsDirectory));
      setStatus("ready");
    } catch (error) {
      if (loadVersion !== loadVersionRef.current) {
        return;
      }

      setFavorites([]);
      setStatus("error");
      setErrorMessage(getFavoritesError(error));
    }
  }

  useEffect(() => {
    if (authStatus === "authenticated") {
      void refreshFavorites();
      return;
    }

    loadVersionRef.current += 1;
    setFavorites([]);
    setStatus(authStatus === "loading" ? "loading" : "idle");
    setErrorMessage(null);
    setPendingTeamIds(new Set());
  }, [authStatus]);

  const favoriteIds = useMemo(
    () => new Set(favorites.map((team) => team.id)),
    [favorites]
  );

  async function toggleFavorite(teamId: number, team?: FavoriteTeamCandidate) {
    if (pendingTeamIds.has(teamId)) {
      return favoriteIds.has(teamId);
    }

    const wasFavorite = favoriteIds.has(teamId);
    const optimisticFavorite =
      !wasFavorite && team ? candidateToFavorite(team) : null;

    setPendingTeamIds((current) => new Set(current).add(teamId));
    setErrorMessage(null);

    if (wasFavorite) {
      setFavorites((current) => current.filter((item) => item.id !== teamId));
    } else if (optimisticFavorite) {
      setFavorites((current) => [optimisticFavorite, ...current]);
    }

    try {
      if (wasFavorite) {
        await removeMyFavorite(teamId);
      } else {
        await addMyFavorite(teamId);
      }

      setStatus("ready");

      if (!optimisticFavorite) {
        await refreshFavorites();
      }

      return !wasFavorite;
    } catch (error) {
      setErrorMessage(getFavoritesError(error));
      setFavorites((current) => {
        if (wasFavorite) {
          if (!team) {
            return current;
          }

          return [candidateToFavorite(team), ...current];
        }

        return current.filter((item) => item.id !== teamId);
      });
      throw error;
    } finally {
      setPendingTeamIds((current) => {
        const next = new Set(current);
        next.delete(teamId);
        return next;
      });
    }
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoriteIds,
        status,
        errorMessage,
        pendingTeamIds,
        refreshFavorites,
        isFavorite: (teamId: number) => favoriteIds.has(teamId),
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}
