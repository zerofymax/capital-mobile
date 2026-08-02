import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { FAQRow, SupportActionCard, SupportModalHeader } from '@/components/support';
import { AppButton, AppText, Divider, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { getHelpTopic, type FAQItem, type SupportActionRow } from './support-data';

export function HelpTopicScreen() {
  const insets = useSafeAreaInsets();
  const { topicId } = useLocalSearchParams<{ topicId?: string }>();
  const topic = getHelpTopic(topicId);
  const actions = topic?.actions ?? [];
  const [expandedFaqIds, setExpandedFaqIds] = useState<Record<string, boolean>>({});

  function toggleFaq(item: FAQItem) {
    setExpandedFaqIds((current) => ({ ...current, [item.id]: !current[item.id] }));
  }

  function handleRelatedAction(action: SupportActionRow) {
    if (action.id === 'ledger') {
      router.replace(routes.ledger);
      return;
    }

    if (action.id === 'bills') {
      router.push(routes.bills);
      return;
    }

    if (action.id === 'transfers') {
      router.push(routes.transfers);
      return;
    }

    if (action.id === 'invoices') {
      router.push(routes.invoices);
      return;
    }

    if (action.id === 'budgets') {
      router.push(routes.budgets);
      return;
    }

    if (action.id === 'reports') {
      router.push(routes.reports);
      return;
    }

    if (action.id === 'financial-reports') {
      router.push(routes.financialReports);
      return;
    }

    if (action.id === 'growth-metrics') {
      router.push(routes.growthMetrics);
      return;
    }

    if (action.id === 'recurring-expenses') {
      router.push(routes.recurringExpenses);
      return;
    }

    if (action.id === 'financial-terms') {
      router.push(routes.financialTerms);
      return;
    }

    if (action.id === 'cards') {
      router.push(routes.cards);
      return;
    }

    if (action.id === 'intelligence') {
      router.push(routes.intelligence);
      return;
    }

    if (action.id === 'business-information') {
      router.push(routes.businessInformation);
      return;
    }

    if (action.id === 'edit-profile') {
      router.push(routes.editProfile);
      return;
    }

    if (action.id === 'security') {
      router.push(routes.security);
      return;
    }

    if (action.id === 'privacy-legal') {
      router.push(routes.privacyLegal);
    }
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
          <SupportModalHeader title="موضوع المساعدة" />

          {topic ? (
            <>
              <SolidCard style={styles.summaryCard}>
                <View style={styles.summaryIcon}>
                  <Ionicons color={colors.brand.green} name={topic.icon} size={22} />
                </View>
                <View style={styles.summaryCopy}>
                  <AppText variant="sectionTitle">{topic.title}</AppText>
                  <AppText tone="secondary" variant="body">
                    {topic.description}
                  </AppText>
                </View>
              </SolidCard>

              <View style={styles.section}>
                <AppText variant="sectionTitle">الأسئلة داخل الموضوع</AppText>
                <SolidCard style={styles.faqCard}>
                  {topic.faqs.map((item, index) => (
                    <FAQRow
                      expanded={!!expandedFaqIds[item.id]}
                      isLast={index === topic.faqs.length - 1}
                      item={item}
                      key={item.id}
                      onPress={toggleFaq}
                    />
                  ))}
                </SolidCard>
              </View>

              {actions.length > 0 ? (
                <View style={styles.section}>
                  <AppText variant="sectionTitle">إجراءات مرتبطة</AppText>
                  <SolidCard style={styles.actionsCard}>
                    {actions.map((action, index) => (
                      <View key={action.id} style={styles.actionBlock}>
                        <SupportActionCard action={action} onPress={handleRelatedAction} />
                        {index < actions.length - 1 ? <Divider /> : null}
                      </View>
                    ))}
                  </SolidCard>
                </View>
              ) : null}
            </>
          ) : (
            <InvalidHelpTopicState />
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function InvalidHelpTopicState() {
  return (
    <SolidCard style={styles.invalidCard}>
      <View style={styles.invalidIcon}>
        <Ionicons color={colors.text.tertiary} name="help-circle-outline" size={28} />
      </View>
      <View style={styles.invalidCopy}>
        <AppText align="center" variant="cardTitle">
          لم نعثر على موضوع المساعدة
        </AppText>
        <AppText align="center" tone="secondary" variant="supporting">
          قد يكون الرابط غير صالح أو لم يعد هذا الموضوع متاحًا.
        </AppText>
      </View>
      <AppButton onPress={() => router.replace(routes.helpCenter)} variant="secondary">
        العودة إلى مركز المساعدة
      </AppButton>
    </SolidCard>
  );
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
  summaryCard: {
    alignItems: 'flex-start',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  summaryIcon: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderRadius: radii.control,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  summaryCopy: {
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  section: {
    gap: spacing.md,
  },
  faqCard: {
    gap: spacing.md,
  },
  actionsCard: {
    gap: spacing.md,
  },
  actionBlock: {
    gap: spacing.md,
  },
  invalidCard: {
    alignItems: 'center',
    gap: spacing.lg,
    justifyContent: 'center',
    minHeight: 340,
  },
  invalidIcon: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  invalidCopy: {
    gap: spacing.sm,
  },
});
