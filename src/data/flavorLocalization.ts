// src/data/flavorLocalization.ts

import { FlavorAttribute } from '../types/domain';

export interface FlavorCategoryStyle {
  displayName: string;
  shortName: string;
  color: string;
  examples: string[];
}

export interface FlavorDisplayOverride {
  displayName?: string;
  shortName?: string;
  color?: string;
  examples?: string[];
}

const FALLBACK_COLORS = [
  '#9B5DE5',
  '#FF6B4A',
  '#FFD166',
  '#C9184A',
  '#F4A261',
  '#5C4033',
  '#B08968',
  '#2F9E44',
  '#007F5F',
  '#495057',
];

const CATEGORY_STYLES: Record<string, FlavorCategoryStyle> = {
  cm_floral: {
    displayName: 'Floral',
    shortName: 'Floral',
    color: '#9B5DE5',
    examples: ['jazmín', 'rosa', 'lavanda', 'manzanilla'],
  },
  cm_frutal: {
    displayName: 'Frutal',
    shortName: 'Frutal',
    color: '#FF6B4A',
    examples: ['frutilla', 'durazno', 'mandarina', 'mango'],
  },
  cm_fruta_deshidratada: {
    displayName: 'Fruta deshidratada',
    shortName: 'Deshidratada',
    color: '#7B2D26',
    examples: ['huesillo', 'damasco seco', 'ciruela seca', 'pasa'],
  },
  cm_dulce: {
    displayName: 'Dulce',
    shortName: 'Dulce',
    color: '#F4A261',
    examples: ['miel', 'caramelo', 'chancaca', 'azúcar rubia'],
  },
  cm_chocolate: {
    displayName: 'Chocolate',
    shortName: 'Chocolate',
    color: '#5C4033',
    examples: ['cacao', 'chocolate amargo', 'chocolate en polvo'],
  },
  cm_frutos_secos: {
    displayName: 'Frutos secos',
    shortName: 'Frutos secos',
    color: '#B08968',
    examples: ['nuez', 'almendra', 'maní tostado', 'avellana'],
  },
  cm_especias: {
    displayName: 'Especias',
    shortName: 'Especias',
    color: '#C76F2E',
    examples: ['canela', 'clavo de olor', 'jengibre', 'pimienta'],
  },
  cm_verde: {
    displayName: 'Verde / herbal',
    shortName: 'Verde',
    color: '#2F9E44',
    examples: ['menta', 'cedrón', 'boldo', 'pasto cortado'],
  },
  cm_tostado: {
    displayName: 'Tostado',
    shortName: 'Tostado',
    color: '#6F4E37',
    examples: ['pan tostado', 'caramelo oscuro', 'humo', 'brasas'],
  },
  cm_defectos: {
    displayName: 'Defectos',
    shortName: 'Defectos',
    color: '#495057',
    examples: ['fermentado', 'moho', 'caucho', 'medicinal'],
  },
};

