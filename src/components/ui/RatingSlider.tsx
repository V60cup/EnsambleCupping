// src/components/ui/RatingSlider.tsx
//
// Slider horizontal continuo para escalas 0-9 (gustos básicos, idoneidad).
//
// NOTA TÉCNICA — por qué esta implementación y no una más simple:
// PanResponder en React Native Web no es fiable para este caso: el
// nativeEvent en web no siempre expone locationX/locationY (ver
// https://github.com/necolas/react-native-web/issues/457), y measure()
// tampoco refleja correctamente el scroll en todos los navegadores (ver
// https://github.com/necolas/react-native-web/issues/702). El síntoma típico
// es que el slider simplemente no responde al arrastre en web aunque sí
// funcione en iOS/Android.
//
// Para evitar depender de ese comportamiento poco consistente, en web se
// usan listeners de mouse/touch del DOM directamente sobre el nodo nativo
// (obtenido vía ref + algo soportado de forma estable: getBoundingClientRect),
// y en iOS/Android se sigue usando PanResponder, que ahí sí es la vía
// recomendada y confiable.

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';

interface Props {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

const THUMB_SIZE = 26;

function clampAndRound(rawValue: number, min: number, max: number): number {
  const rounded = Math.round(rawValue * 10) / 10;
  return Math.max(min, Math.min(max, rounded));
}

export function RatingSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 9,
}: Props) {
  const { theme } = useTheme();
  const [trackWidth, setTrackWidth] = useState(0);
  const trackRef = useRef<View>(null);

  const handleLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  const computeValueFromLocalX = useCallback(
    (localX: number, width: number) => {
      if (width <= 0) return value;
      const clampedX = Math.max(0, Math.min(width, localX));
      const ratio = clampedX / width;
      return clampAndRound(min + ratio * (max - min), min, max);
    },
    [min, max, value]
  );

  // ---------- Camino WEB: eventos DOM nativos sobre el nodo real ----------
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    // En react-native-web, un <View> se renderiza como un <div> real del DOM,
    // por lo que la ref expone los métodos DOM (getBoundingClientRect,
    // addEventListener, etc.) en tiempo de ejecución aunque el tipo de
    // react-native no los declare. El cast es seguro específicamente en esta
    // rama (ya validamos Platform.OS === 'web' arriba).
    const node = trackRef.current as unknown as HTMLElement | null;
    if (!node) return;

    let dragging = false;

    const valueFromClientX = (clientX: number) => {
      const rect = node.getBoundingClientRect();
      return computeValueFromLocalX(clientX - rect.left, rect.width);
    };

    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      onChange(valueFromClientX(event.clientX));
      node.setPointerCapture?.(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      onChange(valueFromClientX(event.clientX));
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      node.releasePointerCapture?.(event.pointerId);
    };

    node.addEventListener('pointerdown', onPointerDown);
    node.addEventListener('pointermove', onPointerMove);
    node.addEventListener('pointerup', onPointerUp);
    node.addEventListener('pointercancel', onPointerUp);
    // Cursor de mano, para que quede claro que es arrastrable.
    node.style.cursor = 'pointer';
    node.style.touchAction = 'none';

    return () => {
      node.removeEventListener('pointerdown', onPointerDown);
      node.removeEventListener('pointermove', onPointerMove);
      node.removeEventListener('pointerup', onPointerUp);
      node.removeEventListener('pointercancel', onPointerUp);
    };
    // computeValueFromLocalX cambia con `value`, pero solo lo usamos en
    // callbacks dentro de listeners ya registrados: no hace falta re-suscribir
    // en cada cambio de valor, así que se omite intencionalmente del array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onChange]);

  // ---------- Camino NATIVO (iOS/Android): PanResponder ----------
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => Platform.OS !== 'web',
      onMoveShouldSetPanResponder: () => Platform.OS !== 'web',
      onPanResponderGrant: (event: GestureResponderEvent) => {
        onChange(
          computeValueFromLocalX(event.nativeEvent.locationX, trackWidth)
        );
      },
      onPanResponderMove: (event: GestureResponderEvent) => {
        onChange(
          computeValueFromLocalX(event.nativeEvent.locationX, trackWidth)
        );
      },
    })
  ).current;

  const ratio = max === min ? 0 : (value - min) / (max - min);
  const thumbLeft = trackWidth > 0 ? ratio * trackWidth - THUMB_SIZE / 2 : 0;

  const nativeHandlers = Platform.OS === 'web' ? {} : panResponder.panHandlers;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
        <Text style={[styles.value, { color: theme.colors.accent }]}>
          {value.toFixed(1)}
        </Text>
      </View>

      <View
        ref={trackRef}
        style={styles.trackWrapper}
        onLayout={handleLayout}
        {...nativeHandlers}
      >
        <View
          style={[
            styles.track,
            { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border },
          ]}
        />

        <View
          style={[
            styles.trackFill,
            {
              width: Math.max(0, thumbLeft + THUMB_SIZE / 2),
              backgroundColor: theme.colors.primarySoft,
            },
          ]}
        />

        <View
          style={[
            styles.thumb,
            {
              left: thumbLeft,
              backgroundColor: theme.colors.accent,
              borderColor: theme.colors.surface,
            },
          ]}
        />
      </View>

      <View style={styles.scaleRow}>
        <Text style={[styles.scaleEdge, { color: theme.colors.textMuted }]}>{min}</Text>
        <Text style={[styles.scaleEdge, { color: theme.colors.textMuted }]}>{max}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },

  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
  },

  value: {
    fontSize: 16,
    fontWeight: '900',
  },

  trackWrapper: {
    height: THUMB_SIZE + 8,
    justifyContent: 'center',
  },

  track: {
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
  },

  trackFill: {
    position: 'absolute',
    height: 6,
    borderRadius: 3,
  },

  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    borderWidth: 2,
  },

  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },

  scaleEdge: {
    fontSize: 11,
    fontWeight: '600',
  },
});