// src/hooks/useTasterProfile.ts
//
// Reemplaza al antiguo useTasterScoring. Ya no calcula ningún puntaje: el
// catador caracteriza el café (descriptores de aroma de la rueda, gustos
// básicos, idoneidad/propósito y notas) y eso se persiste tal cual, sin
// reducirlo a un número.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  BasicTasteKey,
  BasicTasteRatings,
  DescriptorSelection,
} from '../types/domain';

import { upsertTasterProfile } from '../services/scoreService';

interface UseTasterProfileArgs {
  sessionId: string;
  coffeeId: string;
  userId: string;
  displayName: string;
  initialSelections?: DescriptorSelection[];
  initialBasicTastes?: BasicTasteRatings;
  initialSuitability?: number;
  debounceMs?: number;
}

const EMPTY_BASIC_TASTES: BasicTasteRatings = {
  sweet: 0,
  sourAcidic: 0,
  bitter: 0,
};

export function useTasterProfile({
  sessionId,
  coffeeId,
  userId,
  displayName,
  initialSelections = [],
  initialBasicTastes = EMPTY_BASIC_TASTES,
  initialSuitability = 0,
  debounceMs = 600,
}: UseTasterProfileArgs) {
  const [selections, setSelections] =
    useState<DescriptorSelection[]>(initialSelections);

  const [basicTastes, setBasicTastes] =
    useState<BasicTasteRatings>(initialBasicTastes);

  const [suitability, setSuitability] = useState<number>(initialSuitability);

  const [notes, setNotes] = useState('');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Evita que el efecto de persistencia dispare una escritura en el montaje
  // inicial (cuando todo sigue igual a los valores iniciales).
  const isFirstRender = useRef(true);

  const persist = useCallback(() => {
    upsertTasterProfile({
      sessionId,
      coffeeId,
      userId,
      displayName,
      descriptors: selections,
      basicTastes,
      suitability,
      notes,
    }).catch((err) => {
      console.warn('No se pudo guardar el perfil de catación:', err);
    });
  }, [
    sessionId,
    coffeeId,
    userId,
    displayName,
    selections,
    basicTastes,
    suitability,
    notes,
  ]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // La primera selección dentro de este café se guarda de inmediato (sin
    // esperar el debounce): así el Master ve aparecer al catador en el
    // dashboard en vivo sin demora perceptible. Los cambios siguientes
    // (ajustar intensidad, agregar más descriptores, tocar gustos básicos)
    // sí usan debounce para no saturar Firestore con cada toque.
    const isFirstMeaningfulChange =
      selections.length === 1 &&
      notes === '' &&
      basicTastes.sweet === 0 &&
      basicTastes.sourAcidic === 0 &&
      basicTastes.bitter === 0 &&
      suitability === 0;

    if (isFirstMeaningfulChange) {
      persist();
    } else {
      debounceRef.current = setTimeout(persist, debounceMs);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [persist, debounceMs]);

  const toggleDescriptor = useCallback((attributeId: string, intensity: number) => {
    setSelections((prev) => {
      const exists = prev.find((selection) => {
        return selection.attributeId === attributeId;
      });

      if (exists) {
        if (intensity <= 0) {
          return prev.filter((selection) => {
            return selection.attributeId !== attributeId;
          });
        }

        return prev.map((selection) => {
          if (selection.attributeId === attributeId) {
            return {
              ...selection,
              intensity,
            };
          }

          return selection;
        });
      }

      if (intensity <= 0) {
        return prev;
      }

      return [
        ...prev,
        {
          attributeId,
          intensity,
        },
      ];
    });
  }, []);

  const setBasicTaste = useCallback((key: BasicTasteKey, value: number) => {
    setBasicTastes((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  return {
    selections,
    basicTastes,
    suitability,
    notes,
    setNotes,
    toggleDescriptor,
    setBasicTaste,
    setSuitability,
  };
}