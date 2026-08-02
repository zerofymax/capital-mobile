import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type CapitalReportSummaryProps = {
  text: string;
};

export function CapitalReportSummary({ text }: CapitalReportSummaryProps) {
  return (
    <View style={styles.root}>
      <View style={styles.blurFallback} />
      <BlurView intensity={24} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(24,58,46,0.40)', 'rgba(14,20,28,0.80)']}
        end={{ x: 0.9, y: 1 }}
        start={{ x: 0.1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <View style={styles.identity}>
          <View style={styles.icon}>
            <Ionicons color={colors.text.primary} name="sparkles-outline" size={16} />
          </View>
          <AppText style={styles.label} variant="caption">
            ملخص Capital
          </AppText>
        </View>
        <AppText style={styles.summaryText} variant="body">
          {text}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderColor: 'rgba(167,200,161,0.25)',
    borderRadius: 24,
    borderWidth: 1,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10), 0 14px 28px rgba(0,0,0,0.36)',
    overflow: 'hidden',
    position: 'relative',
  },
  blurFallback: {
    backgroundColor: colors.glass.fillDeep,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  content: {
    gap: spacing.md,
    padding: spacing.xl,
    position: 'relative',
    zIndex: 1,
  },
  identity: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: 9,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.18)',
    borderColor: 'rgba(167,200,161,0.34)',
    borderRadius: radii.small,
    borderWidth: 1,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  label: {
    color: colors.brand.link,
    fontWeight: '700',
  },
  summaryText: {
    color: '#E7E9EC',
    lineHeight: 25,
  },
});
