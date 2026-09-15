import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  TextInput,
  StyleProp,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { parseCurrencyInput } from '../utils/formatUtils';

export interface CurrencyInputFieldProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  value?: string;
  onChangeText: (formatted: string, numeric?: number) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  style?: StyleProp<TextStyle>;
  containerStyle?: any;
  cursorColor?: string;
  autoFocus?: boolean;
  editable?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  testID?: string;
}

/**
 * Gerçek zamanlı Türk Lirası canlı para maskeleme motoru:
 * Kullanıcı klavyeden tuşlara bastıkça anında 1.000,00 formatına dönüştürür.
 * Örneğin: 5 -> 5,00 -> 54 -> 54,00 -> 548 -> 548,00 -> 5488 -> 5.488,00 -> 54885 -> 54.885,00
 */
export function handleLiveText(newText: string, prevVal: string = ''): string {
  if (!newText || newText === '' || newText === '0,00' || newText === ',00') {
    return '';
  }

  // Kullanıcı sonuna nokta koyduysa Türkçe standardına uygun olarak virgüle çevir
  let normalized = newText;
  if (normalized.endsWith('.')) {
    normalized = normalized.slice(0, -1) + ',';
  }

  // Kullanıcı sonuna virgül eklediyse (kuruş hanesine geçiş) -> örn: "54.885,"
  if (normalized.endsWith(',')) {
    const parts = normalized.split(',');
    const intDigits = parts[0].replace(/\D/g, '').replace(/^0+(?=\d)/, '') || '0';
    return Number(intDigits).toLocaleString('tr-TR') + ',';
  }

  // Sabit ,00 formatında sonuna doğrudan rakam eklendiyse (örn: 5,00 + 4 -> 54,00)
  if (prevVal.endsWith(',00') && normalized.startsWith(prevVal) && normalized.length === prevVal.length + 1) {
    const addedDigit = normalized.slice(-1);
    if (/\d/.test(addedDigit)) {
      const prevInt = prevVal.slice(0, -3).replace(/\D/g, '');
      const newInt = prevInt + addedDigit;
      return Number(newInt).toLocaleString('tr-TR') + ',00';
    }
  }

  // Sabit ,00 iken en sondan backspace yapıldıysa (örn: 54.885,00 -> 5.488,00)
  if (prevVal.endsWith(',00') && normalized === prevVal.slice(0, -1)) {
    const prevInt = prevVal.slice(0, -3).replace(/\D/g, '');
    const newInt = prevInt.slice(0, -1);
    if (!newInt) return '';
    return Number(newInt).toLocaleString('tr-TR') + ',00';
  }

  // Virgül vardı ve kullanıcı 1. kuruş rakamını girdi (örn: 54.885, + 5 -> 54.885,50)
  if (prevVal.endsWith(',') && normalized.length === prevVal.length + 1) {
    const digit = normalized.slice(-1);
    if (/\d/.test(digit)) {
      return prevVal + digit + '0';
    }
  }

  // Virgüllüydü ve kullanıcı 2. kuruş rakamını girdi (örn: 54.885,50 + 2 -> 54.885,52)
  if (prevVal.includes(',') && !prevVal.endsWith(',00') && normalized.length === prevVal.length + 1) {
    const parts = prevVal.split(',');
    const digit = normalized.slice(-1);
    if (/\d/.test(digit)) {
      return parts[0] + ',' + (parts[1][0] || '0') + digit;
    }
  }

  // Kuruşlu değerden backspace yapıldıysa
  if (prevVal.includes(',') && !prevVal.endsWith(',00') && normalized.length < prevVal.length) {
    const parts = prevVal.split(',');
    return parts[0] + ',';
  }

  // Genel ayrıştırma (Araya yazma, kopyala-yapıştır veya klavye düzeltmeleri)
  const clean = normalized.replace(/[^0-9,]/g, '');
  if (clean.includes(',')) {
    const parts = clean.split(',');
    const intStr = parts[0].replace(/\D/g, '').replace(/^0+(?=\d)/, '') || '0';
    let decStr = parts.slice(1).join('').replace(/\D/g, '');
    if (decStr.length > 2) decStr = decStr.slice(0, 2);
    if (decStr.length === 1) decStr += '0';
    if (!decStr) decStr = '00';
    return Number(intStr).toLocaleString('tr-TR') + ',' + decStr;
  }

  const intStr = clean.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
  if (!intStr) return '';
  return Number(intStr).toLocaleString('tr-TR') + ',00';
}

export const CurrencyInputField = forwardRef<TextInput, CurrencyInputFieldProps>(
  (
    {
      value = '',
      onChangeText,
      placeholder = '0,00',
      placeholderTextColor = '#999999',
      style,
      containerStyle,
      cursorColor,
      autoFocus = false,
      editable = true,
      onFocus,
      onBlur,
      testID,
      ...restProps
    },
    ref
  ) => {
    const inputRef = useRef<TextInput>(null);
    useImperativeHandle(ref, () => inputRef.current as TextInput);

    const [internalText, setInternalText] = useState<string>(() => {
      if (!value || value === '0,00') return '';
      return value;
    });

    useEffect(() => {
      if (value !== internalText) {
        if (!value || value === '0,00') {
          setInternalText('');
        } else {
          setInternalText(value);
        }
      }
    }, [value]);

    const handleChangeText = (incoming: string) => {
      const formatted = handleLiveText(incoming, internalText);
      setInternalText(formatted);
      if (!formatted) {
        onChangeText('', 0);
      } else {
        const numeric = parseCurrencyInput(formatted);
        onChangeText(formatted, numeric);
      }
    };

    return (
      <TextInput
        ref={inputRef}
        style={style}
        value={internalText}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        keyboardType="decimal-pad"
        autoFocus={autoFocus}
        editable={editable}
        cursorColor={cursorColor}
        onFocus={onFocus}
        onBlur={() => {
          if (internalText.endsWith(',')) {
            const normalized = internalText + '00';
            setInternalText(normalized);
            onChangeText(normalized, parseCurrencyInput(normalized));
          }
          onBlur?.();
        }}
        testID={testID}
        {...restProps}
      />
    );
  }
);

export default CurrencyInputField;
