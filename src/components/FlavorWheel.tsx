// src/components/FlavorWheel.tsx

import { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
} from 'react-native';

import Svg, {
  G,
  Path,
  Text as SvgText,
  Circle,
  Line,
} from 'react-native-svg';

import { FlavorAttribute } from '../types/domain';
import { useTheme } from '../theme/ThemeProvider';

interface FlavorWheelProps {
  attributes: FlavorAttribute[];
  selectedIntensities: Record<string, number>;
  onChangeIntensity: (attributeId: string, intensity: number) => void;
}

interface Segment {
  attr: FlavorAttribute;
  startAngle: number;
  endAngle: number;
  color: string;
  hasChildren: boolean;
}

const ROOT_COLORS = [
  '#A58E76',
  '#B39A82',
  '#C4AA8C',
  '#9B8470',
  '#7F6E61',
  '#8E7A6A',
  '#6E6258',
  '#B7AA9C',
  '#8A8076',
  '#A9957B',
];

const WHEEL_SIZE_LIMIT = 580;

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  const angleInRadians = ((angle - 90) * Math.PI) / 180;

  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
) {
  const startOuter = polarToCartesian(cx, cy, outerRadius, endAngle);
  const endOuter = polarToCartesian(cx, cy, outerRadius, startAngle);
  const startInner = polarToCartesian(cx, cy, innerRadius, startAngle);
  const endInner = polarToCartesian(cx, cy, innerRadius, endAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${endInner.x} ${endInner.y}`,
    'Z',
  ].join(' ');
}

function getTextPosition(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  const midAngle = (startAngle + endAngle) / 2;
  return polarToCartesian(cx, cy, radius, midAngle);
}

function truncateLabel(label: string, maxLength: number) {
  if (label.length <= maxLength) return label;
  return `${label.slice(0, maxLength - 1)}…`;
}

export function FlavorWheel({
  attributes,
  selectedIntensities,
  onChangeIntensity,
}: FlavorWheelProps) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const [activeAttributeId, setActiveAttributeId] = useState<string | null>(null);

  const size = Math.min(width - 28, WHEEL_SIZE_LIMIT);
  const cx = size / 2;
  const cy = size / 2;

  const innerRadius = size * 0.23;
  const outerRadius = size * 0.46;

  // Anillos concéntricos numerados 0-9, puramente decorativos: dan la
  // referencia visual de intensidad estilo hoja de cata SCA, igual que en la
  // imagen de referencia, sin cambiar la interacción (la intensidad real se
  // sigue eligiendo en el panel de abajo, no tocando un radio).
  const intensityRings = useMemo(() => {
    const ringCount = 9; // anillos 1..9 (el centro ya representa el 0)
    const step = (outerRadius - innerRadius) / ringCount;

    return Array.from({ length: ringCount }, (_, index) => ({
      level: index + 1,
      radius: innerRadius + step * (index + 1),
    }));
  }, [innerRadius, outerRadius]);

  const attributesById = useMemo(() => {
    const map: Record<string, FlavorAttribute> = {};

    for (const attr of attributes) {
      map[attr.id] = attr;
    }

    return map;
  }, [attributes]);

  const childrenByParent = useMemo(() => {
    const map: Record<string, FlavorAttribute[]> = {};

    for (const attr of attributes) {
      const parentKey = attr.parentId ?? '__root__';

      if (!map[parentKey]) {
        map[parentKey] = [];
      }

      map[parentKey].push(attr);
    }

    return map;
  }, [attributes]);

  const currentItems = useMemo(() => {
    const key = currentParentId ?? '__root__';
    return childrenByParent[key] ?? [];
  }, [childrenByParent, currentParentId]);

  const currentParent = currentParentId ? attributesById[currentParentId] : null;

  const breadcrumb = useMemo(() => {
    const result: FlavorAttribute[] = [];
    let cursor = currentParent;

    while (cursor) {
      result.unshift(cursor);

      if (!cursor.parentId) break;

      cursor = attributesById[cursor.parentId] ?? null;
    }

    return result;
  }, [attributesById, currentParent]);

  const activeAttribute = activeAttributeId
    ? attributesById[activeAttributeId] ?? null
    : null;

  const activeIntensity = activeAttribute
    ? selectedIntensities[activeAttribute.id] ?? 0
    : 0;

  const currentRootColorIndex = useMemo(() => {
    const rootId = breadcrumb[0]?.id;

    if (!rootId) return 0;

    const roots = childrenByParent.__root__ ?? [];
    const index = roots.findIndex((item) => item.id === rootId);

    return index >= 0 ? index : 0;
  }, [breadcrumb, childrenByParent]);

  const segments = useMemo(() => {
    const anglePerItem = 360 / Math.max(currentItems.length, 1);

    return currentItems.map((attr, index): Segment => {
      const hasChildren = (childrenByParent[attr.id] ?? []).length > 0;

      const color =
        currentParentId === null
          ? ROOT_COLORS[index % ROOT_COLORS.length]
          : ROOT_COLORS[currentRootColorIndex % ROOT_COLORS.length];

      return {
        attr,
        startAngle: index * anglePerItem,
        endAngle: (index + 1) * anglePerItem,
        color,
        hasChildren,
      };
    });
  }, [childrenByParent, currentItems, currentParentId, currentRootColorIndex]);

  const selectedAttributes = useMemo(() => {
    return attributes.filter((attr) => {
      return (selectedIntensities[attr.id] ?? 0) > 0;
    });
  }, [attributes, selectedIntensities]);

  function handleSegmentPress(segment: Segment) {
    if (segment.hasChildren) {
      setCurrentParentId(segment.attr.id);
      setActiveAttributeId(null);
      return;
    }

    const currentIntensity = selectedIntensities[segment.attr.id] ?? 0;

    setActiveAttributeId(segment.attr.id);
    onChangeIntensity(segment.attr.id, currentIntensity > 0 ? 0 : 5);
  }

  function goBack() {
    if (!currentParent) return;

    setCurrentParentId(currentParent.parentId);
    setActiveAttributeId(null);
  }

  function goToRoot() {
    setCurrentParentId(null);
    setActiveAttributeId(null);
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.breadcrumbRow}>
        <Pressable
          style={[
            styles.breadcrumbChip,
            {
              backgroundColor: theme.colors.surfaceAlt,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={goToRoot}
        >
          <Text style={[styles.breadcrumbText, { color: theme.colors.text }]}>
            Inicio
          </Text>
        </Pressable>

        {breadcrumb.map((item) => (
          <Pressable
            key={item.id}
            style={[
              styles.breadcrumbChip,
              {
                backgroundColor: theme.colors.surfaceAlt,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => {
              setCurrentParentId(item.id);
              setActiveAttributeId(null);
            }}
          >
            <Text style={[styles.breadcrumbText, { color: theme.colors.text }]}>
              {item.name}
            </Text>
          </Pressable>
        ))}
      </View>

      {currentParent && (
        <Pressable style={styles.backButton} onPress={goBack}>
          <Text style={[styles.backButtonText, { color: theme.colors.textMuted }]}>
            Volver
          </Text>
        </Pressable>
      )}

      <View style={styles.wheelWrapper}>
        <Svg width={size} height={size}>
          <G>
            {/* Anillos de fondo estilo SCA: puramente decorativos, van detrás
                de las cuñas. Se dibujan primero para que las cuñas (con su
                opacidad) queden por encima. */}
            {intensityRings.map((ring) => (
              <Circle
                key={`ring-${ring.level}`}
                cx={cx}
                cy={cy}
                r={ring.radius}
                fill="none"
                stroke={theme.colors.border}
                strokeWidth={1}
                opacity={0.5}
              />
            ))}

            {/* Línea radial de referencia (hacia las 12 en punto) sobre la
                que se apoyan las etiquetas numéricas de los anillos. */}
            <Line
              x1={cx}
              y1={cy - innerRadius}
              x2={cx}
              y2={cy - outerRadius}
              stroke={theme.colors.border}
              strokeWidth={1}
              opacity={0.5}
            />

            {intensityRings.map((ring) => (
              <SvgText
                key={`ring-label-${ring.level}`}
                x={cx + 4}
                y={cy - ring.radius + 3}
                fontSize={9}
                fontWeight="700"
                fill={theme.colors.textMuted}
                opacity={0.7}
              >
                {ring.level}
              </SvgText>
            ))}

            {segments.map((segment) => {
              const selected = (selectedIntensities[segment.attr.id] ?? 0) > 0;
              const active = activeAttributeId === segment.attr.id;

              const textPosition = getTextPosition(
                cx,
                cy,
                innerRadius + (outerRadius - innerRadius) * 0.54,
                segment.startAngle,
                segment.endAngle
              );

              const midAngle = (segment.startAngle + segment.endAngle) / 2;

              const rotation =
                midAngle > 90 && midAngle < 270
                  ? midAngle + 90
                  : midAngle - 90;

              const fill = selected ? theme.colors.accent : segment.color;
              const opacity = selected || active ? 1 : segment.hasChildren ? 0.78 : 0.62;

              return (
                <G key={segment.attr.id}>
                  <Path
                    d={describeArc(
                      cx,
                      cy,
                      innerRadius,
                      outerRadius,
                      segment.startAngle,
                      segment.endAngle
                    )}
                    fill={fill}
                    opacity={opacity}
                    stroke={selected || active ? theme.colors.white : theme.colors.background}
                    strokeWidth={selected || active ? 5 : 2}
                    onPress={() => handleSegmentPress(segment)}
                  />

                  <Circle
                    cx={textPosition.x}
                    cy={textPosition.y}
                    r={26}
                    fill="transparent"
                    onPress={() => handleSegmentPress(segment)}
                  />

                  <SvgText
                    x={textPosition.x}
                    y={textPosition.y}
                    fill={theme.colors.white}
                    fontSize={segments.length > 10 ? 10 : 13}
                    fontWeight="800"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    rotation={rotation}
                    origin={`${textPosition.x}, ${textPosition.y}`}
                    onPress={() => handleSegmentPress(segment)}
                  >
                    {truncateLabel(segment.attr.name, segments.length > 10 ? 11 : 16)}
                  </SvgText>
                </G>
              );
            })}

            <Circle
              cx={cx}
              cy={cy}
              r={innerRadius - 8}
              fill={theme.colors.surface}
              stroke={theme.colors.background}
              strokeWidth={4}
            />

            <SvgText
              x={cx}
              y={cy - 8}
              textAnchor="middle"
              fill={theme.colors.text}
              fontSize={18}
              fontWeight="900"
            >
              {currentParent ? truncateLabel(currentParent.name, 13) : 'Descriptores'}
            </SvgText>

            <SvgText
              x={cx}
              y={cy + 18}
              textAnchor="middle"
              fill={theme.colors.textMuted}
              fontSize={11}
              fontWeight="700"
            >
              {currentParent ? 'Selecciona' : 'Sensorial'}
            </SvgText>
          </G>
        </Svg>
      </View>

      {activeAttribute ? (
        <View
          style={[
            styles.selectedPanel,
            {
              backgroundColor: theme.colors.surfaceAlt,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.selectedLabel, { color: theme.colors.textMuted }]}>
            Descriptor
          </Text>

          <Text style={[styles.selectedName, { color: theme.colors.text }]}>
            {activeAttribute.name}
          </Text>

          <View style={styles.intensityRow}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => {
              const enabled = level <= activeIntensity;

              return (
                <Pressable
                  key={level}
                  style={[
                    styles.intensityDot,
                    {
                      backgroundColor: enabled
                        ? theme.colors.accent
                        : theme.colors.surface,
                      borderColor: enabled
                        ? theme.colors.accent
                        : theme.colors.border,
                    },
                  ]}
                  onPress={() => onChangeIntensity(activeAttribute.id, level)}
                >
                  <Text
                    style={[
                      styles.intensityText,
                      {
                        color: enabled ? theme.colors.white : theme.colors.textMuted,
                      },
                    ]}
                  >
                    {level}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={styles.clearButton}
            onPress={() => onChangeIntensity(activeAttribute.id, 0)}
          >
            <Text style={[styles.clearButtonText, { color: theme.colors.danger }]}>
              Quitar
            </Text>
          </Pressable>
        </View>
      ) : (
        <View
          style={[
            styles.selectedPanel,
            {
              backgroundColor: theme.colors.surfaceAlt,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.selectedLabel, { color: theme.colors.textMuted }]}>
            {currentItems.length > 0
              ? 'Toca una sección'
              : 'Sin descriptores relacionados'}
          </Text>
        </View>
      )}

      <View style={styles.selectedList}>
        <Text style={[styles.selectedListTitle, { color: theme.colors.text }]}>
          Seleccionados
        </Text>

        {selectedAttributes.length === 0 ? (
          <Text style={[styles.emptySelection, { color: theme.colors.textMuted }]}>
            Aún no has seleccionado descriptores.
          </Text>
        ) : (
          <View style={styles.selectedChipWrap}>
            {selectedAttributes.map((attr) => (
              <Pressable
                key={attr.id}
                style={[
                  styles.selectedChip,
                  {
                    backgroundColor:
                      activeAttributeId === attr.id
                        ? theme.colors.accent
                        : theme.colors.surfaceAlt,
                    borderColor:
                      activeAttributeId === attr.id
                        ? theme.colors.accent
                        : theme.colors.border,
                  },
                ]}
                onPress={() => {
                  setActiveAttributeId(attr.id);
                  setCurrentParentId(attr.parentId);
                }}
              >
                <Text
                  style={[
                    styles.selectedChipText,
                    {
                      color:
                        activeAttributeId === attr.id
                          ? theme.colors.white
                          : theme.colors.text,
                    },
                  ]}
                >
                  {attr.name} · {selectedIntensities[attr.id]}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    marginBottom: 18,
  },

  breadcrumbRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    marginBottom: 8,
  },

  breadcrumbChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },

  breadcrumbText: {
    fontSize: 11,
    fontWeight: '800',
  },

  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },

  backButtonText: {
    fontSize: 13,
    fontWeight: '800',
  },

  wheelWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedPanel: {
    borderRadius: 18,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
  },

  selectedLabel: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },

  selectedName: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
    marginBottom: 10,
  },

  intensityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },

  intensityDot: {
    width: 31,
    height: 31,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  intensityText: {
    fontSize: 11,
    fontWeight: '800',
  },

  clearButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },

  clearButtonText: {
    fontSize: 12,
    fontWeight: '800',
  },

  selectedList: {
    marginTop: 12,
  },

  selectedListTitle: {
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 8,
  },

  selectedChipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },

  selectedChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },

  selectedChipText: {
    fontSize: 12,
    fontWeight: '800',
  },

  emptySelection: {
    fontSize: 12,
  },
});