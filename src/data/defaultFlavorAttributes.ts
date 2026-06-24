// src/data/defaultFlavorAttributes.ts

import { FlavorAttribute } from '../types/domain';

const now = Date.now();

function root(
  id: string,
  name: string,
  defaultWeight = 1
): FlavorAttribute {
  return {
    id,
    organizationId: null,
    name,
    parentId: null,
    polarity: 'positive',
    defaultWeight,
    createdAt: now,
  };
}

function child(
  id: string,
  name: string,
  parentId: string,
  polarity: FlavorAttribute['polarity'] = 'positive',
  defaultWeight = 1
): FlavorAttribute {
  return {
    id,
    organizationId: null,
    name,
    parentId,
    polarity,
    defaultWeight,
    createdAt: now,
  };
}

export const DEFAULT_FLAVOR_ATTRIBUTES: FlavorAttribute[] = [
  root('cm_floral', 'Floral', 1.1),
  child('cm_floral_jazmin', 'Jazmín', 'cm_floral'),
  child('cm_floral_rosa', 'Rosa', 'cm_floral'),
  child('cm_floral_lavanda', 'Lavanda', 'cm_floral'),
  child('cm_floral_manzanilla', 'Manzanilla', 'cm_floral'),
  child('cm_floral_flor_de_cafe', 'Flor de café', 'cm_floral'),

  root('cm_frutal', 'Frutal', 1.15),

  child('cm_frutal_citricos', 'Cítricos', 'cm_frutal'),
  child('cm_frutal_limon', 'Limón', 'cm_frutal_citricos'),
  child('cm_frutal_naranja', 'Naranja', 'cm_frutal_citricos'),
  child('cm_frutal_mandarina', 'Mandarina', 'cm_frutal_citricos'),
  child('cm_frutal_pomelo', 'Pomelo', 'cm_frutal_citricos'),
  child('cm_frutal_bergamota', 'Bergamota', 'cm_frutal_citricos'),

  child('cm_frutal_frutos_rojos', 'Frutos rojos', 'cm_frutal'),
  child('cm_frutal_frutilla', 'Frutilla', 'cm_frutal_frutos_rojos'),
  child('cm_frutal_frambuesa', 'Frambuesa', 'cm_frutal_frutos_rojos'),
  child('cm_frutal_arandano', 'Arándano', 'cm_frutal_frutos_rojos'),
  child('cm_frutal_mora', 'Mora', 'cm_frutal_frutos_rojos'),

  child('cm_frutal_fruta_de_carozo', 'Fruta de carozo', 'cm_frutal'),
  child('cm_frutal_durazno', 'Durazno', 'cm_frutal_fruta_de_carozo'),
  child('cm_frutal_damasco', 'Damasco', 'cm_frutal_fruta_de_carozo'),
  child('cm_frutal_ciruela', 'Ciruela', 'cm_frutal_fruta_de_carozo'),

  child('cm_frutal_tropical', 'Tropical', 'cm_frutal'),
  child('cm_frutal_mango', 'Mango', 'cm_frutal_tropical'),
  child('cm_frutal_pina', 'Piña', 'cm_frutal_tropical'),
  child('cm_frutal_melon', 'Melón', 'cm_frutal_tropical'),

  root('cm_fruta_deshidratada', 'Fruta deshidratada', 0.95),
  child('cm_fruta_deshidratada_pasa', 'Pasa', 'cm_fruta_deshidratada'),
  child('cm_fruta_deshidratada_ciruela', 'Ciruela seca', 'cm_fruta_deshidratada'),
  child('cm_fruta_deshidratada_datil', 'Dátil', 'cm_fruta_deshidratada'),

  root('cm_dulce', 'Dulce', 1),
  child('cm_dulce_miel', 'Miel', 'cm_dulce'),
  child('cm_dulce_caramelo', 'Caramelo', 'cm_dulce'),
  child('cm_dulce_vainilla', 'Vainilla', 'cm_dulce'),
  child('cm_dulce_panela', 'Panela', 'cm_dulce'),
  child('cm_dulce_chancaca', 'Chancaca', 'cm_dulce'),

  root('cm_chocolate', 'Chocolate', 1),
  child('cm_chocolate_cacao', 'Cacao', 'cm_chocolate'),
  child('cm_chocolate_negro', 'Chocolate negro', 'cm_chocolate'),
  child('cm_chocolate_leche', 'Chocolate con leche', 'cm_chocolate'),

  root('cm_frutos_secos', 'Frutos secos', 0.9),
  child('cm_frutos_secos_almendra', 'Almendra', 'cm_frutos_secos'),
  child('cm_frutos_secos_avellana', 'Avellana', 'cm_frutos_secos'),
  child('cm_frutos_secos_nuez', 'Nuez', 'cm_frutos_secos'),
  child('cm_frutos_secos_mani', 'Maní', 'cm_frutos_secos'),

  root('cm_especias', 'Especias', 0.8),
  child('cm_especias_canela', 'Canela', 'cm_especias'),
  child('cm_especias_clavo', 'Clavo de olor', 'cm_especias', 'neutral', 0.7),
  child('cm_especias_jengibre', 'Jengibre', 'cm_especias', 'neutral', 0.7),
  child('cm_especias_cardamomo', 'Cardamomo', 'cm_especias'),
  child('cm_especias_pimienta', 'Pimienta', 'cm_especias', 'neutral', 0.6),

  root('cm_verde', 'Verde', 0.75),
  child('cm_verde_te_verde', 'Té verde', 'cm_verde', 'neutral', 0.6),
  child('cm_verde_hierba_fresca', 'Hierba fresca', 'cm_verde', 'neutral', 0.6),
  child('cm_verde_romero', 'Romero', 'cm_verde', 'neutral', 0.6),
  child('cm_verde_albahaca', 'Albahaca', 'cm_verde', 'neutral', 0.6),
  child('cm_verde_pasto', 'Pasto', 'cm_verde', 'negative', 0.8),

  root('cm_tostado', 'Tostado', 0.8),
  child('cm_tostado_pan_tostado', 'Pan tostado', 'cm_tostado', 'neutral', 0.6),
  child('cm_tostado_caramelo_oscuro', 'Caramelo oscuro', 'cm_tostado', 'neutral', 0.7),
  child('cm_tostado_tabaco', 'Tabaco', 'cm_tostado', 'neutral', 0.6),
  child('cm_tostado_humo', 'Humo', 'cm_tostado', 'negative', 1.1),

  root('cm_defectos', 'Defectos', 1.35),
  child('cm_defectos_fermentado', 'Fermentado', 'cm_defectos', 'negative', 1.4),
  child('cm_defectos_medicinal', 'Medicinal', 'cm_defectos', 'negative', 1.4),
  child('cm_defectos_caucho', 'Caucho', 'cm_defectos', 'negative', 1.4),
  child('cm_defectos_petroleo', 'Petróleo', 'cm_defectos', 'negative', 1.6),
  child('cm_defectos_moho', 'Moho', 'cm_defectos', 'negative', 1.5),
  child('cm_defectos_salado', 'Salado', 'cm_defectos', 'negative', 1.1),
];