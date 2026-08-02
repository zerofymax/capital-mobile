import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type SupportRequestStatus = 'open' | 'waiting' | 'closed';
type SupportRequestPriority = 'normal' | 'important' | 'urgent';
type SupportRequestFilter = 'all' | SupportRequestStatus;

type SupportRequestItem = {
  id: string;
  reference: string;
  title: string;
  category: string;
  status: SupportRequestStatus;
  priority: SupportRequestPriority;
  createdAt: string;
  lastUpdate: string;
  hasUnreadUpdate: boolean;
};

const filterOptions: { id: SupportRequestFilter; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'open', label: 'مفتوحة' },
  { id: 'waiting', label: 'بانتظار الرد' },
  { id: 'closed', label: 'مغلقة' },
];

const initialSupportRequests: SupportRequestItem[] = [
  {
    id: 'monthly-performance-report',
    reference: 'CAP-SUP-1049',
    title: 'مشكلة في تقرير الأداء الشهري',
    category: 'التقارير',
    status: 'open',
    priority: 'normal',
    createdAt: 'اليوم، 10:42 ص',
    lastUpdate: 'تم استلام الطلب وسيتم مراجعته قريبًا.',
    hasUnreadUpdate: true,
  },
  {
    id: 'subscription-renewal',
    reference: 'CAP-SUP-1038',
    title: 'استفسار عن تجديد الاشتراك',
    category: 'الاشتراك',
    status: 'waiting',
    priority: 'important',
    createdAt: 'أمس، 4:15 م',
    lastUpdate: 'طلب فريق الدعم معلومات إضافية عن وسيلة الدفع.',
    hasUnreadUpdate: true,
  },
  {
    id: 'transaction-category',
    reference: 'CAP-SUP-1017',
    title: 'تعديل تصنيف معاملة',
    category: 'المعاملات',
    status: 'closed',
    priority: 'normal',
    createdAt: '12 يوليو 2026',
    lastUpdate: 'تم توضيح خطوات تعديل التصنيف من شاشة تفاصيل المعاملة.',
    hasUnreadUpdate: false,
  },
  {
    id: 'ledger-interface-feedback',
    reference: 'CAP-SUP-0992',
    title: 'ملاحظة حول واجهة السجل',
    category: 'اقتراح أو ملاحظة',
    status: 'closed',
    priority: 'normal',
    createdAt: '8 يوليو 2026',
    lastUpdate: 'تمت مشاركة الملاحظة مع فريق المنتج.',
    hasUnreadUpdate: false,
  },
];

export function SupportRequestsScreen() {
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState<SupportRequestFilter>('all');
  const [requests, setRequests] = useState<SupportRequestItem[]>(initialSupportRequests);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const searchTerm = query.trim();

  const visibleRequests = useMemo(() => {
    const filteredByStatus =
      selectedFilter === 'all' ? requests : requests.filter((request) => request.status === selectedFilter);

    if (!searchTerm) {
      return filteredByStatus;
    }

    return filteredByStatus.filter((request) =>
      matchesSearch(searchTerm, [request.title, request.reference, request.category, request.createdAt, request.lastUpdate]),
    );
  }, [requests, searchTerm, selectedFilter]);

  function handleBackPress() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(routes.helpCenter);
  }

  function handleRequestPress(request: SupportRequestItem) {
    Haptics.selectionAsync().catch(() => null);
    setExpandedId((current) => (current === request.id ? null : request.id));
    setRequests((current) =>
      current.map((item) => (item.id === request.id ? { ...item, hasUnreadUpdate: false } : item)),
    );
  }

  function handleNewRequestPress() {
    router.push(routes.contactSupport);
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
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom: Math.max(insets.bottom + spacing.xxxl, spacing.screenBottom),
            },
          ]}
          contentInsetAdjustmentBehavior="never"
          showsVerticalScrollIndicator={false}
        >
          <SupportRequestsHeader onBackPress={handleBackPress} onNewRequestPress={handleNewRequestPress} />

          <View style={styles.searchCard}>
            <Ionicons color={colors.text.tertiary} name="search-outline" size={18} />
            <TextInput
              accessibilityLabel="ابحث في طلبات الدعم"
              onChangeText={setQuery}
              placeholder="ابحث برقم الطلب أو العنوان"
              placeholderTextColor={colors.text.tertiary}
              style={styles.searchInput}
              value={query}
            />
          </View>

          <ScrollView
            contentContainerStyle={styles.filters}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {filterOptions.map((filter) => (
              <FilterChip
                filter={filter}
                key={filter.id}
                onPress={setSelectedFilter}
                selected={selectedFilter === filter.id}
              />
            ))}
          </ScrollView>

          {visibleRequests.length > 0 ? (
            <View style={styles.list}>
              {visibleRequests.map((request) => (
                <SupportRequestCard
                  expanded={expandedId === request.id}
                  key={request.id}
                  onPress={handleRequestPress}
                  request={request}
                />
              ))}
            </View>
          ) : (
            <SupportRequestsEmptyState onNewRequestPress={handleNewRequestPress} />
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function SupportRequestsHeader({
  onBackPress,
  onNewRequestPress,
}: {
  onBackPress: () => void;
  onNewRequestPress: () => void;
}) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="العودة إلى مركز المساعدة"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onBackPress}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text.muted} name="chevron-forward-outline" size={22} />
      </Pressable>
      <View style={styles.headerCopy}>
        <AppText align="center" numberOfLines={1} variant="screenTitle">
          طلبات الدعم
        </AppText>
        <AppText align="center" numberOfLines={2} tone="secondary" variant="supporting">
          تابع حالة طلباتك وتحديثاتها
        </AppText>
      </View>
      <Pressable
        accessibilityLabel="طلب جديد"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onNewRequestPress}
        style={({ pressed }) => [styles.newRequestButton, pressed && styles.pressed]}
      >
        <AppText align="center" tone="success" variant="caption">
          طلب جديد
        </AppText>
      </Pressable>
    </View>
  );
}

