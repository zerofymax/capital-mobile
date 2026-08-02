import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

type AskCapitalButtonProps = {
  onPress: () => void;
};

export function AskCapitalButton({ onPress }: AskCapitalButtonProps) {
  return (
    <Pressable
      accessibilityLabel="اسأل Capital عن أرقامك"
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.root, pressed && styles.pressed]}
    >
      <BlurView intensity={18} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.03)']}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <Ionicons color={colors.brand.green} name="sparkles-outline" size={17} />
        <AppText align="center" variant="body">
          اسأل Capital عن أرقامك
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    borderColor: 'rgba(167,200,161,0.28)',
    borderRadius: 18,
    borderWidth: 1,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.14), 0 10px 22px rgba(0,0,0,0.35)',
    height: 52,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});
