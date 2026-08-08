import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, EmptyStateIcon } from '@/components/system';
import { AppText, Divider, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type SecurityEventCategory = 'login' | 'credentials' | 'devices' | 'settings';
type SecurityEventTone = 'success' | 'warning' | 'neutral' | 'danger';
type SecurityEventFilter = SecurityEventCategory | 'all';

type SecurityEvent = {
  id: string;
  title: string;
  description: string;
  category: SecurityEventCategory;
  categoryLabel: string;
  status: string;
  dateGroup: string;
  time: string;
  tone: SecurityEventTone;
  icon: keyof typeof Ionicons.glyphMap;
  deviceName?: string;
  platform?: string;
  clientName?: string;
  location?: string;
  exampleIpAddress?: string;
  requiresReview?: boolean;
};

type GroupedSecurityEvents = {
  dateGroup: string;
  events: SecurityEvent[];
};

const filters: { id: SecurityEventFilter; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'login', label: 'تسجيل الدخول' },
  { id: 'credentials', label: 'كلمة المرور وPIN' },
  { id: 'devices', label: 'الأجهزة والجلسات' },
  { id: 'settings', label: 'إعدادات الأمان' },
];

const prototypeEvents: SecurityEvent[] = [
  {
    id: 'successful-login',
    title: 'تسجيل دخول ناجح',
    description: 'تم تسجيل الدخول من Samsung Galaxy S24.',
    category: 'login',
    categoryLabel: 'تسجيل الدخول',
    status: 'ناجح',
    dateGroup: 'اليوم',
    time: '10:42 م',
    deviceName: 'Samsung Galaxy S24',
    platform: 'Android 16',
    clientName: 'Capital Mobile',
    location: 'الرياض، السعودية',
    exampleIpAddress: '192.0.2.24',
    tone: 'success',
    icon: 'log-in-outline',
  },
  {
    id: 'biometric-enabled',
    title: 'تم تفعيل الدخول بالبصمة',
    description: 'تم تفعيل خيار الدخول بالبصمة محليًا.',
    category: 'settings',
    categoryLabel: 'إعدادات الأمان',
    status: 'تم',
    dateGroup: 'اليوم',
    time: '9:10 م',
    tone: 'success',
    icon: 'finger-print-outline',
  },
  {
    id: 'failed-login',
    title: 'محاولة تسجيل دخول غير ناجحة',
    description: 'تم إدخال بيانات دخول غير صحيحة.',
    category: 'login',
    categoryLabel: 'تسجيل الدخول',
    status: 'تحتاج مراجعة',
    dateGroup: 'أمس',
    time: '11:35 م',
    deviceName: 'جهاز غير معروف',
    platform: 'Chrome Mobile',
    clientName: 'Chrome Mobile',
    location: 'جدة، السعودية',
    exampleIpAddress: '198.51.100.42',
    tone: 'warning',
    icon: 'warning-outline',
    requiresReview: true,
  },
  {
    id: 'password-changed',
    title: 'تم تغيير كلمة المرور',
    description: 'تم تحديث كلمة المرور من الجهاز الحالي.',
    category: 'credentials',
    categoryLabel: 'كلمة المرور وPIN',
    status: 'تم',
    dateGroup: 'أمس',
    time: '8:20 م',
    tone: 'success',
    icon: 'key-outline',
  },
  {
    id: 'pin-changed',
    title: 'تم تغيير رمز PIN',
    description: 'تم تحديث رمز الدخول السريع.',
    category: 'credentials',
    categoryLabel: 'كلمة المرور وPIN',
    status: 'تم',
    dateGroup: '18 يوليو 2026',
    time: '6:45 م',
    tone: 'success',
    icon: 'keypad-outline',
  },
  {
    id: 'device-trusted',
    title: 'تم توثيق جهاز',
    description: 'تمت إضافة iPhone 15 Pro إلى الأجهزة الموثوقة.',
    category: 'devices',
    categoryLabel: 'الأجهزة والجلسات',
    status: 'تم',
    dateGroup: '17 يوليو 2026',
    time: '4:30 م',
    deviceName: 'iPhone 15 Pro',
    platform: 'iOS 19',
    clientName: 'Capital Mobile',
    location: 'جدة، السعودية',
    exampleIpAddress: '203.0.113.18',
    tone: 'success',
    icon: 'phone-portrait-outline',
  },
  {
    id: 'session-ended',
    title: 'تم إنهاء جلسة',
    description: 'تم إنهاء جلسة Safari Mobile.',
    category: 'devices',
    categoryLabel: 'الأجهزة والجلسات',
    status: 'تم',
    dateGroup: '16 يوليو 2026',
    time: '2:15 م',
    deviceName: 'iPhone 15 Pro',
    platform: 'iOS 19',
    clientName: 'Safari Mobile',
    location: 'جدة، السعودية',
    exampleIpAddress: '198.51.100.42',
    tone: 'neutral',
    icon: 'desktop-outline',
  },
  {
    id: 'security-settings-changed',
    title: 'تم تعديل إعدادات الأمان',
    description: 'تم تغيير إعدادات الدخول والبصمة.',
    category: 'settings',
    categoryLabel: 'إعدادات الأمان',
    status: 'تحتاج مراجعة',
    dateGroup: '15 يوليو 2026',
    time: '12:10 م',
    tone: 'warning',
    icon: 'shield-half-outline',
    requiresReview: true,
  },
];

