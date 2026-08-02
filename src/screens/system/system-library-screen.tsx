import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ConfirmationDialog,
  EmptyState,
  EmptyStateIcon,
  ErrorState,
  FullScreenLoader,
  ProgressButton,
  ReportGenerationLoader,
  SkeletonCard,
  SuccessState,
  type ConfirmationDialogProps,
} from '@/components/system';
import { AppButton, AppText, SolidCard } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

type LibraryKind = 'confirmations' | 'success' | 'empty' | 'error' | 'loading';

const confirmationExamples: Pick<
  ConfirmationDialogProps,
  'title' | 'description' | 'confirmLabel' | 'cancelLabel' | 'tone'
>[] = [
  {
    title: 'لديك تغييرات غير محفوظة',
    description: 'هل تريد المتابعة دون حفظ التعديلات؟',
    confirmLabel: 'متابعة التعديل',
    cancelLabel: 'تجاهل التغييرات',
    tone: 'warning',
  },
  {
    title: 'تسجيل الخروج؟',
    description: 'ستحتاج لتسجيل الدخول مرة أخرى للمتابعة.',
    confirmLabel: 'تسجيل الخروج',
    cancelLabel: 'إلغاء',
    tone: 'danger',
  },
  {
    title: 'إنهاء هذه الجلسة؟',
    description: 'سيتم تسجيل خروج هذا الجهاز فورًا.',
    confirmLabel: 'إنهاء الجلسة',
    cancelLabel: 'إلغاء',
    tone: 'danger',
  },
  {
    title: 'إلغاء الثقة بهذا الجهاز؟',
    description: 'لن يتمكن هذا الجهاز من الدخول دون تحقق إضافي.',
    confirmLabel: 'إزالة الثقة',
    cancelLabel: 'إلغاء',
    tone: 'danger',
  },
  {
    title: 'تعطيل البصمة؟',
    description: 'ستحتاج كلمة المرور أو PIN لتسجيل الدخول لاحقًا.',
    confirmLabel: 'تعطيل',
    cancelLabel: 'إلغاء',
    tone: 'danger',
  },
  {
    title: 'إزالة وسيلة الدفع؟',
    description: 'هذه وسيلة الدفع الوحيدة، وقد يتوقف تجديد اشتراكك.',
    confirmLabel: 'إزالة',
    cancelLabel: 'إلغاء',
    tone: 'danger',
  },
  {
    title: 'تغيير عملة النشاط؟',
    description: 'سيؤثر هذا على عرض الأرقام والتقارير المستقبلية فقط.',
    confirmLabel: 'تأكيد التغيير',
    cancelLabel: 'إلغاء',
    tone: 'warning',
  },
  {
    title: 'استعادة الصفحة الرئيسية الافتراضية؟',
    description: 'سيتم فقدان ترتيبك وتفضيلاتك الحالية.',
    confirmLabel: 'استعادة',
    cancelLabel: 'إلغاء',
    tone: 'neutral',
  },
];

const successExamples = [
  ['تم تحديث ملفك الشخصي', 'التغييرات ظاهرة الآن في حسابك.'],
  ['تم تغيير كلمة المرور', 'استخدم كلمة المرور الجديدة في المرة القادمة.'],
  ['تم تحديث رمز PIN', 'استخدمه في المرة القادمة لفتح التطبيق.'],
  ['تم تفعيل البصمة', 'يمكنك الآن تسجيل الدخول باستخدام بصمتك.'],
  ['تمت ترقية اشتراكك إلى Elite', 'استمتع بميزات الذكاء المالي المتقدمة.'],
  ['تم إرسال طلب الدعم', 'رقم المرجع: CAP-SUP-1049 · سنرد قريبًا'],
  ['تم حفظ الإعدادات', 'تم تطبيق تفضيلاتك الجديدة.'],
  ['تم إرسال طلب نسخة البيانات', 'سنرسل رابط التحميل خلال 48 ساعة.'],
] as const;

const emptyExamples = [
  ['لا توجد حسابات بعد', 'ابدأ بإضافة أول دخل أو مصروف.', 'wallet-outline'],
  ['لا توجد تقارير بعد', 'سيظهر تقريرك الأول بعد أسبوع من البيانات.', 'document-text-outline'],
  ['لا توجد رؤى بعد', 'أضف المزيد من البيانات ليبدأ التحليل.', 'sparkles-outline'],
  ['لا توجد إشعارات', 'ستظهر هنا التنبيهات المهمة.', 'notifications-outline'],
  ['لا توجد فواتير بعد', undefined, 'receipt-outline'],
  ['لا توجد نتائج بحث', 'جرّب كلمات مختلفة.', 'search-outline'],
] as const;

