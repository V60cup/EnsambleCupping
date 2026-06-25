// src/hooks/useSessionDashboard.ts
//
// Ya no rankea cafés de "mejor" a "peor" (no existe un puntaje para
// compararlos). Los cafés se muestran en el orden en que fueron agregados
// a la sesión, cada uno con su propio resumen de consenso/intensidad.

import { useEffect, useMemo, useState } from 'react';

import {
  BasicTasteRatings,
  FlavorAttribute,
  SessionCoffee,
  TasterProfile,
} from '../types/domain';

import { listenToCoffees } from '../services/sessionService';
import { listenToCoffeeProfiles } from '../services/scoreService';

function roundTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

interface SessionCoffeeSummary {
  coffeeId: string;
  coffeeName: string;
  tableLabel: string;
  totalTasters: number;
  averageSuitability: number;
  basicTastesAverage: BasicTasteRatings;
  topDescriptorName: string | null;
}

function averageBasicTastes(profiles: TasterProfile[]): BasicTasteRatings {
  if (profiles.length === 0) {
    return { sweet: 0, sourAcidic: 0, bitter: 0 };
  }

  const totals = profiles.reduce(
    (acc, profile) => ({
      sweet: acc.sweet + profile.basicTastes.sweet,
      sourAcidic: acc.sourAcidic + profile.basicTastes.sourAcidic,
      bitter: acc.bitter + profile.basicTastes.bitter,
    }),
    { sweet: 0, sourAcidic: 0, bitter: 0 }
  );

  return {
    sweet: roundTwo(totals.sweet / profiles.length),
    sourAcidic: roundTwo(totals.sourAcidic / profiles.length),
    bitter: roundTwo(totals.bitter / profiles.length),
  };
}

function topDescriptorName(
  profiles: TasterProfile[],
  attributesById: Record<string, FlavorAttribute>
): string | null {
  const tally: Record<string, number> = {};

  for (const profile of profiles) {
    for (const selection of profile.descriptors) {
      tally[selection.attributeId] = (tally[selection.attributeId] ?? 0) + 1;
    }
  }

  const entries = Object.entries(tally).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    return null;
  }

  const [topAttributeId] = entries[0];
  return attributesById[topAttributeId]?.name ?? topAttributeId;
}

export function useSessionDashboard(
  sessionId: string,
  attributesById: Record<string, FlavorAttribute>
) {
  const [coffees, setCoffees] = useState<SessionCoffee[]>([]);
  const [profilesByCoffee, setProfilesByCoffee] = useState<
    Record<string, TasterProfile[]>
  >({});

  useEffect(() => {
    const unsubscribe = listenToCoffees(sessionId, setCoffees);

    return unsubscribe;
  }, [sessionId]);

  useEffect(() => {
    const unsubscribers: Array<() => void> = [];

    coffees.forEach((coffee) => {
      const unsubscribe = listenToCoffeeProfiles(
        sessionId,
        coffee.id,
        (profiles) => {
          setProfilesByCoffee((current) => ({
            ...current,
            [coffee.id]: profiles,
          }));
        }
      );

      unsubscribers.push(unsubscribe);
    });

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [sessionId, coffees]);

  // Orden de creación, no de "mejor a peor": no hay score con el que rankear.
  const summaries = useMemo<SessionCoffeeSummary[]>(() => {
    return coffees.map((coffee) => {
      const profiles = profilesByCoffee[coffee.id] ?? [];

      const averageSuitability =
        profiles.length === 0
          ? 0
          : roundTwo(
              profiles.reduce((sum, profile) => sum + profile.suitability, 0) /
                profiles.length
            );

      return {
        coffeeId: coffee.id,
        coffeeName: coffee.name,
        tableLabel: coffee.tableLabel,
        totalTasters: profiles.length,
        averageSuitability,
        basicTastesAverage: averageBasicTastes(profiles),
        topDescriptorName: topDescriptorName(profiles, attributesById),
      };
    });
  }, [coffees, profilesByCoffee, attributesById]);

  const summary = useMemo(() => {
    if (summaries.length === 0) {
      return {
        totalCoffees: 0,
        totalTastersAcrossSession: 0,
      };
    }

    const totalTastersAcrossSession = summaries.reduce(
      (sum, coffee) => sum + coffee.totalTasters,
      0
    );

    return {
      totalCoffees: summaries.length,
      totalTastersAcrossSession,
    };
  }, [summaries]);

  return {
    summaries,
    summary,
    coffees,
    profilesByCoffee,
  };
}