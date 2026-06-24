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
  intensity: number; // normalmente 1-5 o 1-10, lo define el ScoringProfile
}

/**
 * Define cómo se calcula el puntaje final a partir de las DescriptorSelection.
 * Esto es lo que permite tener "varios sistemas por defecto + extensibilidad":
 * cada organización puede tener su propio ScoringProfile.
 */
export interface ScoringProfile {
  id: string;
  organizationId: string | null; // null = perfil default del sistema (ej. "SCA clásico")
  name: string;
  description?: string;
  baselineScore: number; // ej. 80, como en SCA / Coffee Rose
  intensityScale: { min: number; max: number };
  formula: 'weighted_sum' | 'weighted_avg' | 'custom';
  attributeWeights?: Record<string, number>;
  customFormulaRef?: string;
  createdAt: number;
}

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
  scoringProfileId: string;
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
 * El puntaje de UN catador para UN café dentro de una sesión.
 */
export interface TasterScore {
  userId: string;
  displayName: string;
  sessionId: string;
  coffeeId: string;
  descriptors: DescriptorSelection[];
  notes?: string;
  computedScore: number;
  updatedAt: number;
}

/**
 * Resultado agregado que ve el Master en el dashboard.
 */
export interface AggregatedCoffeeResult {
  coffeeId: string;
  coffeeName: string;
  tableLabel: string;

  averageScore: number;

  scoreByTaster: {
    userId: string;
    displayName: string;
    score: number;
  }[];

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
  }[];
}