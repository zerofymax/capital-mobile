import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BusinessCardPreview, CardStatusBadge } from '@/components/operations';
import { AppButton, AppText } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import {
  defaultBusinessCard,
  prototypeBusinessCards,
  type BusinessCardItem,
} from './operations-data';

export function CardsScreen() {
  const insets = useSafeAreaInsets();

  function handleCardPress(card: BusinessCardItem) {
    router.push({
      pathname: routes.cardDetail,
      params: { cardId: card.id },
    });
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
            paddingTop: Math.max(insets.top, spacing.safeTop),
          },
        ]}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <ModalHeader onClose={() => router.back()} title="البطاقات" />
        <View style={styles.intro}>
          <AppText tone="secondary" variant="body">
            إدارة بطاقات نشاطك وحدود الصرف
          </AppText>
        </View>

        <BusinessCardPreview card={defaultBusinessCard} />

        <View style={styles.section}>
          <AppText variant="sectionTitle">بطاقات النشاط</AppText>
          {prototypeBusinessCards.map((card) => (
            <CardListItem card={card} key={card.id} onPress={handleCardPress} />
          ))}
        </View>

        <AppButton iconName="add-circle-outline" onPress={() => router.push(routes.requestCard)}>
          طلب بطاقة جديدة
        </AppButton>
      </ScrollView>
    </View>
  );
}

function CardListItem({ card, onPress }: { card: BusinessCardItem; onPress: (card: BusinessCardItem) => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        Haptics.selectionAsync().catch(() => null);
        onPress(card);
      }}
      style={({ pressed }) => [styles.cardRow, pressed && styles.pressed]}
    >
      <View style={styles.cardIcon}>
        <Ionicons color={colors.text.muted} name="card-outline" size={20} />
      </View>
      <View style={styles.cardCopy}>
        <View style={styles.cardTitleRow}>
          <AppText numberOfLines={1} style={styles.cardTitle} variant="cardTitle">
            {card.title}
          </AppText>
          <CardStatusBadge label={card.statusLabel} status={card.status} />
        </View>
        <View style={styles.cardMetaRow}>
          <AppText align="left" style={styles.ltrText} tone="secondary" variant="caption">
            {card.numberMask}
          </AppText>
          <AppText tone="secondary" variant="caption">
            {card.typeLabel}
          </AppText>
        </View>
        <View style={styles.cardMetaRow}>
          <AppText align="left" style={styles.ltrText} tone="secondary" variant="caption">
            المصروف: {card.spent}
          </AppText>
          <AppText align="left" style={styles.ltrText} tone="secondary" variant="caption">
            الحد: {card.limit}
          </AppText>
        </View>
      </View>
      <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={18} />
    </Pressable>
  );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="إغلاق"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onClose}
        style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text.muted} name="close-outline" size={22} />
      </Pressable>
      <AppText align="center" numberOfLines={1} style={styles.headerTitle} variant="screenTitle">
        {title}
      </AppText>
      <View style={styles.headerSlot} />
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
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    minHeight: 42,
  },
  closeButton: {
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
    flex: 1,
  },
  headerSlot: {
    height: 40,
    width: 40,
  },
  intro: {
    marginTop: -spacing.sm,
  },
  section: {
    gap: spacing.md,
  },
  cardRow: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 102,
    padding: spacing.lg,
  },
  cardIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderRadius: radii.control,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  cardCopy: {
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  cardTitleRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  cardTitle: {
    flex: 1,
  },
  cardMetaRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  ltrText: {
    fontVariant: ['tabular-nums'],
    writingDirection: 'ltr',
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});
