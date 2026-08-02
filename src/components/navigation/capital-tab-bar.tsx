import { router, type Href } from 'expo-router';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { CapitalTabBarActiveSurface } from './capital-tab-bar-active-surface';
import { CapitalTabIcon } from './capital-tab-icon';
import {
  CapitalTabBarContainer,
  CapitalTabBarSurface,
} from './capital-tab-bar-surface';
import { LiquidGlassBubble } from './liquid-glass-bubble';
import {
  getBubbleRightForVisualIndex,
  getCapitalTabBarWidth,
  getFloatingTabBarReservedHeight,
  getNavigationBottomOffset,
  getTabSlotWidth,
  navigationMetrics,
} from './navigation-metrics';
import { capitalTabs, getCapitalTabByRouteName } from './tab-config';

type CapitalTabBarProps = {
  state: {
    index: number;
    routes: readonly {
      key?: string;
      name: string;
    }[];
    history?: readonly {
      key: string;
    }[];
  };
};

const iosSpring = {
  damping: 23,
  mass: 0.9,
  stiffness: 250,
} as const;

export function CapitalTabBar({ state }: CapitalTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const barWidth = getCapitalTabBarWidth(windowWidth);
  const tabCount = capitalTabs.length;
  const activeRouteName = state.routes[state.index]?.name ?? 'index';
  const visibleActiveTab = capitalTabs.find((tab) => tab.routeName === activeRouteName);
  const activeTab = visibleActiveTab ?? getLastVisibleTabFromState(state);
  const [tabLayouts, setTabLayouts] = useState<Record<string, TabLayout>>({});
  const [iosIndicatorReady, setIosIndicatorReady] = useState(false);
  const activeTabLayout = tabLayouts[activeTab.routeName];
  const iosTargetX = activeTabLayout
    ? activeTabLayout.x + (activeTabLayout.width - navigationMetrics.bubbleWidth) / 2
    : null;
  const targetRight = getBubbleRightForVisualIndex(barWidth, tabCount, activeTab.visualRtlIndex);
  const bubbleRight = useSharedValue(targetRight);
  const bubbleX = useSharedValue(0);
  const activeStretch = useSharedValue(1);
  const contentOpacity = useSharedValue(1);
  const hasPositionedIosBubble = useRef(false);
  const previousIosRouteName = useRef(activeTab.routeName);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      if (iosTargetX === null) {
        return;
      }

      if (!hasPositionedIosBubble.current) {
        bubbleX.value = iosTargetX;
        activeStretch.value = 1;
        hasPositionedIosBubble.current = true;
        previousIosRouteName.current = activeTab.routeName;
        setIosIndicatorReady(true);
      } else {
        const routeChanged = previousIosRouteName.current !== activeTab.routeName;

        bubbleX.value = reducedMotion
          ? withTiming(iosTargetX, { duration: navigationMetrics.reducedMotionDuration })
          : withSpring(iosTargetX, iosSpring);

        if (routeChanged && !reducedMotion) {
          activeStretch.value = withSequence(
            withTiming(1.1, { duration: 90 }),
            withSpring(1, iosSpring),
          );
        } else {
          activeStretch.value = 1;
        }

        previousIosRouteName.current = activeTab.routeName;
      }
    } else {
      bubbleRight.value = reducedMotion
        ? withTiming(targetRight, { duration: navigationMetrics.reducedMotionDuration })
        : withSpring(targetRight, navigationMetrics.spring);

      contentOpacity.value = 0;
      contentOpacity.value = withTiming(1, { duration: navigationMetrics.contentFadeDuration });
    }
  }, [
    activeStretch,
    activeTab.routeName,
    bubbleRight,
    bubbleX,
    contentOpacity,
    iosTargetX,
    reducedMotion,
    targetRight,
  ]);

  const androidBubbleStyle = useAnimatedStyle(() => ({
    right: bubbleRight.value,
  }));

  const iosBubbleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: bubbleX.value },
      { scaleX: activeStretch.value },
    ],
  }));

  const bubbleContentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const bottomOffset = getNavigationBottomOffset(insets.bottom);
  const reservedHeight = getFloatingTabBarReservedHeight(insets.bottom);
  const slotWidth = getTabSlotWidth(barWidth, tabCount);

  const tabsByVisualOrder = useMemo(
    () => [...capitalTabs].sort((first, second) => first.visualRtlIndex - second.visualRtlIndex),
    [],
  );
  function handleTabLayout(routeName: string, event: LayoutChangeEvent) {
    const { x, width } = event.nativeEvent.layout;

    setTabLayouts((current) => {
      const previous = current[routeName];

      if (previous?.x === x && previous.width === width) {
        return current;
      }

      return {
        ...current,
        [routeName]: { x, width },
      };
    });
  }

  const tabBarContent = (
    <>
      <CapitalTabBarSurface />

      <View style={styles.tabsRow}>
        {tabsByVisualOrder.map((tab) => {
          const focused = activeTab.routeName === tab.routeName;

          return (
            <Pressable
              accessibilityLabel={tab.accessibilityLabel}
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              key={tab.routeName}
              onLayout={
                Platform.OS === 'ios'
                  ? (event) => handleTabLayout(tab.routeName, event)
                  : undefined
              }
              onPress={() => {
                if (!focused) {
                  router.navigate(tab.href as Href);
                }
              }}
              style={[styles.tabPressable, { width: slotWidth }]}
            >
              <View
                style={
                  Platform.OS === 'ios' && focused && iosIndicatorReady
                    ? styles.hiddenActiveTab
                    : undefined
                }
              >
                <CapitalTabIcon active={focused} tab={tab} />
              </View>
            </Pressable>
          );
        })}

        {Platform.OS === 'ios' && activeTabLayout && iosIndicatorReady ? (
          <View pointerEvents="none" style={styles.iosIndicatorLayer}>
            <Animated.View style={[styles.bubble, styles.iosBubble, iosBubbleStyle]}>
              <CapitalTabBarActiveSurface />
              <Animated.View style={styles.iosActiveContent}>
                <CapitalTabIcon
                  active
                  activeColor={colors.brand.calmGreen}
                  labelStyle={styles.iosActiveLabel}
                  showLabel
                  tab={activeTab}
                />
              </Animated.View>
            </Animated.View>
          </View>
        ) : null}
      </View>

      {Platform.OS !== 'ios' ? (
        <Animated.View style={[styles.bubble, androidBubbleStyle]}>
          <LiquidGlassBubble>
            <Animated.View style={bubbleContentStyle}>
              <CapitalTabIcon active showLabel tab={activeTab} />
            </Animated.View>
          </LiquidGlassBubble>
        </Animated.View>
      ) : null}
    </>
  );

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { height: reservedHeight }]}>
      <View pointerEvents="box-none" style={[styles.overlay, { bottom: bottomOffset }]}>
        <View pointerEvents="auto" style={[styles.bar, { width: barWidth }]}>
          {Platform.OS === 'ios' ? (
            <CapitalTabBarContainer
              pointerEvents="box-none"
              style={styles.glassContainer}
            >
              {tabBarContent}
            </CapitalTabBarContainer>
          ) : (
            tabBarContent
          )}
        </View>
      </View>
    </View>
  );
}

