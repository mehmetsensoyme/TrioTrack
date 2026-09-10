import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { CHANGELOG_HISTORY, ChangeType, VersionRelease } from '../constants/version';

interface WhatsNewModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ visible, onClose }) => {
  const { colors, styles: tStyles } = useTheme();
  const insets = useSafeAreaInsets();
  const m = tStyles.fontSizeMultiplier || 1;

  const [selectedVersionIdx, setSelectedVersionIdx] = useState(0);
  const activeRelease: VersionRelease = CHANGELOG_HISTORY[selectedVersionIdx] || CHANGELOG_HISTORY[0];

  const getTypeStyle = (type: ChangeType) => {
    switch (type) {
      case 'feature':
        return {
          bg: '#10B98118',
          text: '#10B981',
          icon: 'sparkles' as const,
        };
      case 'design':
        return {
          bg: '#3B82F618',
          text: '#3B82F6',
          icon: 'color-palette' as const,
        };
      case 'fix':
        return {
          bg: '#8B5CF618',
          text: '#8B5CF6',
          icon: 'shield-checkmark' as const,
        };
      case 'ai':
        return {
          bg: '#EC489918',
          text: '#EC4899',
          icon: 'hardware-chip' as const,
        };
      case 'core':
      default:
        return {
          bg: '#F59E0B18',
          text: '#F59E0B',
          icon: 'cube' as const,
        };
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        {/* Siyah boş alana dokunulduğunda garantili kapatma */}
        <TouchableOpacity
          style={styles.backdropDismissArea}
          activeOpacity={1}
          onPress={onClose}
        />

        <View
          style={[
            styles.sheetCard,
            {
              backgroundColor: colors.card,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingBottom: Math.max(insets.bottom + 12, 22),
            },
          ]}
        >
          {/* Alt Çekmece Tutamacı */}
          <View style={[styles.sheetPill, { backgroundColor: colors.text + '25' }]} />

          {/* Modal Üst Başlık */}
          <View style={styles.headerRow}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primary + '18' }]}>
              <Ionicons name="sparkles" size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text
                  style={[
                    styles.headerTitle,
                    {
                      color: colors.text,
                      fontFamily: tStyles.fontFamily,
                      fontSize: Math.round(17 * m),
                    },
                  ]}
                >
                  Neler Yeni?
                </Text>
                <View style={styles.latestBadge}>
                  <Text style={styles.latestBadgeText}>v{CHANGELOG_HISTORY[0].version}</Text>
                </View>
              </View>
              <Text
                style={{
                  color: colors.text,
                  opacity: 0.55,
                  fontSize: Math.round(11 * m),
                  fontFamily: tStyles.fontFamily,
                  marginTop: 2,
                }}
              >
                TrioTrack Sürüm Değişiklik Günlüğü
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.closeBtn}
            >
              <Ionicons name="close-circle-outline" size={26} color={colors.text} style={{ opacity: 0.5 }} />
            </TouchableOpacity>
          </View>

          {/* Yatay Sürüm Seçici Sekmeleri (Tüm Sürümler v1.0.0 - v1.6.5) */}
          <View style={styles.versionTabsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.versionTabsContent}
            >
              {CHANGELOG_HISTORY.map((rel, idx) => {
                const isSelected = idx === selectedVersionIdx;
                return (
                  <TouchableOpacity
                    key={rel.version}
                    style={[
                      styles.versionTabChip,
                      isSelected
                        ? { backgroundColor: colors.primary, borderColor: colors.primary }
                        : {
                            backgroundColor: colors.background,
                            borderColor: colors.text + '15',
                          },
                    ]}
                    onPress={() => setSelectedVersionIdx(idx)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.versionTabChipText,
                        {
                          color: isSelected ? colors.onPrimary : colors.text,
                          fontFamily: tStyles.fontFamily,
                          fontSize: Math.round(11 * m),
                        },
                      ]}
                    >
                      v{rel.version}
                    </Text>
                    {rel.isLatest && (
                      <View
                        style={[
                          styles.tabMiniDot,
                          { backgroundColor: isSelected ? '#FFF' : '#10B981' },
                        ]}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Seçili Sürüm Bilgi Kartı */}
          <View
            style={[
              styles.releaseHeroCard,
              {
                backgroundColor: colors.background,
                borderColor: colors.text + '12',
              },
            ]}
          >
            <View style={styles.releaseHeroHeader}>
              <Text
                style={[
                  styles.releaseTitle,
                  {
                    color: colors.text,
                    fontFamily: tStyles.fontFamily,
                    fontSize: Math.round(13.5 * m),
                    lineHeight: Math.round(18 * m),
                  },
                ]}
                numberOfLines={2}
              >
                {activeRelease.title}
              </Text>
              <View style={[styles.dateBadge, { backgroundColor: colors.card }]}>
                <Ionicons name="calendar-outline" size={12} color={colors.text} style={{ opacity: 0.6 }} />
                <Text
                  style={{
                    color: colors.text,
                    opacity: 0.75,
                    fontSize: Math.round(10 * m),
                    fontFamily: tStyles.fontFamily,
                    marginLeft: 4,
                  }}
                >
                  {activeRelease.buildDate}
                </Text>
              </View>
            </View>
            <Text
              style={[
                styles.releaseSummary,
                {
                  color: colors.text,
                  fontFamily: tStyles.fontFamily,
                  fontSize: Math.round(11.5 * m),
                  lineHeight: Math.round(16 * m),
                },
              ]}
            >
              {activeRelease.summary}
            </Text>
          </View>

          {/* Sürüm Maddeleri Listesi (Kaymaları Önleyen Dinamik Satır Yüksekliği & Kart Yapısı) */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.itemsScrollView}
            contentContainerStyle={{ paddingBottom: 10 }}
          >
            {activeRelease.items.map((item) => {
              const typeCfg = getTypeStyle(item.type);
              return (
                <View
                  key={item.id}
                  style={[
                    styles.changeItemCard,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.text + '10',
                    },
                  ]}
                >
                  <View style={styles.itemHeaderRow}>
                    <View style={[styles.tagBadge, { backgroundColor: typeCfg.bg }]}>
                      <Ionicons name={typeCfg.icon} size={12} color={typeCfg.text} style={{ marginRight: 4 }} />
                      <Text
                        style={[
                          styles.tagBadgeText,
                          {
                            color: typeCfg.text,
                            fontFamily: tStyles.fontFamily,
                            fontSize: Math.round(9.5 * m),
                          },
                        ]}
                      >
                        {item.typeLabel}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.itemTitle,
                        {
                          color: colors.text,
                          fontFamily: tStyles.fontFamily,
                          fontSize: Math.round(12.5 * m),
                          lineHeight: Math.round(17 * m),
                        },
                      ]}
                    >
                      {item.title}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.itemDescription,
                      {
                        color: colors.text,
                        fontFamily: tStyles.fontFamily,
                        fontSize: Math.round(11 * m),
                        lineHeight: Math.round(16.5 * m),
                      },
                    ]}
                  >
                    {item.description}
                  </Text>
                </View>
              );
            })}
          </ScrollView>

          {/* Kapat & Onayla Butonu */}
          <TouchableOpacity
            style={[
              styles.dismissButton,
              {
                backgroundColor: colors.primary,
                borderRadius: Math.max(tStyles.roundness / 1.5, 12),
              },
            ]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.dismissButtonText,
                {
                  color: colors.onPrimary,
                  fontFamily: tStyles.fontFamily,
                  fontSize: Math.round(13.5 * m),
                },
              ]}
            >
              Harika, Anladım!
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  backdropDismissArea: {
    flex: 1,
    width: '100%',
  },
  sheetCard: {
    width: '100%',
    maxHeight: '90%',
    paddingHorizontal: 20,
    paddingTop: 12,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  sheetPill: {
    width: 44,
    height: 4.5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  latestBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  latestBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 4,
  },
  versionTabsContainer: {
    marginVertical: 8,
  },
  versionTabsContent: {
    gap: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  versionTabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  versionTabChipText: {
    fontWeight: '600',
  },
  tabMiniDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 5,
  },
  releaseHeroCard: {
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  releaseHeroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 8,
  },
  releaseTitle: {
    fontWeight: 'bold',
    flex: 1,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  releaseSummary: {
    opacity: 0.7,
  },
  itemsScrollView: {
    maxHeight: 330,
    marginTop: 4,
  },
  changeItemCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagBadgeText: {
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  itemTitle: {
    fontWeight: 'bold',
    flex: 1,
    minWidth: 180,
  },
  itemDescription: {
    marginTop: 6,
    opacity: 0.75,
  },
  dismissButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    marginTop: 8,
  },
  dismissButtonText: {
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
