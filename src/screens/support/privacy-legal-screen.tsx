import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText, Divider, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type PrivacyLegalRow = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  tone?: 'default' | 'danger';
  legalType?: 'terms' | 'privacy';
  notice?: string;
};

type ConsentStatus = {
  id: string;
  label: string;
  status: string;
  tone: 'success' | 'muted';
};

type AccountDataSummaryRow = {
  id: string;
  label: string;
  value: string;
  ltr?: boolean;
};

const privacyRows: PrivacyLegalRow[] = [
  {
    id: 'data-consents',
    icon: 'options-outline',
    title: 'إدارة البيانات والموافقات',
    description: 'تحكم في استخدام بياناتك وإعدادات الخصوصية',
    notice: 'إدارة البيانات والموافقات ستكون متاحة في الخطوة التالية',
  },
  {
    id: 'request-data-copy',
    icon: 'download-outline',
    title: 'طلب نسخة من بياناتي',
    description: 'اطلب ملفًا يحتوي على بيانات حسابك',
    notice: 'طلب نسخة البيانات سيكون متاحًا في الخطوة التالية',
  },
  {
    id: 'delete-account',
    icon: 'trash-outline',
    title: 'حذف الحساب',
    description: 'إرسال طلب حذف نهائي للحساب والبيانات',
    tone: 'danger',
    notice: 'حذف الحساب سيكون متاحًا في الخطوة التالية',
  },
];

const legalRows: PrivacyLegalRow[] = [
  {
    id: 'privacy-policy',
    icon: 'shield-checkmark-outline',
    title: 'سياسة الخصوصية',
    description: 'آخر تحديث: 1 يوليو 2026',
    legalType: 'privacy',
  },
  {
    id: 'terms',
    icon: 'document-text-outline',
    title: 'شروط الاستخدام',
    description: 'آخر تحديث: 1 يوليو 2026',
    legalType: 'terms',
  },
  {
    id: 'retention-policy',
    icon: 'file-tray-full-outline',
    title: 'سياسة الاحتفاظ بالبيانات',
    description: 'تعرف على مدة الاحتفاظ بمعلوماتك',
    notice: 'سيتم توفير المستند الكامل لاحقًا',
  },
  {
    id: 'security-policy',
    icon: 'lock-closed-outline',
    title: 'سياسة الأمان',
    description: 'كيف يحمي Capital بياناتك',
    notice: 'سيتم توفير المستند الكامل لاحقًا',
  },
];

const consentStatuses: ConsentStatus[] = [
  { id: 'terms', label: 'شروط الاستخدام', status: 'مقبول', tone: 'success' },
  { id: 'privacy', label: 'سياسة الخصوصية', status: 'مقبول', tone: 'success' },
  { id: 'marketing', label: 'الرسائل التسويقية', status: 'غير مفعلة', tone: 'muted' },
  { id: 'experience', label: 'تحسين التجربة باستخدام البيانات', status: 'مفعلة', tone: 'success' },
];

const accountDataSummary: AccountDataSummaryRow[] = [
  { id: 'created', label: 'تاريخ إنشاء الحساب', value: '15 يوليو 2026' },
  { id: 'country', label: 'الدولة', value: 'المملكة العربية السعودية' },
  { id: 'currency', label: 'العملة', value: 'الريال السعودي — ر.س' },
  { id: 'version', label: 'إصدار التطبيق', value: '1.0.0 Prototype', ltr: true },
];

