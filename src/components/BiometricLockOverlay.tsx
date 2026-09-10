import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useTheme } from '../theme/ThemeContext';

interface BiometricLockOverlayProps {
  visible: boolean;
  onUnlock: () => void;
}

export const BiometricLockOverlay: React.FC<BiometricLockOverlayProps> = ({ visible, onUnlock }) => {
  const { colors, styles: tStyles, isDark } = useTheme();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isAuthenticatingRef = React.useRef(false);
  const m = tStyles.fontSizeMultiplier;

  const triggerAuth = async (preferPasscode = false) => {
    if (isAuthenticatingRef.current) return;
    try {
      isAuthenticatingRef.current = true;
      setIsAuthenticating(true);
      setErrorMessage(null);

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      let result: LocalAuthentication.LocalAuthenticationResult;

      if (preferPasscode || !hasHardware || !isEnrolled) {
        // Cihaz PIN / Şifre / Desen ile doğrula
        result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'TrioTrack Cihaz Şifresi ile Doğrula',
          cancelLabel: 'İptal',
          disableDeviceFallback: false,
          fallbackLabel: 'Cihaz Şifresini Kullan',
          requireConfirmation: false,
        });
      } else {
        // Biyometrik (Parmak İzi / Yüz) ile doğrula
        result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'TrioTrack Güvenlik Kilidi',
          cancelLabel: 'İptal',
          disableDeviceFallback: false,
          fallbackLabel: 'Cihaz Şifresini Kullan',
          requireConfirmation: false,
          biometricsSecurityLevel: 'strong',
        });

        // Cihaz kısıtından dolayı ilk deneme başarısızsa saf biyometrik ile dene
        if (!result.success && result.error !== 'user_cancel') {
          result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'TrioTrack Güvenlik Kilidi',
            cancelLabel: 'İptal',
            disableDeviceFallback: true,
            requireConfirmation: false,
          });
        }
      }

      if (result.success) {
        onUnlock();
      } else {
        if (result.error !== 'user_cancel' && result.error !== 'app_cancel') {
          setErrorMessage(result.warning || 'Doğrulama başarısız oldu. Lütfen tekrar deneyin.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Kimlik doğrulama sırasında bir hata oluştu.');
    } finally {
      setIsAuthenticating(false);
      isAuthenticatingRef.current = false;
    }
  };

  useEffect(() => {
    if (visible) {
      // Ekran açıldığında kısa bir gecikmeyle otomatik tetikle
      const timer = setTimeout(() => {
        triggerAuth(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setErrorMessage(null);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* TrioTrack 3D Logo */}
        <View style={[styles.logoContainer, { borderColor: colors.primary + '35' }]}>
          <Image
            source={require('../../assets/triotrack_logo.png')}
            style={styles.logoImage}
            resizeMode="cover"
          />
        </View>

        <Text style={[styles.title, { color: colors.text, fontFamily: tStyles.fontFamily, fontSize: 24 * m, fontWeight: tStyles.titleWeight }]}>
          TrioTrack Kilitli
        </Text>

        <Text style={[styles.subtitle, { color: colors.text, opacity: 0.65, fontFamily: tStyles.fontFamily, fontSize: 13 * m }]}>
          Finansal verileriniz uçtan uca korunuyor. Erişmek için kimliğinizi doğrulayın.
        </Text>

        {/* Biyometrik Dokunma İkon Alanı */}
        <TouchableOpacity 
          style={[
            styles.biometricCircle, 
            { 
              backgroundColor: colors.card,
              borderColor: colors.primary + '40',
            }
          ]}
          onPress={() => triggerAuth(false)}
          activeOpacity={0.7}
          disabled={isAuthenticating}
        >
          {isAuthenticating ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <Ionicons 
              name={Platform.OS === 'ios' ? 'scan-outline' : 'finger-print-outline'} 
              size={54} 
              color={colors.primary} 
            />
          )}
        </TouchableOpacity>

        {errorMessage ? (
          <View style={[styles.errorBox, { backgroundColor: '#EF444415', borderColor: '#EF444435' }]}>
            <Ionicons name="alert-circle-outline" size={16} color="#EF4444" style={{ marginRight: 6 }} />
            <Text style={[styles.errorText, { fontFamily: tStyles.fontFamily, fontSize: 12 * m, flex: 1 }]}>
              {errorMessage}
            </Text>
          </View>
        ) : (
          <Text style={[styles.hintText, { color: colors.text, opacity: 0.45, fontFamily: tStyles.fontFamily, fontSize: 11.5 * m }]}>
            {Platform.OS === 'ios' ? 'Face ID / Touch ID veya Cihaz Şifresi' : 'Parmak İzi, Yüz Tanıma veya Cihaz PIN Kodu'}
          </Text>
        )}

        {/* Kilidi Aç Butonu */}
        <TouchableOpacity
          style={[styles.unlockBtn, { backgroundColor: colors.primary, borderRadius: tStyles.roundness }]}
          onPress={() => triggerAuth(false)}
          activeOpacity={0.8}
          disabled={isAuthenticating}
        >
          <Ionicons name="lock-open-outline" size={18} color={colors.onPrimary} style={{ marginRight: 8 }} />
          <Text style={[styles.unlockBtnText, { color: colors.onPrimary, fontFamily: tStyles.fontFamily, fontSize: 14 * m, fontWeight: 'bold' }]}>
            {isAuthenticating ? 'Doğrulanıyor...' : 'Parmak İzi ile Aç'}
          </Text>
        </TouchableOpacity>

        {/* Cihaz Şifresi / PIN ile Aç Alternatifi */}
        <TouchableOpacity
          style={[styles.pinBtn, { borderColor: colors.primary + '40', borderRadius: tStyles.roundness }]}
          onPress={() => triggerAuth(true)}
          activeOpacity={0.7}
          disabled={isAuthenticating}
        >
          <Ionicons name="keypad-outline" size={17} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={{ color: colors.primary, fontFamily: tStyles.fontFamily, fontSize: 13 * m, fontWeight: '600' }}>
            Cihaz Şifresi / PIN ile Doğrula
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
    elevation: 99999,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
    borderWidth: 2,
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  biometricCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
  },
  errorText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  hintText: {
    marginBottom: 24,
    textAlign: 'center',
  },
  unlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 14,
    elevation: 2,
    marginBottom: 10,
  },
  unlockBtnText: {
    letterSpacing: 0.3,
  },
  pinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 12,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
});