export const MemoizedCapitalTabBar = memo(CapitalTabBar);

type TabLayout = {
  x: number;
  width: number;
};

function getLastVisibleTabFromState(state: CapitalTabBarProps['state']) {
  const history = state.history ?? [];

  for (let index = history.length - 1; index >= 0; index -= 1) {
    const route = state.routes.find((item) => item.key === history[index]?.key);

    if (route && capitalTabs.some((tab) => tab.routeName === route.name)) {
      return getCapitalTabByRouteName(route.name);
    }
  }

  return getCapitalTabByRouteName('index');
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'transparent',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    left: 0,
    paddingHorizontal: navigationMetrics.horizontalInset,
    position: 'absolute',
    right: 0,
    zIndex: 30,
  },
  bar: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: navigationMetrics.barRadius,
    borderWidth: 1,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10), 0 16px 34px rgba(0,0,0,0.50)',
    height: navigationMetrics.barHeight,
    overflow: 'visible',
    paddingHorizontal: navigationMetrics.barHorizontalPadding,
  },
  glassContainer: {
    height: '100%',
    overflow: 'visible',
    position: 'relative',
    width: '100%',
  },
  tabsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    height: '100%',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
  },
  iosIndicatorLayer: {
    alignItems: 'flex-start',
    bottom: 0,
    direction: 'ltr',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 2,
  },
  iosBubble: {
    position: 'relative',
  },
  iosActiveContent: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
    zIndex: 1,
  },
  iosActiveLabel: {
    fontWeight: '600',
  },
  hiddenActiveTab: {
    opacity: 0,
  },
  tabPressable: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    minWidth: navigationMetrics.minTapTarget,
    paddingVertical: spacing.xs,
  },
  bubble: {
    height: navigationMetrics.bubbleHeight,
    pointerEvents: 'none',
    position: 'absolute',
    top: navigationMetrics.bubbleTopOffset,
    width: navigationMetrics.bubbleWidth,
    zIndex: 2,
  },
});