export function PrivacyLegalScreen() {
  const insets = useSafeAreaInsets();
  const [notice, setNotice] = useState<string | null>(null);

  function handleBackPress() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(routes.account);
  }

  function handleRowPress(row: PrivacyLegalRow) {
    Haptics.selectionAsync().catch(() => null);

    if (row.legalType) {
      setNotice(null);
      router.push({ pathname: routes.legal, params: { type: row.legalType } });
      return;
    }

    if (row.id === 'data-consents') {
      setNotice(null);
      router.push(routes.dataConsents);
      return;
    }

    if (row.id === 'request-data-copy') {
      setNotice(null);
      router.push(routes.requestDataCopy);
      return;
    }

    if (row.id === 'delete-account') {
      setNotice(null);
      router.push(routes.deleteAccount);
      return;
    }

    setNotice(row.notice ?? 'سيتم توفير المستند الكامل لاحقًا');
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.background.heroStart, colors.background.base, colors.background.base]}
        end={{ x: 0.72, y: 1 }}
        locations={[0, 0.52, 1]}
        start={{ x: 0.28, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom + spacing.xxxl, spacing.screenBottom),
            paddingTop: Platform.OS === 'ios' ? spacing.sm : Math.max(insets.top, spacing.safeTop),
          },
        ]}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
      >
        <PrivacyLegalHeader onBackPress={handleBackPress} />

        <IntroCard />

        {notice ? (
          <SolidCard accessibilityLiveRegion="polite" style={styles.noticeCard}>
            <Ionicons color={colors.semantic.warning} name="information-circle-outline" size={17} />
            <AppText style={styles.noticeText} tone="warning" variant="supporting">
              {notice}
            </AppText>
          </SolidCard>
        ) : null}

        <PrivacyLegalSection rows={privacyRows} title="الخصوصية والبيانات" onRowPress={handleRowPress} />
        <PrivacyLegalSection rows={legalRows} title="المستندات القانونية" onRowPress={handleRowPress} />
        <ConsentStatusSection />
        <AccountDataSummarySection />
        <ContactPrivacyCard />
      </ScrollView>
    </View>
  );
}

function PrivacyLegalHeader({ onBackPress }: { onBackPress: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="العودة إلى الحساب"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onBackPress}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text.muted} name="chevron-back-outline" size={22} />
      </Pressable>
      <AppText align="right" numberOfLines={1} style={styles.headerTitle} variant="screenTitle">
        الخصوصية والقانونية
      </AppText>
    </View>
  );
}

function IntroCard() {
  return (
    <SolidCard style={styles.introCard}>
      <View style={styles.introIcon}>
        <Ionicons color={colors.brand.calmGreen} name="shield-checkmark-outline" size={22} />
      </View>
      <View style={styles.introCopy}>
        <AppText style={styles.introTitle} variant="cardTitle">بياناتك تحت سيطرتك</AppText>
        <AppText style={styles.introText} tone="secondary" variant="supporting">
          يمكنك مراجعة كيفية استخدام بياناتك، إدارة موافقاتك، وطلب نسخة من معلوماتك أو حذف حسابك.
        </AppText>
      </View>
    </SolidCard>
  );
}

function PrivacyLegalSection({
  title,
  rows,
  onRowPress,
}: {
  title: string;
  rows: PrivacyLegalRow[];
  onRowPress: (row: PrivacyLegalRow) => void;
}) {
  return (
    <View style={styles.section}>
      <AppText style={styles.sectionTitle} variant="sectionTitle">{title}</AppText>
      <SolidCard style={styles.rowsCard}>
        {rows.map((row, index) => (
          <View key={row.id}>
            <PrivacyLegalActionRow row={row} onPress={() => onRowPress(row)} />
            {index < rows.length - 1 ? <Divider /> : null}
          </View>
        ))}
      </SolidCard>
    </View>
  );
}

