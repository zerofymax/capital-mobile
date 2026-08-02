import { AppButton } from '@/components/ui';

type OnboardingStepActionsProps = {
  primaryLabel: string;
  onPrimaryPress: () => void;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
  tertiaryLabel?: string;
  onTertiaryPress?: () => void;
  primaryIconName?: Parameters<typeof AppButton>[0]['iconName'];
  secondaryIconName?: Parameters<typeof AppButton>[0]['iconName'];
  tertiaryIconName?: Parameters<typeof AppButton>[0]['iconName'];
};

export function OnboardingStepActions({
  primaryLabel,
  onPrimaryPress,
  secondaryLabel,
  onSecondaryPress,
  tertiaryLabel,
  onTertiaryPress,
  primaryIconName = 'arrow-forward-outline',
  secondaryIconName = 'arrow-back-outline',
  tertiaryIconName = 'arrow-back-outline',
}: OnboardingStepActionsProps) {
  return (
    <>
      <AppButton iconName={primaryIconName} onPress={onPrimaryPress}>
        {primaryLabel}
      </AppButton>
      {secondaryLabel && onSecondaryPress ? (
        <AppButton iconName={secondaryIconName} onPress={onSecondaryPress} variant="secondary">
          {secondaryLabel}
        </AppButton>
      ) : null}
      {tertiaryLabel && onTertiaryPress ? (
        <AppButton iconName={tertiaryIconName} onPress={onTertiaryPress} variant="ghost">
          {tertiaryLabel}
        </AppButton>
      ) : null}
    </>
  );
}