const errorExamples = [
  ['حدث خطأ غير متوقع', 'حاول مرة أخرى، أو تواصل مع الدعم إن تكرر الخطأ.', 'danger'],
  ['تعذر حفظ التغييرات', 'لم نتمكن من حفظ بياناتك. القيم التي أدخلتها محفوظة محليًا.', 'warning'],
  ['تعذر إنشاء التقرير', 'حاول مرة أخرى خلال دقائق قليلة.', 'danger'],
  ['فشلت عملية الدفع', 'تحقق من وسيلة الدفع وحاول مجددًا.', 'danger'],
  ['فشل تسجيل الدخول', 'تحقق من كلمة المرور وحاول مرة أخرى.', 'danger'],
  ['تعذر التحقق بالبصمة', 'استخدم رمز PIN أو جرّب مرة أخرى.', 'warning'],
  ['فشل رفع المرفق', 'تحقق من حجم الملف وحاول مجددًا.', 'danger'],
  ['تعذر إرسال الطلب', 'تحقق من اتصالك بالإنترنت وحاول مرة أخرى.', 'warning'],
] as const;

export function SystemLibraryScreen({ kind }: { kind: LibraryKind }) {
  const insets = useSafeAreaInsets();
  const [selectedDialog, setSelectedDialog] = useState<(typeof confirmationExamples)[number] | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom + spacing.xl, spacing.screenBottom),
            paddingTop: Math.max(insets.top, spacing.safeTop),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <AppText variant="screenTitle">{getTitle(kind)}</AppText>
        {notice ? (
          <SolidCard>
            <AppText tone="success" variant="supporting">
              {notice}
            </AppText>
          </SolidCard>
        ) : null}
        {kind === 'confirmations' ? (
          <View style={styles.stack}>
            {confirmationExamples.map((example) => (
              <SolidCard key={example.title} style={styles.exampleCard}>
                <View style={styles.exampleCopy}>
                  <AppText variant="cardTitle">{example.title}</AppText>
                  <AppText tone="secondary" variant="supporting">
                    {example.description}
                  </AppText>
                </View>
                <AppButton onPress={() => setSelectedDialog(example)} variant="secondary">
                  عرض الحوار
                </AppButton>
              </SolidCard>
            ))}
          </View>
        ) : null}
        {kind === 'success' ? (
          <View style={styles.stack}>
            {successExamples.map(([title, description]) => (
              <SolidCard key={title}>
                <SuccessState description={description} title={title} />
              </SolidCard>
            ))}
          </View>
        ) : null}
        {kind === 'empty' ? (
          <View style={styles.stack}>
            {emptyExamples.map(([title, description, iconName]) => (
              <EmptyState
                description={description}
                icon={<EmptyStateIcon name={iconName} />}
                key={title}
                title={title}
              />
            ))}
          </View>
        ) : null}
        {kind === 'error' ? (
          <View style={styles.stack}>
            {errorExamples.map(([title, description, tone], index) => (
              <ErrorState
                actionLabel={index === 0 ? 'إعادة المحاولة' : undefined}
                description={description}
                key={title}
                onRetry={() => setNotice('تم تشغيل إجراء محلي آمن.')}
                onSecondaryAction={() => setNotice('تم فتح مسار دعم وهمي داخل المكتبة.')}
                secondaryActionLabel={index === 0 ? 'التواصل مع الدعم' : undefined}
                title={title}
                tone={tone}
              />
            ))}
          </View>
        ) : null}
        {kind === 'loading' ? (
          <View style={styles.stack}>
            <SectionLabel title="تحميل كامل للتطبيق" />
            <FullScreenLoader />
            <SectionLabel title="هيكل عظمي — الرئيسية / السجل / التقارير" />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SectionLabel title="زر قيد التحميل" />
            <ProgressButton label="جاري الحفظ" />
            <SectionLabel title="توليد تقرير / تدقيق" />
            <ReportGenerationLoader />
          </View>
        ) : null}
      </ScrollView>
      {selectedDialog ? (
        <ConfirmationDialog
          cancelLabel={selectedDialog.cancelLabel}
          confirmLabel={selectedDialog.confirmLabel}
          description={selectedDialog.description}
          onCancel={() => setSelectedDialog(null)}
          onConfirm={() => {
            setSelectedDialog(null);
            setNotice('تم تنفيذ إجراء محلي آمن داخل مكتبة العرض.');
          }}
          title={selectedDialog.title}
          tone={selectedDialog.tone}
          visible
        />
      ) : null}
    </View>
  );
}

function SectionLabel({ title }: { title: string }) {
  return (
    <View style={styles.sectionLabel}>
      <Ionicons color={colors.brand.calmGreen} name="ellipse" size={9} />
      <AppText variant="sectionTitle">{title}</AppText>
    </View>
  );
}

function getTitle(kind: LibraryKind) {
  if (kind === 'confirmations') {
    return 'مكتبة حوارات التأكيد';
  }

  if (kind === 'success') {
    return 'مكتبة حالات النجاح';
  }

  if (kind === 'empty') {
    return 'مكتبة الحالات الفارغة';
  }

  if (kind === 'error') {
    return 'مكتبة حالات الخطأ';
  }

  return 'مكتبة حالات التحميل';
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
  stack: {
    gap: spacing.md,
  },
  exampleCard: {
    gap: spacing.md,
  },
  exampleCopy: {
    gap: spacing.xs,
  },
  sectionLabel: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
});
