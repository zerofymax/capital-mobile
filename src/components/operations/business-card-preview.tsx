import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { AppText, GlassSurface } from '@/components/ui';
import type { BusinessCardItem, BusinessCardStatus } from '@/screens/operations/operations-data';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { CardStatusBadge } from './card-status-badge';

type BusinessCardPreviewProps = {
  card: BusinessCardItem;
  status?: BusinessCardStatus;
  statusLabel?: string;
  compact?: boolean;
};

export function BusinessCardPreview({ card, status = card.status, statusLabel = card.statusLabel, compact = false }: BusinessCardPreviewProps) {
  return (
    <GlassSurface radius={24}>
      <View style={[styles.root, compact && styles.compactRoot]}>
        <LinearGradient
          colors={['rgba(79,138,91,0.18)', 'rgba(255,255,255,0.045)', 'rgba(0,0,0,0.12)']}
          end={{ x: 0.2, y: 1 }}
          start={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.softGlow} />
        <View style={styles.topRow}>
          <View style={styles.brand}>
            <Ionicons color={colors.brand.green} name="card-outline" size={20} />
            <AppText variant="cardTitle">{card.brand}</AppText>
          </View>
          <CardStatusBadge label={statusLabel} status={status} />
        </View>
        <AppText align="left" style={styles.number} variant={compact ? 'sectionTitle' : 'numericValue'}>
          {card.numberMask}
        </AppText>
        <View style={styles.bottomRow}>
          <View style={styles.meta}>
            <AppText tone="secondary" variant="caption">
              حامل البطاقة
            </AppText>
            <AppText variant="body">{card.holderName}</AppText>
          </View>
          <View style={styles.meta}>
            <AppText align="left" tone="secondary" variant="caption">
              النوع
            </AppText>
            <AppText align="left" variant="body">
              {card.typeLabel}
            </AppText>
          </View>
        </View>
        {!compact ? (
          <View style={styles.metrics}>
            <Metric label="مصروف الشهر" value={card.spent} />
            <Metric label="الحد" value={card.limit} />
          </View>
        ) : null}
      </View>
    </GlassSurface>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <AppText tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText align="left" style={styles.metricValue} variant="body">
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.xl,
    minHeight: 210,
    overflow: 'hidden',
    padding: spacing.lg,
    position: 'relative',
  },
  compactRoot: {
    minHeight: 168,
  },
  softGlow: {
    backgroundColor: 'rgba(79,138,91,0.08)',
    borderRadius: 80,
    height: 96,
    left: -24,
    position: 'absolute',
    top: -18,
    width: 138,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  brand: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  number: {
    fontVariant: ['tabular-nums'],
    letterSpacing: 0,
    writingDirection: 'ltr',
  },
  bottomRow: {
    flexDirection: 'row-reverse',
    gap: spacing.lg,
    justifyContent: 'space-between',
  },
  meta: {
    gap: spacing.xs,
  },
  metrics: {
    borderTopColor: colors.surface.separator,
    borderTopWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  metric: {
    flex: 1,
    gap: spacing.xs,
  },
  metricValue: {
    fontVariant: ['tabular-nums'],
    writingDirection: 'ltr',
  },
});
