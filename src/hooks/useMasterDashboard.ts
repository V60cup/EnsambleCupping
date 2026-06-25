// src/hooks/useMasterDashboard.ts

import { useEffect, useMemo, useState } from 'react';

import {
  AggregatedCoffeeResult,
  BasicTasteRatings,
  FlavorAttribute,
  SessionCoffee,
  TasterProfile,
} from '../types/domain';

import { listenToCoffeeProfiles } from '../services/scoreService';

function roundTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

function findRootCategory(
  attributeId: string,
  attributesById: Record<string, FlavorAttribute>
): FlavorAttribute | null {
  let current = attributesById[attributeId];

  if (!current) {
    return null;
  }

  while (current.parentId) {
    const parent = attributesById[current.parentId];

    if (!parent) {
      break;
    }

    current = parent;
  }

  return current;
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

function aggregate(
  coffee: SessionCoffee,
  profiles: TasterProfile[],
  attributesById: Record<string, FlavorAttribute>
): AggregatedCoffeeResult {
  const descriptorTally: Record<
    string,
    {
      count: number;
      intensitySum: number;
    }
  > = {};

  const categoryTally: Record<
    string,
    {
      name: string;
      count: number;
      intensitySum: number;
    }
  > = {};

  for (const profile of profiles) {
    const uniqueDescriptorIdsForTaster = new Set<string>();

    for (const selection of profile.descriptors) {
      if (!descriptorTally[selection.attributeId]) {
        descriptorTally[selection.attributeId] = {
          count: 0,
          intensitySum: 0,
        };
      }

      if (!uniqueDescriptorIdsForTaster.has(selection.attributeId)) {
        descriptorTally[selection.attributeId].count += 1;
        uniqueDescriptorIdsForTaster.add(selection.attributeId);
      }

      descriptorTally[selection.attributeId].intensitySum += selection.intensity;

      const rootCategory = findRootCategory(selection.attributeId, attributesById);

      if (rootCategory) {
        if (!categoryTally[rootCategory.id]) {
          categoryTally[rootCategory.id] = {
            name: rootCategory.name,
            count: 0,
            intensitySum: 0,
          };
        }

        categoryTally[rootCategory.id].count += 1;
        categoryTally[rootCategory.id].intensitySum += selection.intensity;
      }
    }
  }

  const topDescriptors = Object.entries(descriptorTally)
    .map(([attributeId, value]) => {
      const avgIntensity =
        value.count === 0 ? 0 : roundTwo(value.intensitySum / value.count);

      return {
        attributeId,
        name: attributesById[attributeId]?.name ?? attributeId,
        count: value.count,
        avgIntensity,
      };
    })
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }

      return b.avgIntensity - a.avgIntensity;
    })
    .slice(0, 8);

  const descriptorConsensus = Object.entries(descriptorTally)
    .map(([attributeId, value]) => ({
      attributeId,
      name: attributesById[attributeId]?.name ?? attributeId,
      percentage:
        profiles.length === 0 ? 0 : roundTwo((value.count / profiles.length) * 100),
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 8);

  const categorySummary = Object.entries(categoryTally)
    .map(([categoryId, value]) => ({
      categoryId,
      name: value.name,
      count: value.count,
      avgIntensity: value.count === 0 ? 0 : roundTwo(value.intensitySum / value.count),
    }))
    .sort((a, b) => b.count - a.count);

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
    topDescriptors,
    descriptorConsensus,
    categorySummary,
    basicTastesAverage: averageBasicTastes(profiles),
    averageSuitability,
  };
}

export function useCoffeeDashboard(
  sessionId: string,
  coffee: SessionCoffee | null,
  attributesById: Record<string, FlavorAttribute>
) {
  const [profiles, setProfiles] = useState<TasterProfile[]>([]);

  useEffect(() => {
    if (!coffee) {
      setProfiles([]);
      return;
    }

    const unsubscribe = listenToCoffeeProfiles(sessionId, coffee.id, setProfiles);

    return unsubscribe;
  }, [sessionId, coffee?.id]);

  const result = useMemo(() => {
    if (!coffee) {
      return null;
    }

    return aggregate(coffee, profiles, attributesById);
  }, [coffee, profiles, attributesById]);

  const kpis = useMemo(() => {
    const totalTasters = profiles.length;

    const totalDescriptorMentions = profiles.reduce((sum, profile) => {
      return sum + profile.descriptors.length;
    }, 0);

    const averageDescriptorsPerTaster =
      totalTasters === 0
        ? 0
        : roundTwo(totalDescriptorMentions / totalTasters);

    return {
      totalTasters,
      totalDescriptorMentions,
      averageDescriptorsPerTaster,
      averageSuitability: result?.averageSuitability ?? 0,
    };
  }, [profiles, result]);

  return {
    result,
    rawProfiles: profiles,
    kpis,
  };
}