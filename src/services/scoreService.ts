// src/services/scoreService.ts
// Escritura y lectura de perfiles de catación. Clave de diseño: un único
// documento por (sessionId, coffeeId, userId) que se SOBREESCRIBE en cada
// cambio (setDoc con merge), en vez de crear un documento nuevo por cada
// click. Esto mantiene el costo de Firestore bajo y hace trivial el listener
// en vivo del Master.
//
// No se calcula ni se guarda ningún puntaje: lo que se persiste es la
// caracterización sensorial completa del catador (descriptores de aroma +
// gustos básicos + idoneidad + notas).

import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { BasicTasteRatings, DescriptorSelection, TasterProfile } from '../types/domain';

function profileDocRef(sessionId: string, coffeeId: string, userId: string) {
  return doc(db, 'sessions', sessionId, 'coffees', coffeeId, 'scores', userId);
}

export async function upsertTasterProfile(args: {
  sessionId: string;
  coffeeId: string;
  userId: string;
  displayName: string;
  descriptors: DescriptorSelection[];
  basicTastes: BasicTasteRatings;
  suitability: number;
  notes?: string;
}) {
  const ref = profileDocRef(args.sessionId, args.coffeeId, args.userId);
  const payload: TasterProfile = {
    userId: args.userId,
    displayName: args.displayName,
    sessionId: args.sessionId,
    coffeeId: args.coffeeId,
    descriptors: args.descriptors,
    basicTastes: args.basicTastes,
    suitability: args.suitability,
    notes: args.notes,
    updatedAt: Date.now(),
  };
  // merge: true para no pisar campos si en el futuro agregas más sub-escritura parcial
  await setDoc(ref, payload, { merge: true });
}

/**
 * Listener en vivo para TODOS los perfiles de catación de un café dentro de
 * una sesión. Esto es lo que usa el Master Dashboard: no hace falta pull
 * manual, Firestore empuja los cambios apenas un catador sincroniza (incluso
 * si escribió offline y reconectó después).
 */
export function listenToCoffeeProfiles(
  sessionId: string,
  coffeeId: string,
  callback: (profiles: TasterProfile[]) => void
) {
  const profilesCol = collection(db, 'sessions', sessionId, 'coffees', coffeeId, 'scores');
  return onSnapshot(profilesCol, (snap) => {
    const profiles = snap.docs.map((d) => d.data() as TasterProfile);
    callback(profiles);
  });
}

/**
 * Listener para el perfil de UN catador específico en UN café — útil para
 * que el propio catador vea su selección reflejada (ej. al reabrir la app).
 */
export function listenToOwnProfile(
  sessionId: string,
  coffeeId: string,
  userId: string,
  callback: (profile: TasterProfile | null) => void
) {
  const ref = profileDocRef(sessionId, coffeeId, userId);
  return onSnapshot(ref, (snap) => {
    callback(snap.exists() ? (snap.data() as TasterProfile) : null);
  });
}