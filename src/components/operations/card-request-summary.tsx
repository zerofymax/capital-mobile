import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText, GlassSurface } from '@/components/ui';
import type { CardRequestSuccessData } from '@/screens/operations/operations-data';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type CardRequestSummaryProps = {
  data: CardRequestSuccessData;
};

export function CardRequestSummary({ data }: CardRequestSummaryProps) {
  return (
    <GlassSurface>
      <View style={styles.root}>
        <View style={styles.successIcon}>
          <Ionicons color={colors.brand.green} name="checkmark" size={32} />
        </View>
        <AppText align="center" variant="sectionTitle">
          تم إنشاء طلب بطاقة تجريبي بنجاح
        </AppText>
        <View style={styles.details}>
          <SummaryLine label="نوع البطاقة" value={data.cardType} />
          <SummaryLine label="الاستخدام" value={data.purpose} />
          <SummaryLine label="الحد الشهري" ltr value={data.monthlyLimit} />
          <SummaryLine label="المرجع" ltr value={data.reference} />
        </View>
      </View>
    </GlassSurface>
  );
}

function SummaryLine({ label, value, ltr = false }: { label: string; value: string; ltr?: boolean }) {
  return (
    <View style={styles.line}>
      <AppText tone="secondary" variant="supporting">
        {label}
      </AppText>
      <AppText align={ltr ? 'left' : 'right'} style={ltr ? styles.ltrValue : styles.value} variant="body">
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  successIcon: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.30)',
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  details: {
    alignSelf: 'stretch',
    gap: spacing.md,
  },
  line: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.lg,
    justifyContent: 'space-between',
  },
  value: {
    flex: 1,
  },
  ltrValue: {
    flex: 1,
    fontVariant: ['tabular-nums'],
    writingDirection: 'ltr',
  },
});
