// src/types/domain.ts
// Tipos centrales del dominio. Este archivo es el "contrato" que comparten
// la UI, el motor de scoring y la capa de Firestore.

export type Role = 'master' | 'taster';

export type Polarity = 'positive' | 'negative' | 'neutral';

/**
 * Un atributo de sabor / descriptor seleccionable en la rueda.
 * Puede ser global (organizationId === null) o propio de una organización.
 * La jerarquía (parentId) permite construir la rueda de adentro hacia afuera,
 * igual que en Coffee Rose: categorías generales en el centro, específicas en el borde.
 */
export interface FlavorAttribute {
  id: string;
  organizationId: string | null; // null = atributo default del sistema
  name: string;
  parentId: string | null; // null = nodo raíz del wheel
  polarity: Polarity;
  defaultWeight: number; // peso usado por el motor de scoring si el profile no lo sobreescribe
  createdAt: number;
}

/**
 * Selección concreta que hace un catador: qué atributo eligió y con qué intensidad.
 */
export interface DescriptorSelection {
  attributeId: string;
  intensity: number; // normalmente 1-5 o 1-10, lo define la rueda en uso
}

/**
 * Los tres gustos básicos que se evalúan de forma independiente a la rueda
 * de aromas, igual que en las hojas de cata estilo SCA: cada uno con su
 * propia escala de intensidad (0-9), sin jerarquía ni sub-descriptores.
 */
export type BasicTasteKey = 'sweet' | 'sourAcidic' | 'bitter';

export type BasicTasteRatings = Record<BasicTasteKey, number>;

export const BASIC_TASTE_SCALE = { min: 0, max: 9 };

export const SUITABILITY_SCALE = { min: 0, max: 9 };

export interface Organization {
  id: string;
  name: string;
  createdAt: number;
}

export interface AppUser {
  id: string;
  displayName: string;
  email: string;
  organizationId: string | null;
}

export type SessionStatus = 'open' | 'closed';

/**
 * Una sesión de catación (= "flight" en la terminología de Coffee Rose).
 * Tiene un master que la crea y controla, y N participantes (tasters).
 */
export interface TastingSession {
  id: string;
  name: string;
  masterId: string;
  status: SessionStatus;
  joinCode: string;
  isBlind: boolean;
  createdAt: number;
  closedAt?: number;
}

export interface SessionParticipant {
  userId: string;
  displayName: string;
  role: Role;
  joinedAt: number;
}

/**
 * Un café dentro de una sesión.
 */
export interface SessionCoffee {
  id: string;
  sessionId: string;
  name: string;
  tableLabel: string;
  order: number;
  createdAt: number;
}

/**
 * La caracterización sensorial que hace UN catador para UN café dentro de
 * una sesión: qué descriptores de aroma marcó (con su intensidad), cómo
 * calificó los gustos básicos, qué tan adecuado le pareció el café para su
 * propósito (suitability), y sus notas libres. No hay un puntaje calculado:
 * el objetivo es categorizar y describir, no puntuar.
 */
export interface TasterProfile {
  userId: string;
  displayName: string;
  sessionId: string;
  coffeeId: string;
  descriptors: DescriptorSelection[];
  basicTastes: BasicTasteRatings;
  suitability: number;
  notes?: string;
  updatedAt: number;
}

/**
 * Resultado agregado que ve el Master en el dashboard: no es un promedio de
 * puntaje, sino un consenso de qué tan presente está cada descriptor /
 * categoría / gusto básico entre los catadores que evaluaron el café.
 */
export interface AggregatedCoffeeResult {
  coffeeId: string;
  coffeeName: string;
  tableLabel: string;

  totalTasters: number;

  topDescriptors: {
    attributeId: string;
    name: string;
    count: number;
    avgIntensity: number;
  }[];

  descriptorConsensus: {
    attributeId: string;
    name: string;
    percentage: number;
  }[];

  categorySummary: {
    categoryId: string;
    name: string;
    count: number;
    avgIntensity: number;
  }[];

  basicTastesAverage: BasicTasteRatings;

  averageSuitability: number;
}