export function SecurityLogScreen() {
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState<SecurityEventFilter>('all');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const filteredEvents = useMemo(
    () =>
      selectedFilter === 'all'
        ? prototypeEvents
        : prototypeEvents.filter((event) => event.category === selectedFilter),
    [selectedFilter],
  );
  const groupedEvents = useMemo(() => groupSecurityEvents(filteredEvents), [filteredEvents]);
  const successfulCount = prototypeEvents.filter((event) => !event.requiresReview).length;
  const reviewCount = prototypeEvents.filter((event) => event.requiresReview).length;

  function goBackToSecurity() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(routes.security);
  }

  function handleFilterPress(filter: SecurityEventFilter) {
    Haptics.selectionAsync().catch(() => null);
    setSelectedFilter(filter);
    setExpandedEventId(null);
  }

  function handleEventPress(eventId: string) {
    Haptics.selectionAsync().catch(() => null);
    setExpandedEventId((current) => (current === eventId ? null : eventId));
  }

  function handleReviewPress(event: SecurityEvent) {
    Haptics.selectionAsync().catch(() => null);
    if (event.category === 'login') {
      router.push(routes.activeSessions);
      return;
    }

    router.push(routes.security);
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.background.heroStart, colors.background.base, colors.background.base]}
        end={{ x: 0.72, y: 1 }}
        locations={[0, 0.5, 1]}
        start={{ x: 0.28, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom + spacing.xxxl, spacing.screenBottom),
            paddingTop: Math.max(insets.top, spacing.safeTop),
          },
        ]}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <SecurityLogHeader onBackPress={goBackToSecurity} />
        <IntroCard />
        <SummaryCard successfulCount={successfulCount} reviewCount={reviewCount} totalCount={prototypeEvents.length} />
        <FilterChips selectedFilter={selectedFilter} onFilterPress={handleFilterPress} />

        {groupedEvents.length > 0 ? (
          groupedEvents.map((group) => (
            <View key={group.dateGroup} style={styles.section}>
              <AppText variant="sectionTitle">{group.dateGroup}</AppText>
              <View style={styles.eventsStack}>
                {group.events.map((event) => (
                  <EventCard
                    event={event}
                    expanded={expandedEventId === event.id}
                    key={event.id}
                    onPress={() => handleEventPress(event.id)}
                    onReviewPress={() => handleReviewPress(event)}
                  />
                ))}
              </View>
            </View>
          ))
        ) : (
          <EmptyState
            description="لا توجد أحداث أمان ضمن هذا التصنيف."
            icon={<EmptyStateIcon name="document-text-outline" />}
            title="لا توجد أحداث"
          />
        )}

        <SecurityActionCard />
      </ScrollView>
    </View>
  );
}

function groupSecurityEvents(events: SecurityEvent[]): GroupedSecurityEvents[] {
  return events.reduce<GroupedSecurityEvents[]>((groups, event) => {
    const existingGroup = groups.find((group) => group.dateGroup === event.dateGroup);
    if (existingGroup) {
      existingGroup.events.push(event);
      return groups;
    }

    groups.push({ dateGroup: event.dateGroup, events: [event] });
    return groups;
  }, []);
}