const ATTRIBUTE_OVERRIDES: Record<string, FlavorDisplayOverride> = {
  cm_frutal_citricos: {
    displayName: 'Cítricos',
    shortName: 'Cítricos',
    color: '#FFD166',
    examples: ['limón de Pica', 'mandarina', 'naranja', 'pomelo'],
  },
  cm_frutal_limon: {
    displayName: 'Limón de Pica',
    shortName: 'Limón Pica',
    color: '#D9ED37',
    examples: ['limón de Pica', 'limón sutil', 'piel de limón'],
  },
  cm_frutal_naranja: {
    color: '#F77F00',
    examples: ['naranja dulce', 'piel de naranja', 'jugo de naranja'],
  },
  cm_frutal_mandarina: {
    color: '#FF9F1C',
    examples: ['mandarina', 'clementina', 'piel de mandarina'],
  },
  cm_frutal_pomelo: {
    color: '#FFB703',
    examples: ['pomelo rosado', 'pomelo amarillo', 'cáscara cítrica'],
  },
  cm_frutal_bergamota: {
    color: '#BFD200',
    examples: ['bergamota', 'té Earl Grey', 'cáscara cítrica floral'],
  },

  cm_frutal_frutos_rojos: {
    displayName: 'Frutos rojos',
    shortName: 'Rojos',
    color: '#C9184A',
    examples: ['frutilla', 'frambuesa', 'mora', 'arándano'],
  },
  cm_frutal_frutilla: {
    color: '#E5383B',
    examples: ['frutilla fresca', 'mermelada de frutilla'],
  },
  cm_frutal_frambuesa: {
    color: '#C9184A',
    examples: ['frambuesa', 'mermelada de frambuesa'],
  },
  cm_frutal_arandano: {
    color: '#5A189A',
    examples: ['arándano', 'arándano maduro', 'mermelada oscura'],
  },
  cm_frutal_mora: {
    color: '#6D214F',
    examples: ['mora', 'zarzamora', 'fruta negra madura'],
  },

  cm_frutal_fruta_de_carozo: {
    displayName: 'Fruta de carozo',
    shortName: 'Carozo',
    color: '#F77F00',
    examples: ['durazno', 'damasco', 'ciruela'],
  },
  cm_frutal_durazno: {
    color: '#FFB703',
    examples: ['durazno', 'durazno conservero', 'néctar de durazno'],
  },
  cm_frutal_damasco: {
    color: '#FB8500',
    examples: ['damasco', 'damasco seco', 'mermelada de damasco'],
  },
  cm_frutal_ciruela: {
    color: '#9D4EDD',
    examples: ['ciruela fresca', 'ciruela madura', 'ciruela roja'],
  },

  cm_frutal_tropical: {
    displayName: 'Tropical',
    shortName: 'Tropical',
    color: '#2EC4B6',
    examples: ['mango', 'piña', 'maracuyá', 'melón'],
  },
  cm_frutal_mango: {
    color: '#FFB703',
    examples: ['mango', 'mango maduro', 'mango de Pica'],
  },
  cm_frutal_pina: {
    displayName: 'Piña',
    color: '#FFD166',
    examples: ['piña fresca', 'piña madura', 'jugo de piña'],
  },
  cm_frutal_melon: {
    displayName: 'Melón',
    color: '#A7C957',
    examples: ['melón calameño', 'melón tuna', 'melón maduro'],
  },

  cm_fruta_deshidratada_pasa: {
    color: '#6D2E46',
    examples: ['pasa morena', 'uva pasa', 'fruta seca oscura'],
  },
  cm_fruta_deshidratada_ciruela: {
    color: '#4A1942',
    examples: ['ciruela seca', 'huesillo oscuro', 'fruta compotada'],
  },
  cm_fruta_deshidratada_datil: {
    displayName: 'Huesillo',
    shortName: 'Huesillo',
    color: '#9C6644',
    examples: ['huesillo', 'damasco seco', 'dátil'],
  },

  cm_dulce_miel: {
    color: '#F6BD60',
    examples: ['miel de ulmo', 'miel floral', 'miel suave'],
  },
  cm_dulce_caramelo: {
    color: '#D97706',
    examples: ['caramelo', 'caluga', 'toffee'],
  },
  cm_dulce_vainilla: {
    color: '#F5E6A7',
    examples: ['vainilla', 'crema pastelera', 'galleta de vainilla'],
  },
  cm_dulce_panela: {
    displayName: 'Azúcar rubia',
    shortName: 'Azúcar rubia',
    color: '#B5651D',
    examples: ['azúcar rubia', 'chancaca', 'melaza', 'panela'],
  },
  cm_dulce_chancaca: {
    displayName: 'Chancaca',
    shortName: 'Chancaca',
    color: '#8B4513',
    examples: ['chancaca', 'miel de chancaca', 'caramelo oscuro'],
  },

  cm_chocolate_cacao: {
    color: '#6F4E37',
    examples: ['cacao', 'cacao amargo', 'nibs de cacao'],
  },
  cm_chocolate_negro: {
    displayName: 'Chocolate amargo',
    shortName: 'Choc. amargo',
    color: '#432818',
    examples: ['chocolate amargo', 'chocolate 70%', 'cacao intenso'],
  },
  cm_chocolate_leche: {
    color: '#8D6E63',
    examples: ['chocolate con leche', 'cacao dulce', 'leche chocolatada'],
  },

  cm_frutos_secos_almendra: {
    color: '#D4A373',
    examples: ['almendra', 'almendra tostada', 'mazapán suave'],
  },
  cm_frutos_secos_avellana: {
    color: '#A47148',
    examples: ['avellana europea', 'avellana tostada'],
  },
  cm_frutos_secos_nuez: {
    color: '#7F5539',
    examples: ['nuez', 'nuez chilena', 'nuez tostada'],
  },
  cm_frutos_secos_mani: {
    displayName: 'Maní tostado',
    shortName: 'Maní',
    color: '#BC8A5F',
    examples: ['maní tostado', 'mantequilla de maní', 'maní confitado'],
  },

  cm_especias_canela: {
    color: '#B85C38',
    examples: ['canela', 'rollo de canela', 'arroz con leche'],
  },
  cm_especias_clavo: {
    color: '#7B2D26',
    examples: ['clavo de olor', 'especia dulce', 'infusión especiada'],
  },
  cm_especias_jengibre: {
    color: '#DDA15E',
    examples: ['jengibre', 'galleta de jengibre'],
  },
  cm_especias_cardamomo: {
    color: '#588157',
    examples: ['cardamomo', 'chai', 'especia verde'],
  },
  cm_especias_pimienta: {
    color: '#343A40',
    examples: ['pimienta negra', 'pimienta blanca', 'picor especiado'],
  },

  cm_verde_te_verde: {
    displayName: 'Té verde',
    color: '#74C69D',
    examples: ['té verde', 'mate suave', 'infusión herbal'],
  },
  cm_verde_hierba_fresca: {
    displayName: 'Hierba fresca',
    shortName: 'Hierba',
    color: '#2F9E44',
    examples: ['pasto cortado', 'hoja fresca', 'tallo verde'],
  },
  cm_verde_romero: {
    color: '#52796F',
    examples: ['romero', 'hierba mediterránea', 'pino suave'],
  },
  cm_verde_albahaca: {
    color: '#40916C',
    examples: ['albahaca', 'hoja verde aromática'],
  },
  cm_verde_pasto: {
    displayName: 'Pasto cortado',
    shortName: 'Pasto',
    color: '#1B4332',
    examples: ['pasto cortado', 'césped húmedo', 'hoja verde cruda'],
  },

  cm_tostado_pan_tostado: {
    displayName: 'Pan tostado',
    shortName: 'Pan tost.',
    color: '#B08968',
    examples: ['pan tostado', 'marraqueta tostada', 'galleta horneada'],
  },
  cm_tostado_caramelo_oscuro: {
    displayName: 'Caramelo oscuro',
    shortName: 'Caram. oscuro',
    color: '#7F4F24',
    examples: ['caramelo oscuro', 'caluga tostada', 'azúcar quemada'],
  },
  cm_tostado_tabaco: {
    color: '#6F4E37',
    examples: ['tabaco seco', 'hoja seca', 'madera seca'],
  },
  cm_tostado_humo: {
    color: '#343A40',
    examples: ['humo', 'brasas', 'tostado intenso', 'merkén suave'],
  },

  cm_defectos_fermentado: {
    color: '#6A040F',
    examples: ['fruta sobremadura', 'fermento fuerte', 'vinagre suave'],
  },
  cm_defectos_medicinal: {
    color: '#3A0CA3',
    examples: ['medicinal', 'químico', 'jarabe'],
  },
  cm_defectos_caucho: {
    color: '#212529',
    examples: ['caucho', 'goma quemada', 'neumático'],
  },
  cm_defectos_petroleo: {
    displayName: 'Petróleo',
    color: '#111111',
    examples: ['petróleo', 'solvente', 'combustible'],
  },
  cm_defectos_moho: {
    color: '#606C38',
    examples: ['moho', 'humedad', 'cartón húmedo'],
  },
  cm_defectos_salado: {
    color: '#577590',
    examples: ['salado', 'agua salobre', 'mineral intenso'],
  },
};

