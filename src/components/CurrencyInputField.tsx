import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';

export interface CurrencyInputFieldProps {
  value?: string;
  onChangeText: (formatted: string, numeric: number) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  autoFocus?: boolean;
  editable?: boolean;
  cursorColor?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  testID?: string;
}

export interface CurrencyInputFieldRef {
  focus: () => void;
  blur: () => void;
  isFocused: () => boolean;
}

/**
 * Normalizes any text into a raw digits-and-comma format.
 * Respects Turkish number conventions (dot is thousands separator, comma is decimal).
 */
export function cleanRawInput(text: string): string {
  if (!text) return '';
  let cleaned = String(text).replace(/[^0-9,\.]/g, '');

  // If text contains both dot and comma, dots are thousands separators
  if (cleaned.includes('.') && cleaned.includes(',')) {
    cleaned = cleaned.replace(/\./g, '');
  } else if (cleaned.includes('.')) {
    // If only dots exist
    const dotCount = (cleaned.match(/\./g) || []).length;
    if (dotCount > 1) {
      cleaned = cleaned.replace(/\./g, '');
    } else {
      // Single dot treated as decimal
      cleaned = cleaned.replace('.', ',');
    }
  }

  // Ensure only one comma exists and at most 2 decimal digits
  const commaIndex = cleaned.indexOf(',');
  if (commaIndex !== -1) {
    const beforeComma = cleaned.slice(0, commaIndex);
    const afterComma = cleaned.slice(commaIndex + 1).replace(/,/g, '').slice(0, 2);
    cleaned = beforeComma + ',' + afterComma;
  }

  // Cap integer part to 12 digits
  const parts = cleaned.split(',');
  if (parts[0].length > 12) {
    parts[0] = parts[0].slice(0, 12);
    cleaned = parts.join(',');
  }

  return cleaned;
}

/**
 * Converts raw digits (e.g. "54885" or "54885,5") into live Turkish currency display ("54.885,00" or "54.885,50").
 */
export function rawToDisplay(raw: string): { display: string; isEmpty: boolean; numeric: number } {
  if (!raw || raw.trim() === '') {
    return { display: '0,00', isEmpty: true, numeric: 0 };
  }

  let clean = raw.replace(/[^\d,]/g, '');
  if (!clean) {
    return { display: '0,00', isEmpty: true, numeric: 0 };
  }

  let parts = clean.split(',');
  let intPartRaw = parts[0];
  let decPartRaw = parts.length > 1 ? parts[1].slice(0, 2) : '';

  intPartRaw = intPartRaw.replace(/^0+(?=\d)/, '');
  if (!intPartRaw) intPartRaw = '0';

  const formattedInt = Number(intPartRaw).toLocaleString('tr-TR');

  let display = '';
  if (clean.endsWith(',')) {
    display = `${formattedInt},`;
  } else if (parts.length > 1 && decPartRaw.length === 1) {
    display = `${formattedInt},${decPartRaw}0`;
  } else if (parts.length > 1 && decPartRaw.length >= 2) {
    display = `${formattedInt},${decPartRaw}`;
  } else {
    display = `${formattedInt},00`;
  }

  const numeric = parseFloat(`${intPartRaw}.${decPartRaw || '00'}`);
  return { display, isEmpty: false, numeric };
}

export const CurrencyInputField = forwardRef<CurrencyInputFieldRef, CurrencyInputFieldProps>(
  (
    {
      value = '',
      onChangeText,
      placeholder = '0,00',
      placeholderTextColor = '#999999',
      style,
      containerStyle,
      autoFocus = false,
      editable = true,
      cursorColor,
      onFocus,
      onBlur,
      testID,
    },
    ref
  ) => {
    const inputRef = useRef<TextInput>(null);
    const [raw, setRaw] = useState<string>(() => cleanRawInput(value));
    const [isFocused, setIsFocused] = useState(false);
    const cursorAnim = useRef(new Animated.Value(1)).current;
    const lastEmittedDisplay = useRef<string>('');

    // Synchronize when external value prop changes (e.g. OCR, Calculator, Presets)
    useEffect(() => {
      if (value === lastEmittedDisplay.current) {
        return;
      }
      const incomingRaw = cleanRawInput(value);
      setRaw(incomingRaw);
      const { display, isEmpty } = rawToDisplay(incomingRaw);
      lastEmittedDisplay.current = isEmpty ? '' : display;
    }, [value]);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      isFocused: () => isFocused,
    }));

    // Blinking cursor animation
    useEffect(() => {
      let animation: Animated.CompositeAnimation | null = null;
      if (isFocused) {
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(cursorAnim, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(cursorAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        );
        animation.start();
      } else {
        cursorAnim.setValue(0);
      }
      return () => {
        animation?.stop();
      };
    }, [isFocused]);

    const handleChangeText = (text: string) => {
      const newRaw = cleanRawInput(text);
      setRaw(newRaw);
      const { display, isEmpty, numeric } = rawToDisplay(newRaw);
      const emitted = isEmpty ? '' : display;
      lastEmittedDisplay.current = emitted;
      if (isEmpty) {
        onChangeText('', 0);
      } else {
        onChangeText(display, numeric);
      }
    };

    const { display, isEmpty } = rawToDisplay(raw);

    // Extract font size and color for cursor and display
    const flattenedStyle = StyleSheet.flatten(style) || {};
    const fontSize = (flattenedStyle.fontSize as number) || 28;
    const textColor = (flattenedStyle.color as string) || '#000000';
    const cursorHeight = fontSize * 0.95;

    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => inputRef.current?.focus()}
        style={[styles.container, containerStyle]}
        testID={testID}
      >
        <View style={styles.textRow}>
          <Text
            style={[
              style,
              { color: isEmpty ? placeholderTextColor : textColor },
            ]}
            numberOfLines={1}
          >
            {isEmpty ? placeholder : display}
          </Text>
          {isFocused && (
            <Animated.View
              style={[
                styles.cursor,
                {
                  backgroundColor: cursorColor || textColor,
                  height: cursorHeight,
                  opacity: cursorAnim,
                },
              ]}
            />
          )}
        </View>

        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          value={raw}
          onChangeText={handleChangeText}
          keyboardType="decimal-pad"
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          autoFocus={autoFocus}
          editable={editable}
          caretHidden
          selectionColor="transparent"
        />
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    minHeight: 44,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cursor: {
    width: 2.5,
    marginLeft: 3,
    borderRadius: 1.5,
  },
  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    color: 'transparent',
    backgroundColor: 'transparent',
    fontSize: 1,
  },
});

export default CurrencyInputField;
