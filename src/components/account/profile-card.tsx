import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import type { AccountProfile } from '@/screens/account/account-data';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';

type ProfileCardProps = {
  profile: AccountProfile;
  onEditPress: () => void;
};

export function ProfileCard({ profile, onEditPress }: ProfileCardProps) {
  return (
    <View style={styles.root}>
      <View style={styles.planBadge}>
        <AppText align="center" style={styles.planBadgeText} variant="caption">
          Capital Pro
        </AppText>
      </View>
      <Pressable
        accessibilityLabel="تعديل الملف الشخصي"
        accessibilityRole="button"
        onPress={onEditPress}
        style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
      >
        <Ionicons color={colors.brand.calmGreen} name="create-outline" size={18} />
      </Pressable>
      <View style={styles.identity}>
        <View style={styles.profileCopy}>
          <AppText style={styles.name} variant="sectionTitle">
            {profile.name}
          </AppText>
          {profile.role ? (
            <AppText style={styles.roleLine} tone="secondary" variant="supporting">
              {profile.role}
            </AppText>
          ) : null}
          <AppText style={styles.businessLine} tone="secondary" variant="body">
            {directionSafeText(profile.businessName)}
          </AppText>
        </View>
        <View
          style={[
            styles.avatar,
            profile.avatarColor ? { backgroundColor: profile.avatarColor } : null,
            profile.avatarBorderColor ? { borderColor: profile.avatarBorderColor } : null,
          ]}
        >
          {profile.avatarType === 'icon' ? (
            <Ionicons color={colors.brand.lightNeutral} name="person-outline" size={27} />
          ) : (
            <AppText align="center" style={styles.avatarText} variant="screenTitle">
              {profile.initials}
            </AppText>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    backgroundColor: colors.glass.fillDeep,
    borderColor: 'rgba(167,200,161,0.22)',
    borderRadius: 28,
    borderWidth: 1,
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.lg,
    minHeight: 115,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  identity: {
    alignItems: 'center',
    direction: 'ltr',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.lg,
    minWidth: 0,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: 'rgba(31,90,58,0.28)',
    borderColor: 'rgba(167,200,161,0.32)',
    borderRadius: radii.pill,
    borderWidth: 1,
    flexShrink: 0,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  avatarText: {
    color: colors.brand.lightNeutral,
    fontSize: 22,
    lineHeight: 34,
  },
  profileCopy: {
    alignItems: 'flex-end',
    direction: 'ltr',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  name: {
    alignSelf: 'stretch',
    color: colors.text.primary,
    fontSize: 18,
    lineHeight: 30,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  planBadge: {
    backgroundColor: 'rgba(167,200,161,0.10)',
    borderColor: 'rgba(167,200,161,0.20)',
    borderRadius: radii.pill,
    borderWidth: 1,
    flexShrink: 0,
    left: spacing.xl,
    paddingHorizontal: 7,
    paddingVertical: 1,
    position: 'absolute',
    top: spacing.md,
    zIndex: 1,
  },
  planBadgeText: {
    color: colors.brand.calmGreen,
    fontSize: 11.5,
    lineHeight: 18,
    writingDirection: 'ltr',
  },
  roleLine: {
    alignSelf: 'stretch',
    color: colors.text.muted,
    fontSize: 12.5,
    lineHeight: 20,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  businessLine: {
    alignSelf: 'stretch',
    color: colors.text.secondary,
    fontSize: 12,
    lineHeight: 22,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  editButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: 'rgba(255,255,255,0.09)',
    borderRadius: 16,
    borderWidth: 1,
    flexShrink: 0,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
});