const KEYWORD_CATEGORIES: Array<{
  categoryId: keyof typeof CATEGORY_STYLES;
  keywords: string[];
}> = [
  {
    categoryId: 'cm_floral',
    keywords: ['floral', 'flor', 'jazmin', 'rosa', 'lavanda', 'manzanilla'],
  },
  {
    categoryId: 'cm_frutal',
    keywords: [
      'fruta',
      'frutal',
      'citrico',
      'limon',
      'naranja',
      'mandarina',
      'frutilla',
      'mango',
      'durazno',
    ],
  },
  {
    categoryId: 'cm_fruta_deshidratada',
    keywords: ['deshidratada', 'pasa', 'ciruela seca', 'datil', 'huesillo'],
  },
  {
    categoryId: 'cm_dulce',
    keywords: ['dulce', 'miel', 'caramelo', 'azucar', 'chancaca', 'panela'],
  },
  {
    categoryId: 'cm_chocolate',
    keywords: ['chocolate', 'cacao', 'cocoa'],
  },
  {
    categoryId: 'cm_frutos_secos',
    keywords: ['frutos secos', 'almendra', 'avellana', 'nuez', 'mani'],
  },
  {
    categoryId: 'cm_especias',
    keywords: ['especia', 'canela', 'clavo', 'jengibre', 'pimienta'],
  },
  {
    categoryId: 'cm_verde',
    keywords: ['verde', 'herbal', 'hierba', 'pasto', 'romero', 'albahaca'],
  },
  {
    categoryId: 'cm_tostado',
    keywords: ['tostado', 'humo', 'tabaco', 'pan tostado'],
  },
  {
    categoryId: 'cm_defectos',
    keywords: [
      'defecto',
      'fermentado',
      'medicinal',
      'caucho',
      'petroleo',
      'moho',
      'salado',
    ],
  },
];

