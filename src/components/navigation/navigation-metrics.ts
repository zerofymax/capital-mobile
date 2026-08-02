import { Platform } from 'react-native';

export const navigationMetrics = {
  referenceViewportWidth: 390,
  horizontalInset: 16,
  maxBarWidth: 358,
  minBarWidth: 320,
  barHeight: 64,
  barRadius: 32,
  barHorizontalPadding: 5,
  bubbleWidth: 84,
  bubbleHeight: 60,
  bubbleTopOffset: 1,
  iconSize: 17,
  labelFontSize: 10,
  minTapTarget: 44,
  bottomGap: 18,
  contentClearance: 32,
  nativeTabContentClearance: 24,
  spring: {
    damping: 15,
    stiffness: 220,
    mass: 0.9,
  },
  reducedMotionDuration: 140,
  contentFadeDuration: 120,
} as const;

export function getNavigationBottomOffset(bottomInset: number) {
  return Math.max(bottomInset, navigationMetrics.bottomGap);
}

export function getFloatingTabBarVisualHeight() {
  const visualTop = Math.min(0, navigationMetrics.bubbleTopOffset);
  const visualBottom = Math.max(
    navigationMetrics.barHeight,
    navigationMetrics.bubbleTopOffset + navigationMetrics.bubbleHeight,
  );

  return visualBottom - visualTop;
}

export function getFloatingTabBarReservedHeight(bottomInset: number) {
  return getNavigationBottomOffset(bottomInset) + getFloatingTabBarVisualHeight();
}

export function getTabScreenContentBottomPadding(bottomInset: number) {
  if (Platform.OS === 'ios') {
    return navigationMetrics.nativeTabContentClearance;
  }

  return getFloatingTabBarReservedHeight(bottomInset) + navigationMetrics.contentClearance;
}

export const tabScreenContentInsetAdjustmentBehavior =
  Platform.OS === 'ios' ? ('automatic' as const) : ('never' as const);

export function getCapitalTabBarWidth(windowWidth: number) {
  const availableWidth = windowWidth - navigationMetrics.horizontalInset * 2;
  return Math.max(
    navigationMetrics.minBarWidth,
    Math.min(navigationMetrics.maxBarWidth, availableWidth),
  );
}

export function getTabSlotWidth(barWidth: number, tabCount: number) {
  return (barWidth - navigationMetrics.barHorizontalPadding * 2) / tabCount;
}

export function getBubbleRightForVisualIndex(barWidth: number, tabCount: number, visualRtlIndex: number) {
  const slotWidth = getTabSlotWidth(barWidth, tabCount);
  const slotCenterFromRight = navigationMetrics.barHorizontalPadding + slotWidth * visualRtlIndex + slotWidth / 2;

  return slotCenterFromRight - navigationMetrics.bubbleWidth / 2;
}
