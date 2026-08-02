import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ToggleRow } from '@/components/forms/toggle-row';
import { CapitalBottomSheetHeaderSurface } from '@/components/navigation/capital-bottom-sheet-header-surface';
import { AppButton, AppText, Divider } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type ReportExportSheetProps = {
  visible: boolean;
  subtitle: string;
  onClose: () => void;
};

export function ReportExportSheet({ visible, subtitle, onClose }: ReportExportSheetProps) {
  const insets = useSafeAreaInsets();
  const [includeLogo, setIncludeLogo] = useState(true);
  const [includeCapitalSummary, setIncludeCapitalSummary] = useState(true);
  const [includeTransactionDetails, setIncludeTransactionDetails] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  function handlePrototypeShare() {
    setNotice('تم تجهيز المشاركة كنموذج أولي. لن يتم إنشاء ملف PDF حقيقي الآن.');
  }

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <Pressable accessibilityLabel="إغلاق خيارات التصدير" onPress={onClose} style={StyleSheet.absoluteFill} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom + spacing.lg, spacing.xl) }]}>
          <CapitalBottomSheetHeaderSurface />
          <View style={styles.handle} />
          <ScrollView
            contentContainerStyle={styles.sheetContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.successIcon}>
              <Ionicons color={colors.brand.calmGreen} name="checkmark-outline" size={30} />
            </View>

            <View style={styles.headerCopy}>
              <AppText align="center" variant="sectionTitle">
                تم تجهيز التقرير
              </AppText>
              <AppText align="center" style={styles.subtitle} tone="secondary" variant="supporting">
                {subtitle}
              </AppText>
            </View>

            <View style={styles.options}>
              <ToggleRow
                onValueChange={setIncludeLogo}
                title="تضمين شعار النشاط"
                value={includeLogo}
              />
              <ToggleRow
                onValueChange={setIncludeCapitalSummary}
                title="تضمين ملخص Capital"
                value={includeCapitalSummary}
              />
              <ToggleRow
                onValueChange={setIncludeTransactionDetails}
                title="إظهار تفاصيل المعاملات"
                value={includeTransactionDetails}
              />
              <View style={styles.languageRow}>
                <View style={styles.languageCopy}>
                  <AppText variant="cardTitle">اللغة</AppText>
                  <AppText tone="secondary" variant="caption">
                    العربية
                  </AppText>
                </View>
                <Ionicons color={colors.text.tertiary} name="language-outline" size={19} />
              </View>
            </View>

            {notice ? (
              <View accessibilityLiveRegion="polite" style={styles.notice}>
                <Ionicons color={colors.semantic.success} name="checkmark-circle-outline" size={17} />
                <AppText style={styles.noticeText} tone="success" variant="caption">
                  {notice}
                </AppText>
              </View>
            ) : null}

            <Divider />

            <View style={styles.actions}>
              <AppButton onPress={handlePrototypeShare}>مشاركة التقرير</AppButton>
              <AppButton onPress={onClose} variant="secondary">
                تم
              </AppButton>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: colors.background.overlay,
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background.elevated,
    borderColor: colors.surface.border,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    borderWidth: 1,
    maxHeight: '88%',
    paddingHorizontal: 16,
    paddingTop: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: colors.text.tertiary,
    borderRadius: radii.pill,
    height: 4,
    marginBottom: spacing.lg,
    opacity: 0.54,
    width: 42,
  },
  sheetContent: {
    gap: spacing.lg,
  },
  successIcon: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.32)',
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 70,
    justifyContent: 'center',
    width: 70,
  },
  headerCopy: {
    gap: spacing.xs,
  },
  subtitle: {
    writingDirection: 'ltr',
  },
  options: {
    gap: spacing.sm,
  },
  languageRow: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 58,
    padding: spacing.lg,
  },
  languageCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  notice: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.22)',
    borderRadius: radii.control,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    padding: spacing.md,
  },
  noticeText: {
    flex: 1,
  },
  actions: {
    gap: spacing.sm,
  },
});