export function getFlavorDisplayName(attr: FlavorAttribute | null): string {
  if (!attr) return '';

  const category = CATEGORY_STYLES[attr.id];
  const override = ATTRIBUTE_OVERRIDES[attr.id];

  return override?.displayName ?? category?.displayName ?? attr.name;
}

export function getFlavorShortName(attr: FlavorAttribute | null): string {
  if (!attr) return '';

  const category = CATEGORY_STYLES[attr.id];
  const override = ATTRIBUTE_OVERRIDES[attr.id];

  return (
    override?.shortName ??
    override?.displayName ??
    category?.shortName ??
    category?.displayName ??
    attr.name
  );
}

export function getFlavorExamples(attr: FlavorAttribute | null): string[] {
  if (!attr) return [];

  const category = CATEGORY_STYLES[attr.id];
  const override = ATTRIBUTE_OVERRIDES[attr.id];

  return override?.examples ?? category?.examples ?? [];
}

export function getFlavorColor(
  attr: FlavorAttribute,
  lineage: FlavorAttribute[],
  fallbackIndex: number
): string {
  const hierarchy = lineage.length > 0 ? lineage : [attr];

  for (let index = hierarchy.length - 1; index >= 0; index -= 1) {
    const item = hierarchy[index];
    const overrideColor = ATTRIBUTE_OVERRIDES[item.id]?.color;
    const categoryColor = CATEGORY_STYLES[item.id]?.color;

    if (overrideColor) return overrideColor;
    if (categoryColor) return categoryColor;
  }

  const normalizedLineage = normalizeText(
    hierarchy.map((item) => item.name).join(' ')
  );

  const matchedCategory = KEYWORD_CATEGORIES.find((category) => {
    return category.keywords.some((keyword) => {
      return normalizedLineage.includes(normalizeText(keyword));
    });
  });

  if (matchedCategory) {
    return CATEGORY_STYLES[matchedCategory.categoryId].color;
  }

  return FALLBACK_COLORS[fallbackIndex % FALLBACK_COLORS.length];
}

export function tintColor(hexColor: string, amount: number): string {
  return mixHexColor(hexColor, '#FFFFFF', clamp01(amount));
}

export function shadeColor(hexColor: string, amount: number): string {
  return mixHexColor(hexColor, '#000000', clamp01(amount));
}

export function getReadableTextColor(hexColor: string): '#111827' | '#FFFFFF' {
  const rgb = hexToRgb(hexColor);

  if (!rgb) return '#111827';

  const [r, g, b] = rgb.map((value) => {
    const normalized = value / 255;

    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });

  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  return luminance > 0.48 ? '#111827' : '#FFFFFF';
}

function mixHexColor(fromHex: string, toHex: string, amount: number): string {
  const fromRgb = hexToRgb(fromHex);
  const toRgb = hexToRgb(toHex);

  if (!fromRgb || !toRgb) return fromHex;

  const mixed = fromRgb.map((fromValue, index) => {
    const toValue = toRgb[index];

    return Math.round(fromValue + (toValue - fromValue) * amount);
  });

  return rgbToHex(mixed[0], mixed[1], mixed[2]);
}

function hexToRgb(hexColor: string): [number, number, number] | null {
  const cleaned = hexColor.replace('#', '').trim();

  if (cleaned.length === 3) {
    const expanded = cleaned
      .split('')
      .map((character) => character + character)
      .join('');

    return hexToRgb(expanded);
  }

  if (!/^[0-9A-Fa-f]{6}$/.test(cleaned)) return null;

  return [
    parseInt(cleaned.slice(0, 2), 16),
    parseInt(cleaned.slice(2, 4), 16),
    parseInt(cleaned.slice(4, 6), 16),
  ];
}

function rgbToHex(red: number, green: number, blue: number): string {
  return `#${[red, green, blue]
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')}`;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}