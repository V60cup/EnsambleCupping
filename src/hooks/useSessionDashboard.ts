// src/hooks/useSessionDashboard.ts

import { useEffect, useMemo, useState } from 'react';

import {
  AggregatedCoffeeResult,
  FlavorAttribute,
  SessionCoffee,
  TasterScore,
} from '../types/domain';

import { listenToCoffees } from '../services/sessionService';
import { listenToCoffeeScores } from '../services/scoreService';

function roundTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

interface SessionCoffeeResult {
  coffeeId: string;
  coffeeName: string;
  tableLabel: string;
  averageScore: number;
  totalTasters: number;
}

export function useSessionDashboard(
  sessionId: string,
  attributesById: Record<string, FlavorAttribute>
) {
  const [coffees, setCoffees] = useState<SessionCoffee[]>([]);
  const [scoresByCoffee, setScoresByCoffee] = useState<
    Record<string, TasterScore[]>
  >({});

  useEffect(() => {
    const unsubscribe = listenToCoffees(sessionId, setCoffees);

    return unsubscribe;
  }, [sessionId]);

  useEffect(() => {
    const unsubscribers: Array<() => void> = [];

    coffees.forEach((coffee) => {
      const unsubscribe = listenToCoffeeScores(
        sessionId,
        coffee.id,
        (scores) => {
          setScoresByCoffee((current) => ({
            ...current,
            [coffee.id]: scores,
          }));
        }
      );

      unsubscribers.push(unsubscribe);
    });

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [sessionId, coffees]);

  const ranking = useMemo<SessionCoffeeResult[]>(() => {
    return coffees
      .map((coffee) => {
        const scores = scoresByCoffee[coffee.id] ?? [];

        const averageScore =
          scores.length === 0
            ? 0
            : roundTwo(
                scores.reduce(
                  (sum, score) => sum + score.computedScore,
                  0
                ) / scores.length
              );

        return {
          coffeeId: coffee.id,
          coffeeName: coffee.name,
          tableLabel: coffee.tableLabel,
          averageScore,
          totalTasters: scores.length,
        };
      })
      .sort((a, b) => b.averageScore - a.averageScore);
  }, [coffees, scoresByCoffee]);

  const summary = useMemo(() => {
    if (ranking.length === 0) {
      return {
        totalCoffees: 0,
        bestCoffee: null,
        worstCoffee: null,
        averageSessionScore: 0,
      };
    }

    const bestCoffee = ranking[0];
    const worstCoffee = ranking[ranking.length - 1];

    const averageSessionScore = roundTwo(
      ranking.reduce(
        (sum, coffee) => sum + coffee.averageScore,
        0
      ) / ranking.length
    );

    return {
      totalCoffees: ranking.length,
      bestCoffee,
      worstCoffee,
      averageSessionScore,
    };
  }, [ranking]);

  return {
    ranking,
    summary,
    coffees,
    scoresByCoffee,
  };
}