function SecurityLogHeader({ onBackPress }: { onBackPress: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="العودة إلى الأمان"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onBackPress}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text.muted} name="chevron-back-outline" size={22} />
      </Pressable>
      <AppText align="right" numberOfLines={1} style={styles.headerTitle} variant="screenTitle">
        سجل الأمان
      </AppText>
    </View>
  );
}

function IntroCard() {
  return (
    <SolidCard style={styles.introCard}>
      <View style={styles.introIcon}>
        <Ionicons color={colors.brand.calmGreen} name="time-outline" size={22} />
      </View>
      <View style={styles.introCopy}>
        <AppText variant="cardTitle">راجع نشاط حسابك</AppText>
        <AppText style={styles.description} tone="secondary" variant="supporting">
          يعرض هذا السجل تغييرات الأمان ومحاولات الدخول المهمة داخل النموذج التجريبي.
        </AppText>
        <AppText tone="tertiary" variant="caption">
          الأحداث المعروضة ببيانات تجريبية وليست نشاطًا حقيقيًا.
        </AppText>
      </View>
    </SolidCard>
  );
}

function SummaryCard({
  totalCount,
  successfulCount,
  reviewCount,
}: {
  totalCount: number;
  successfulCount: number;
  reviewCount: number;
}) {
  return (
    <SolidCard style={styles.summaryCard}>
      <View style={styles.summaryCopy}>
        <AppText variant="cardTitle">آخر 30 يومًا</AppText>
        <View style={styles.summaryRows}>
          <SummaryLine label="أحداث الأمان" value={totalCount} />
          <SummaryLine label="ناجحة" value={successfulCount} tone="success" />
          <SummaryLine label="تحتاج مراجعة" value={reviewCount} tone="warning" />
        </View>
      </View>
      <View style={styles.summaryValueWrap}>
        <AppText align="center" style={styles.summaryValue} tone="success" variant="numericValue">
          {totalCount}
        </AppText>
      </View>
    </SolidCard>
  );
}

function SummaryLine({
  label,
  value,
  tone = 'primary',
}: {
  label: string;
  value: number;
  tone?: 'primary' | 'success' | 'warning';
}) {
  return (
    <View style={styles.summaryLine}>
      <AppText tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText align="left" style={styles.ltrText} tone={tone} variant="caption">
        {value}
      </AppText>
    </View>
  );
}

