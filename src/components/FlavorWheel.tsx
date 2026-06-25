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
  TSpan,
} from 'react-native-svg';

import { FlavorAttribute } from '../types/domain';
import { useTheme } from '../theme/ThemeProvider';
import {
  getFlavorColor,
  getFlavorDisplayName,
  getFlavorExamples,
  getFlavorShortName,
  getReadableTextColor,
  shadeColor,
  tintColor,
} from '../data/flavorLocalization';

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

const WHEEL_SIZE_LIMIT = 580;

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angle: number
) {
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

function wrapSvgLabel(
  label: string,
  maxCharsPerLine: number,
  maxLines: number
): string[] {
  const cleanLabel = label.replace(/\s+/g, ' ').trim();

  if (!cleanLabel) return [];

  if (cleanLabel.length <= maxCharsPerLine) {
    return [cleanLabel];
  }

  const words = cleanLabel.split(' ');
  const lines: string[] = [];

  for (const word of words) {
    const currentLine = lines[lines.length - 1];

    if (!currentLine) {
      lines.push(word);
      continue;
    }

    const candidate = `${currentLine} ${word}`;

    if (candidate.length <= maxCharsPerLine) {
      lines[lines.length - 1] = candidate;
    } else if (lines.length < maxLines) {
      lines.push(word);
    } else {
      lines[lines.length - 1] = truncateLabel(
        `${lines[lines.length - 1]} ${word}`,
        maxCharsPerLine
      );
    }
  }

  return lines.slice(0, maxLines).map((line) => {
    if (line.length <= maxCharsPerLine) return line;

    return truncateLabel(line, maxCharsPerLine);
  });
}

function getSegmentLabelLines(
  attr: FlavorAttribute,
  segmentCount: number,
  angleSize: number,
  wheelSize: number
): string[] {
  if (angleSize < 16) return [];
  if (wheelSize < 360 && segmentCount > 10) return [];

  const label = getFlavorShortName(attr);

  if (segmentCount >= 14) {
    return wrapSvgLabel(label, 7, 2);
  }

  if (segmentCount >= 10) {
    return wrapSvgLabel(label, 9, 2);
  }

  return wrapSvgLabel(label, 12, 2);
}

function getLineageForAttribute(
  attr: FlavorAttribute,
  attributesById: Record<string, FlavorAttribute>
): FlavorAttribute[] {
  const lineage: FlavorAttribute[] = [];
  const visitedIds = new Set<string>();

  let cursor: FlavorAttribute | null = attr;

  while (cursor && !visitedIds.has(cursor.id)) {
    lineage.unshift(cursor);
    visitedIds.add(cursor.id);

    cursor = cursor.parentId
      ? attributesById[cursor.parentId] ?? null
      : null;
  }

  return lineage;
}

export function FlavorWheel({
  attributes,
  selectedIntensities,
  onChangeIntensity,
}: FlavorWheelProps) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const [activeAttributeId, setActiveAttributeId] = useState<string | null>(
    null
  );

  const size = Math.min(width - 28, WHEEL_SIZE_LIMIT);
  const cx = size / 2;
  const cy = size / 2;
  const innerRadius = size * 0.23;
  const outerRadius = size * 0.46;

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

  const rootAttributes = useMemo(() => {
    return childrenByParent['__root__'] ?? [];
  }, [childrenByParent]);

  const currentItems = useMemo(() => {
    const key = currentParentId ?? '__root__';

    return childrenByParent[key] ?? [];
  }, [childrenByParent, currentParentId]);

  const currentParent = currentParentId
    ? attributesById[currentParentId] ?? null
    : null;

  const breadcrumb = useMemo(() => {
    if (!currentParent) return [];

    return getLineageForAttribute(currentParent, attributesById);
  }, [attributesById, currentParent]);

  const activeAttribute = activeAttributeId
    ? attributesById[activeAttributeId] ?? null
    : null;

  const activeLineage = useMemo(() => {
    if (!activeAttribute) return [];

    return getLineageForAttribute(activeAttribute, attributesById);
  }, [activeAttribute, attributesById]);

  const activeExamples = activeAttribute
    ? getFlavorExamples(activeAttribute)
    : [];

  const activeIntensity = activeAttribute
    ? selectedIntensities[activeAttribute.id] ?? 0
    : 0;

  const activeColor = activeAttribute
    ? getFlavorColor(activeAttribute, activeLineage, 0)
    : theme.colors.accent;

  const intensityRings = useMemo(() => {
    const ringCount = 9;
    const step = (outerRadius - innerRadius) / ringCount;

    return Array.from({ length: ringCount }, (_, index) => ({
      level: index + 1,
      radius: innerRadius + step * (index + 1),
    }));
  }, [innerRadius, outerRadius]);

  const segments = useMemo(() => {
    const anglePerItem = 360 / Math.max(currentItems.length, 1);

    return currentItems.map((attr, index): Segment => {
      const hasChildren = (childrenByParent[attr.id] ?? []).length > 0;
      const lineage = getLineageForAttribute(attr, attributesById);
      const color = getFlavorColor(attr, lineage, index);

      return {
        attr,
        startAngle: index * anglePerItem,
        endAngle: (index + 1) * anglePerItem,
        color,
        hasChildren,
      };
    });
  }, [attributesById, childrenByParent, currentItems]);

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
              backgroundColor:
                currentParentId === null
                  ? theme.colors.primarySoft
                  : theme.colors.surfaceAlt,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={goToRoot}
        >
          <Text
            style={[
              styles.breadcrumbText,
              {
                color:
                  currentParentId === null ? '#FFFFFF' : theme.colors.text,
              },
            ]}
          >
            Inicio
          </Text>
        </Pressable>

        {breadcrumb.map((item) => (
          <Pressable
            key={item.id}
            style={[
              styles.breadcrumbChip,
              {
                backgroundColor:
                  currentParentId === item.id
                    ? theme.colors.primarySoft
                    : theme.colors.surfaceAlt,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => {
              setCurrentParentId(item.id);
              setActiveAttributeId(null);
            }}
          >
            <Text
              style={[
                styles.breadcrumbText,
                {
                  color:
                    currentParentId === item.id
                      ? '#FFFFFF'
                      : theme.colors.text,
                },
              ]}
            >
              {getFlavorDisplayName(item)}
            </Text>
          </Pressable>
        ))}
      </View>

      {currentParent && (
        <Pressable style={styles.backButton} onPress={goBack}>
          <Text
            style={[
              styles.backButtonText,
              { color: theme.colors.primarySoft },
            ]}
          >
            ← Volver
          </Text>
        </Pressable>
      )}

      <View style={styles.wheelWrapper}>
        <Svg width={size} height={size}>
          <G>
            {intensityRings.map((ring) => (
              <Circle
                key={ring.level}
                cx={cx}
                cy={cy}
                r={ring.radius}
                fill="none"
                stroke={theme.colors.border}
                strokeWidth={1}
                strokeDasharray="3 8"
                opacity={0.4}
              />
            ))}

            <Line
              x1={cx}
              y1={cy - innerRadius}
              x2={cx}
              y2={cy - outerRadius}
              stroke={theme.colors.border}
              strokeWidth={1}
              opacity={0.55}
            />

            {intensityRings.map((ring) => (
              <SvgText
                key={`level-${ring.level}`}
                x={cx + 7}
                y={cy - ring.radius + 10}
                fontSize={9}
                fontWeight="800"
                fill={theme.colors.textMuted}
                textAnchor="start"
              >
                {ring.level}
              </SvgText>
            ))}

            {segments.map((segment) => {
              const intensity = selectedIntensities[segment.attr.id] ?? 0;
              const selected = intensity > 0;
              const active = activeAttributeId === segment.attr.id;
              const angleSize = segment.endAngle - segment.startAngle;

              const fill = selected
                ? shadeColor(segment.color, Math.min(0.22, intensity * 0.018))
                : active
                  ? segment.color
                  : tintColor(segment.color, segment.hasChildren ? 0.12 : 0.24);

              const textColor = getReadableTextColor(fill);
              const textPosition = getTextPosition(
                cx,
                cy,
                innerRadius + (outerRadius - innerRadius) * 0.56,
                segment.startAngle,
                segment.endAngle
              );
              const midAngle = (segment.startAngle + segment.endAngle) / 2;
              const rotation =
                midAngle > 90 && midAngle < 270
                  ? midAngle + 90
                  : midAngle - 90;
              const labelLines = getSegmentLabelLines(
                segment.attr,
                segments.length,
                angleSize,
                size
              );

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
                    stroke={
                      active
                        ? theme.colors.text
                        : selected
                          ? theme.colors.accent
                          : theme.colors.surface
                    }
                    strokeWidth={active ? 3 : selected ? 2.2 : 1.2}
                    opacity={segment.hasChildren || selected || active ? 1 : 0.9}
                    onPress={() => handleSegmentPress(segment)}
                  />

                  <Path
                    d={describeArc(
                      cx,
                      cy,
                      innerRadius,
                      outerRadius,
                      segment.startAngle,
                      segment.endAngle
                    )}
                    fill="transparent"
                    stroke="transparent"
                    strokeWidth={8}
                    onPress={() => handleSegmentPress(segment)}
                  />

                  {labelLines.length > 0 && (
                    <SvgText
                      x={textPosition.x}
                      y={textPosition.y - (labelLines.length - 1) * 5}
                      fill={textColor}
                      fontSize={segments.length > 10 ? 9.5 : 11.5}
                      fontWeight="900"
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      rotation={rotation}
                      origin={`${textPosition.x}, ${textPosition.y}`}
                      onPress={() => handleSegmentPress(segment)}
                    >
                      {labelLines.map((line, index) => (
                        <TSpan
                          key={`${segment.attr.id}-line-${index}`}
                          x={textPosition.x}
                          dy={index === 0 ? 0 : 12}
                        >
                          {line}
                        </TSpan>
                      ))}
                    </SvgText>
                  )}
                </G>
              );
            })}

            <Circle
              cx={cx}
              cy={cy}
              r={innerRadius * 0.82}
              fill={theme.colors.surface}
              stroke={theme.colors.border}
              strokeWidth={1.5}
            />

            <SvgText
              x={cx}
              y={cy - 8}
              fill={theme.colors.text}
              fontSize={14}
              fontWeight="900"
              textAnchor="middle"
            >
              {currentParent
                ? truncateLabel(getFlavorShortName(currentParent), 14)
                : 'Descriptores'}
            </SvgText>

            <SvgText
              x={cx}
              y={cy + 12}
              fill={theme.colors.textMuted}
              fontSize={10}
              fontWeight="800"
              textAnchor="middle"
            >
              {currentParent ? 'Selecciona' : 'Sensorial'}
            </SvgText>
          </G>
        </Svg>
      </View>

      <View style={styles.legendWrap}>
        {rootAttributes.map((rootAttr, index) => {
          const color = getFlavorColor(rootAttr, [rootAttr], index);

          return (
            <Pressable
              key={rootAttr.id}
              style={[
                styles.legendChip,
                {
                  backgroundColor: theme.colors.surfaceAlt,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => {
                setCurrentParentId(rootAttr.id);
                setActiveAttributeId(null);
              }}
            >
              <View
                style={[
                  styles.legendDot,
                  {
                    backgroundColor: color,
                  },
                ]}
              />

              <Text
                style={[
                  styles.legendText,
                  {
                    color: theme.colors.textMuted,
                  },
                ]}
              >
                {getFlavorShortName(rootAttr)}
              </Text>
            </Pressable>
          );
        })}
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
          <View style={styles.selectedHeader}>
            <View
              style={[
                styles.selectedColorDot,
                {
                  backgroundColor: activeColor,
                },
              ]}
            />

            <View style={styles.selectedHeaderText}>
              <Text
                style={[
                  styles.selectedLabel,
                  {
                    color: theme.colors.textMuted,
                  },
                ]}
              >
                Descriptor
              </Text>

              <Text
                style={[
                  styles.selectedName,
                  {
                    color: theme.colors.text,
                  },
                ]}
              >
                {getFlavorDisplayName(activeAttribute)}
              </Text>
            </View>
          </View>

          {activeLineage.length > 1 && (
            <Text
              style={[
                styles.lineageText,
                {
                  color: theme.colors.textMuted,
                },
              ]}
            >
              {activeLineage.map(getFlavorDisplayName).join(' / ')}
            </Text>
          )}

          {activeExamples.length > 0 && (
            <View style={styles.examplesBlock}>
              <Text
                style={[
                  styles.examplesTitle,
                  {
                    color: theme.colors.textMuted,
                  },
                ]}
              >
                Referencias Chile
              </Text>

              <View style={styles.examplesWrap}>
                {activeExamples.map((example) => (
                  <View
                    key={example}
                    style={[
                      styles.exampleChip,
                      {
                        backgroundColor: tintColor(activeColor, 0.82),
                        borderColor: tintColor(activeColor, 0.55),
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.exampleText,
                        {
                          color: shadeColor(activeColor, 0.35),
                        },
                      ]}
                    >
                      {example}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <Text
            style={[
              styles.intensityTitle,
              {
                color: theme.colors.text,
              },
            ]}
          >
            Intensidad
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
                        ? activeColor
                        : theme.colors.surface,
                      borderColor: enabled ? activeColor : theme.colors.border,
                    },
                  ]}
                  onPress={() => onChangeIntensity(activeAttribute.id, level)}
                >
                  <Text
                    style={[
                      styles.intensityText,
                      {
                        color: enabled
                          ? getReadableTextColor(activeColor)
                          : theme.colors.textMuted,
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
            <Text
              style={[
                styles.clearButtonText,
                {
                  color: theme.colors.danger,
                },
              ]}
            >
              Quitar descriptor
            </Text>
          </Pressable>
        </View>
      ) : (
        <View
          style={[
            styles.emptyPanel,
            {
              backgroundColor: theme.colors.surfaceAlt,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.emptyPanelText,
              {
                color: theme.colors.textMuted,
              },
            ]}
          >
            {currentItems.length > 0
              ? 'Toca una sección para explorar o seleccionar un descriptor.'
              : 'Sin descriptores relacionados.'}
          </Text>
        </View>
      )}

      <View style={styles.selectedList}>
        <Text
          style={[
            styles.selectedListTitle,
            {
              color: theme.colors.text,
            },
          ]}
        >
          Seleccionados
        </Text>

        {selectedAttributes.length === 0 ? (
          <Text
            style={[
              styles.emptySelection,
              {
                color: theme.colors.textMuted,
              },
            ]}
          >
            Aún no has seleccionado descriptores.
          </Text>
        ) : (
          <View style={styles.selectedChipWrap}>
            {selectedAttributes.map((attr) => {
              const lineage = getLineageForAttribute(attr, attributesById);
              const color = getFlavorColor(attr, lineage, 0);

              return (
                <Pressable
                  key={attr.id}
                  style={[
                    styles.selectedChip,
                    {
                      backgroundColor: tintColor(color, 0.82),
                      borderColor: tintColor(color, 0.52),
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
                        color: shadeColor(color, 0.35),
                      },
                    ]}
                  >
                    {getFlavorDisplayName(attr)} · {selectedIntensities[attr.id]}
                  </Text>
                </Pressable>
              );
            })}
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
  legendWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 10,
  },
  legendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  selectedPanel: {
    borderRadius: 18,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
  },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectedColorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  selectedHeaderText: {
    flex: 1,
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
  },
  lineageText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
  },
  examplesBlock: {
    marginTop: 12,
  },
  examplesTitle: {
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 7,
    textTransform: 'uppercase',
  },
  examplesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  exampleChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  exampleText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  intensityTitle: {
    fontSize: 13,
    fontWeight: '900',
    marginTop: 14,
    marginBottom: 8,
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
  emptyPanel: {
    borderRadius: 18,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
  },
  emptyPanelText: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
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