function PrivacyLegalActionRow({ row, onPress }: { row: PrivacyLegalRow; onPress: () => void }) {
  const danger = row.tone === 'danger';

  return (
    <Pressable
      accessibilityLabel={`${row.title}. ${row.description ?? ''}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}
    >
      <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={17} />
      <View style={[styles.rowIcon, danger && styles.dangerIcon]}>
        <Ionicons color={danger ? colors.semantic.danger : colors.brand.green} name={row.icon} size={18} />
      </View>
      <View style={styles.rowCopy}>
        <AppText tone={danger ? 'danger' : 'primary'} variant="body">
          {row.title}
        </AppText>
        {row.description ? (
          <AppText tone="secondary" variant="caption">
            {row.description}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}

function ConsentStatusSection() {
  return (
    <View style={styles.section}>
      <AppText style={styles.sectionTitle} variant="sectionTitle">حالة الموافقات</AppText>
      <SolidCard style={styles.rowsCard}>
        {consentStatuses.map((item, index) => (
          <View key={item.id}>
            <View style={styles.statusRow}>
              <AppText style={styles.statusLabel} variant="body">
                {item.label}
              </AppText>
              <StatusPill status={item.status} tone={item.tone} />
            </View>
            {index < consentStatuses.length - 1 ? <Divider /> : null}
          </View>
        ))}
      </SolidCard>
    </View>
  );
}

function AccountDataSummarySection() {
  return (
    <View style={styles.section}>
      <AppText style={styles.sectionTitle} variant="sectionTitle">ملخص بيانات الحساب</AppText>
      <SolidCard style={styles.summaryCard}>
        {accountDataSummary.map((row, index) => (
          <View key={row.id}>
            <View style={styles.summaryRow}>
              <AppText tone="secondary" variant="caption">
                {row.label}
              </AppText>
              <AppText style={row.ltr && styles.ltrValue} variant="supporting">
                {row.value}
              </AppText>
            </View>
            {index < accountDataSummary.length - 1 ? <Divider /> : null}
          </View>
        ))}
      </SolidCard>
    </View>
  );
}

function ContactPrivacyCard() {
  return (
    <SolidCard style={styles.contactCard}>
      <View style={styles.contactCopy}>
        <AppText variant="cardTitle">هل لديك سؤال عن الخصوصية؟</AppText>
        <AppText tone="secondary" variant="supporting">
          فريق الدعم يساعدك في توضيح أي نقطة مرتبطة ببياناتك أو موافقاتك.
        </AppText>
      </View>
      <AppButton onPress={() => router.push(routes.contactSupport)} variant="secondary">
        التواصل مع الدعم
      </AppButton>
    </SolidCard>
  );
}

function StatusPill({ status, tone }: { status: string; tone: 'success' | 'muted' }) {
  return (
    <View style={[styles.statusPill, tone === 'success' ? styles.statusSuccess : styles.statusMuted]}>
      <AppText align="center" tone={tone === 'success' ? 'success' : 'tertiary'} variant="caption">
        {status}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.base,
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 42,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerTitle: {
    alignSelf: 'stretch',
    flex: 1,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  introCard: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.30)',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  introIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(167,200,161,0.11)',
    borderColor: 'rgba(167,200,161,0.24)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  introCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  introText: {
    alignSelf: 'stretch',
    lineHeight: 22,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  introTitle: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  noticeCard: {
    alignItems: 'center',
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.24)',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  noticeText: {
    alignSelf: 'stretch',
    flex: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  section: {
    alignItems: 'flex-end',
    gap: spacing.md,
    width: '100%',
  },
  sectionTitle: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  rowsCard: {
    padding: 0,
  },
  actionRow: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 74,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.10)',
    borderColor: 'rgba(167,200,161,0.24)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  dangerIcon: {
    backgroundColor: colors.semantic.dangerTint,
    borderColor: 'rgba(229,103,90,0.28)',
  },
  rowCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  statusRow: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 58,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  statusLabel: {
    alignSelf: 'stretch',
    flex: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  statusPill: {
    borderRadius: radii.pill,
    borderWidth: 1,
    minWidth: 86,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  statusSuccess: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.36)',
  },
  statusMuted: {
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
  },
  summaryCard: {
    padding: 0,
  },
  summaryRow: {
    width: '100%',
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  ltrValue: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  contactCard: {
    gap: spacing.lg,
  },
  contactCopy: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
});