function FilterChip({
  filter,
  selected,
  onPress,
}: {
  filter: { id: SupportRequestFilter; label: string };
  selected: boolean;
  onPress: (filter: SupportRequestFilter) => void;
}) {
  return (
    <Pressable
      accessibilityLabel={filter.label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => onPress(filter.id)}
      style={({ pressed }) => [
        styles.filterChip,
        selected ? styles.filterSelected : styles.filterUnselected,
        pressed && styles.pressed,
      ]}
    >
      <AppText align="center" numberOfLines={1} tone={selected ? 'success' : 'secondary'} variant="buttonLabel">
        {filter.label}
      </AppText>
    </Pressable>
  );
}

function SupportRequestCard({
  request,
  expanded,
  onPress,
}: {
  request: SupportRequestItem;
  expanded: boolean;
  onPress: (request: SupportRequestItem) => void;
}) {
  const status = getStatusMeta(request.status);
  const priority = getPriorityMeta(request.priority);

  return (
    <Pressable
      accessibilityLabel={`${request.title}. ${request.reference}. الحالة ${status.label}. ${
        request.hasUnreadUpdate ? 'يوجد تحديث جديد.' : 'لا توجد تحديثات غير مقروءة.'
      }`}
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      onPress={() => onPress(request)}
      style={({ pressed }) => [styles.requestCard, request.hasUnreadUpdate && styles.unreadCard, pressed && styles.pressed]}
    >
      <View style={styles.cardTop}>
        <View style={styles.statusAndReference}>
          <StatusPill label={status.label} tone={status.tone} />
          <AppText style={styles.reference} tone="secondary" variant="caption">
            {request.reference}
          </AppText>
          {request.hasUnreadUpdate ? (
            <View style={styles.unreadBadge}>
              <View style={styles.unreadDot} />
              <AppText tone="success" variant="caption">
                تحديث جديد
              </AppText>
            </View>
          ) : null}
        </View>
        <Ionicons color={colors.text.tertiary} name={expanded ? 'chevron-up-outline' : 'chevron-back-outline'} size={19} />
      </View>

      <View style={styles.cardBody}>
        <AppText variant="cardTitle">{request.title}</AppText>
        <View style={styles.metaRow}>
          <AppText tone="secondary" variant="caption">
            {request.category}
          </AppText>
          <View style={styles.metaDot} />
          <AppText tone="secondary" variant="caption">
            {request.createdAt}
          </AppText>
        </View>
      </View>

      <View style={styles.updateBlock}>
        <AppText tone="tertiary" variant="caption">
          آخر تحديث
        </AppText>
        <AppText style={styles.lastUpdate} tone="secondary" variant="supporting">
          {request.lastUpdate}
        </AppText>
      </View>

      {expanded ? (
        <View style={styles.expandedBlock}>
          <View style={styles.expandedGrid}>
            <DetailMeta label="المرجع" ltr value={request.reference} />
            <DetailMeta label="القسم" value={request.category} />
            <DetailMeta label="الأولوية" tone={priority.tone} value={priority.label} />
            <DetailMeta label="تاريخ الإنشاء" value={request.createdAt} />
          </View>

          <View style={styles.timeline}>
            {['تم إنشاء الطلب', 'تم استلامه من فريق الدعم', 'آخر تحديث حسب حالة الطلب'].map((item, index) => (
              <View key={item} style={styles.timelineItem}>
                <View style={[styles.timelineDot, index < 2 && styles.timelineDotActive]} />
                <AppText tone={index < 2 ? 'secondary' : 'tertiary'} variant="supporting">
                  {item}
                </AppText>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </Pressable>
  );
}

function StatusPill({ label, tone }: { label: string; tone: 'success' | 'warning' | 'muted' }) {
  const style = tone === 'success' ? styles.statusSuccess : tone === 'warning' ? styles.statusWarning : styles.statusMuted;
  const textTone = tone === 'success' ? 'success' : tone === 'warning' ? 'warning' : 'tertiary';

  return (
    <View style={[styles.statusPill, style]}>
      <AppText align="center" tone={textTone} variant="caption">
        {label}
      </AppText>
    </View>
  );
}

function DetailMeta({
  label,
  value,
  tone = 'secondary',
  ltr = false,
}: {
  label: string;
  value: string;
  tone?: 'secondary' | 'warning' | 'danger' | 'success';
  ltr?: boolean;
}) {
  return (
    <View style={styles.detailMeta}>
      <AppText tone="tertiary" variant="caption">
        {label}
      </AppText>
      <AppText style={ltr && styles.ltrValue} tone={tone} variant="supporting">
        {value}
      </AppText>
    </View>
  );
}

function SupportRequestsEmptyState({ onNewRequestPress }: { onNewRequestPress: () => void }) {
  return (
    <SolidCard style={styles.emptyCard}>
      <View style={styles.emptyIcon}>
        <Ionicons color={colors.text.tertiary} name="file-tray-outline" size={27} />
      </View>
      <View style={styles.emptyCopy}>
        <AppText align="center" variant="cardTitle">
          لا توجد طلبات دعم
        </AppText>
        <AppText align="center" tone="secondary" variant="supporting">
          يمكنك إنشاء طلب جديد وسنتابع معك من هنا.
        </AppText>
      </View>
      <AppButton onPress={onNewRequestPress}>إنشاء طلب جديد</AppButton>
    </SolidCard>
  );
}

function getStatusMeta(status: SupportRequestStatus) {
  if (status === 'open') {
    return { label: 'مفتوح', tone: 'success' as const };
  }

  if (status === 'waiting') {
    return { label: 'بانتظار الرد', tone: 'warning' as const };
  }

  return { label: 'مغلق', tone: 'muted' as const };
}

function getPriorityMeta(priority: SupportRequestPriority) {
  if (priority === 'important') {
    return { label: 'مهمة', tone: 'warning' as const };
  }

  if (priority === 'urgent') {
    return { label: 'عاجلة', tone: 'danger' as const };
  }

  return { label: 'عادية', tone: 'secondary' as const };
}

function matchesSearch(query: string, values: string[]) {
  const normalizedQuery = query.toLowerCase();

  return values.some((value) => value.toLowerCase().includes(normalizedQuery));
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.base,
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: 16,
    paddingTop: spacing.lg,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    justifyContent: 'space-between',
    minHeight: 54,
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
  headerCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  searchCard: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    color: colors.text.primary,
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    minHeight: 42,
    padding: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  newRequestButton: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.32)',
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  filters: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingLeft: spacing.lg,
  },
  filterChip: {
    alignItems: 'center',
    borderRadius: radii.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: spacing.md,
  },
  filterSelected: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.46)',
  },
  filterUnselected: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
  },
  list: {
    gap: spacing.md,
  },
  requestCard: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  unreadCard: {
    borderColor: 'rgba(79,138,91,0.34)',
  },
  cardTop: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  statusAndReference: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
    minWidth: 0,
  },
  statusPill: {
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  statusSuccess: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.36)',
  },
  statusWarning: {
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.34)',
  },
  statusMuted: {
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
  },
  reference: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  unreadBadge: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderRadius: radii.pill,
    flexDirection: 'row-reverse',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  unreadDot: {
    backgroundColor: colors.semantic.success,
    borderRadius: radii.pill,
    height: 7,
    width: 7,
  },
  cardBody: {
    gap: spacing.sm,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metaDot: {
    backgroundColor: colors.surface.border,
    borderRadius: radii.pill,
    height: 4,
    width: 4,
  },
  updateBlock: {
    backgroundColor: colors.surface.muted,
    borderRadius: radii.control,
    gap: spacing.xs,
    padding: spacing.md,
  },
  lastUpdate: {
    lineHeight: 21,
  },
  expandedBlock: {
    borderTopColor: colors.surface.border,
    borderTopWidth: 1,
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  expandedGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  detailMeta: {
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    flexBasis: '48%',
    flexGrow: 1,
    gap: spacing.xs,
    minWidth: 140,
    padding: spacing.md,
  },
  ltrValue: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  timeline: {
    gap: spacing.sm,
  },
  timelineItem: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  timelineDot: {
    backgroundColor: colors.text.tertiary,
    borderRadius: radii.pill,
    height: 8,
    width: 8,
  },
  timelineDotActive: {
    backgroundColor: colors.semantic.success,
  },
  emptyCard: {
    alignItems: 'center',
    gap: spacing.lg,
    justifyContent: 'center',
    minHeight: 320,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  emptyCopy: {
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
});