function FilterChips({
  selectedFilter,
  onFilterPress,
}: {
  selectedFilter: SecurityEventFilter;
  onFilterPress: (filter: SecurityEventFilter) => void;
}) {
  return (
    <ScrollView
      contentContainerStyle={styles.filterContent}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterScroll}
    >
      {filters.map((filter) => (
        <Pressable
          accessibilityLabel={filter.label}
          accessibilityRole="button"
          accessibilityState={{ selected: selectedFilter === filter.id }}
          key={filter.id}
          onPress={() => onFilterPress(filter.id)}
          style={({ pressed }) => [
            styles.filterChip,
            selectedFilter === filter.id ? styles.selectedFilterChip : styles.unselectedFilterChip,
            pressed && styles.pressed,
          ]}
        >
          <AppText align="center" numberOfLines={1} tone={selectedFilter === filter.id ? 'success' : 'secondary'} variant="caption">
            {filter.label}
          </AppText>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function EventCard({
  event,
  expanded,
  onPress,
  onReviewPress,
}: {
  event: SecurityEvent;
  expanded: boolean;
  onPress: () => void;
  onReviewPress: () => void;
}) {
  const toneStyles = getToneStyles(event.tone);

  return (
    <Pressable
      accessibilityHint={expanded ? 'اضغط لإخفاء تفاصيل الحدث' : 'اضغط لعرض تفاصيل الحدث'}
      accessibilityLabel={`${event.title}. ${event.status}. ${event.dateGroup}. ${event.time}`}
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <SolidCard style={[styles.eventCard, event.tone === 'warning' && styles.warningEventCard]}>
        <View style={styles.eventHeader}>
          <Ionicons color={colors.text.tertiary} name={expanded ? 'chevron-up-outline' : 'chevron-down-outline'} size={17} />
          <View style={[styles.eventIcon, toneStyles.icon]}>
            <Ionicons color={toneStyles.color} name={event.icon} size={20} />
          </View>
          <View style={styles.eventCopy}>
            <View style={styles.eventTitleRow}>
              <AppText style={styles.eventTitle} variant="body">
                {event.title}
              </AppText>
              <StatusBadge label={event.status} tone={event.tone} />
            </View>
            <AppText style={styles.description} tone="secondary" variant="caption">
              {event.description}
            </AppText>
            <View style={styles.eventMetaRow}>
              <AppText tone="tertiary" variant="caption">
                {event.categoryLabel}
              </AppText>
              <View style={styles.dot} />
              <AppText align="left" style={styles.ltrText} tone="tertiary" variant="caption">
                {event.time}
              </AppText>
            </View>
          </View>
        </View>

        {event.deviceName || event.location ? (
          <View style={styles.eventSummary}>
            {event.deviceName ? (
              <AppText align="left" numberOfLines={1} style={styles.ltrText} tone="secondary" variant="caption">
                {event.deviceName}
              </AppText>
            ) : null}
            {event.location ? (
              <AppText tone="secondary" variant="caption">
                {event.location}
              </AppText>
            ) : null}
          </View>
        ) : null}

        {expanded ? (
          <>
            <Divider />
            <View style={styles.eventDetails}>
              {event.deviceName ? <EventDetail label="الجهاز" ltr value={event.deviceName} /> : null}
              {event.platform ? <EventDetail label="النظام" ltr value={event.platform} /> : null}
              {event.clientName ? <EventDetail label="التطبيق أو المتصفح" ltr value={event.clientName} /> : null}
              {event.location ? <EventDetail label="الموقع التقريبي" value={event.location} /> : null}
              {event.exampleIpAddress ? <EventDetail label="عنوان IP تجريبي" ltr value={event.exampleIpAddress} /> : null}
              <EventDetail label="الوقت" value={`${event.dateGroup}، ${event.time}`} />
              <EventDetail label="حالة الحدث" value={event.status} />
            </View>
          </>
        ) : null}

        {event.requiresReview ? (
          <Pressable
            accessibilityLabel={`مراجعة النشاط: ${event.title}`}
            accessibilityRole="button"
            onPress={(pressEvent) => {
              pressEvent.stopPropagation();
              onReviewPress();
            }}
            style={({ pressed }) => [styles.reviewAction, pressed && styles.pressed]}
          >
            <AppText align="center" tone="warning" variant="supporting">
              مراجعة النشاط
            </AppText>
          </Pressable>
        ) : null}
      </SolidCard>
    </Pressable>
  );
}

function EventDetail({ label, value, ltr = false }: { label: string; value: string; ltr?: boolean }) {
  return (
    <View style={styles.detailRow}>
      <AppText tone="tertiary" variant="caption">
        {label}
      </AppText>
      <AppText align={ltr ? 'left' : 'right'} style={[styles.detailValue, ltr && styles.ltrText]} variant="caption">
        {value}
      </AppText>
    </View>
  );
}

function SecurityActionCard() {
  return (
    <SolidCard style={styles.actionCard}>
      <Ionicons color={colors.semantic.warning} name="warning-outline" size={20} />
      <View style={styles.actionCopy}>
        <AppText variant="cardTitle">هل لاحظت نشاطًا غير معروف؟</AppText>
        <AppText style={styles.description} tone="secondary" variant="supporting">
          غيّر كلمة المرور، راجع الجلسات النشطة، وأزل أي جهاز لا تعرفه.
        </AppText>
        <View style={styles.actionButtons}>
          <InlineAction label="تغيير كلمة المرور" onPress={() => router.push(routes.changePassword)} />
          <InlineAction label="الجلسات النشطة" onPress={() => router.push(routes.activeSessions)} />
          <InlineAction label="الأجهزة الموثوقة" onPress={() => router.push(routes.trustedDevices)} />
        </View>
      </View>
    </SolidCard>
  );
}

function InlineAction({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={() => {
        Haptics.selectionAsync().catch(() => null);
        onPress();
      }}
      style={({ pressed }) => [styles.inlineAction, pressed && styles.pressed]}
    >
      <AppText align="center" tone="link" variant="supporting">
        {label}
      </AppText>
    </Pressable>
  );
}

function StatusBadge({ label, tone }: { label: string; tone: SecurityEventTone }) {
  const toneStyles = getToneStyles(tone);

  return (
    <View style={[styles.statusBadge, toneStyles.badge]}>
      <AppText align="center" tone={toneStyles.textTone} variant="caption">
        {label}
      </AppText>
    </View>
  );
}

function getToneStyles(tone: SecurityEventTone) {
  if (tone === 'success') {
    return {
      color: colors.semantic.success,
      textTone: 'success' as const,
      icon: styles.successIcon,
      badge: styles.successBadge,
    };
  }

  if (tone === 'warning') {
    return {
      color: colors.semantic.warning,
      textTone: 'warning' as const,
      icon: styles.warningIcon,
      badge: styles.warningBadge,
    };
  }

  if (tone === 'danger') {
    return {
      color: colors.semantic.danger,
      textTone: 'danger' as const,
      icon: styles.dangerIcon,
      badge: styles.dangerBadge,
    };
  }

  return {
    color: colors.text.tertiary,
    textTone: 'secondary' as const,
    icon: styles.neutralIcon,
    badge: styles.neutralBadge,
  };
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
    backgroundColor: 'rgba(11,46,38,0.70)',
    borderColor: 'rgba(167,200,161,0.24)',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  introIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.16)',
    borderColor: 'rgba(167,200,161,0.32)',
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
  description: {
    alignSelf: 'stretch',
    lineHeight: 22,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  summaryCard: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  summaryCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  summaryRows: {
    gap: spacing.xs,
  },
  summaryLine: {
    width: '100%',
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  summaryValueWrap: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.30)',
    borderRadius: radii.card,
    borderWidth: 1,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  summaryValue: {
    lineHeight: 34,
  },
  filterScroll: {
    marginHorizontal: -16,
  },
  filterContent: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingHorizontal: 16,
  },
  filterChip: {
    alignItems: 'center',
    borderRadius: radii.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: spacing.lg,
  },
  selectedFilterChip: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.46)',
  },
  unselectedFilterChip: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
  },
  section: {
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  eventsStack: {
    gap: spacing.md,
  },
  eventCard: {
    gap: spacing.md,
  },
  warningEventCard: {
    borderColor: 'rgba(232,163,61,0.22)',
  },
  eventHeader: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
  },
  eventIcon: {
    alignItems: 'center',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  successIcon: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.30)',
  },
  warningIcon: {
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.30)',
  },
  dangerIcon: {
    backgroundColor: colors.semantic.dangerTint,
    borderColor: 'rgba(229,103,90,0.30)',
  },
  neutralIcon: {
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
  },
  eventCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  eventTitleRow: {
    alignItems: 'flex-start',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  eventTitle: {
    alignSelf: 'stretch',
    flex: 1,
    lineHeight: 22,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  eventMetaRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dot: {
    backgroundColor: colors.text.tertiary,
    borderRadius: radii.pill,
    height: 3,
    opacity: 0.72,
    width: 3,
  },
  eventSummary: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  eventDetails: {
    gap: spacing.sm,
  },
  detailRow: {
    width: '100%',
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  detailValue: {
    flex: 1,
  },
  ltrText: {
    writingDirection: 'ltr',
  },
  statusBadge: {
    borderRadius: radii.pill,
    borderWidth: 1,
    minWidth: 62,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  successBadge: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.30)',
  },
  warningBadge: {
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.28)',
  },
  dangerBadge: {
    backgroundColor: colors.semantic.dangerTint,
    borderColor: 'rgba(229,103,90,0.30)',
  },
  neutralBadge: {
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
  },
  reviewAction: {
    alignSelf: 'flex-start',
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.30)',
    borderRadius: radii.pill,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  actionCard: {
    alignItems: 'center',
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.24)',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  actionCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  actionButtons: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  inlineAction: {
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: 'rgba(232,163,61,0.24)',
    borderRadius: radii.pill,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
});
