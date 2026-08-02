import { Ionicons } from '@expo/vector-icons';
import { Modal, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CapitalBottomSheetHeaderSurface } from '@/components/navigation/capital-bottom-sheet-header-surface';
import { CapitalGlassIconButton } from '@/components/navigation/capital-glass-icon-button';
import { AppButton, AppText, SolidCard } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { directionSafeText } from '@/utils/rtl';
import { formatSar, getInvoiceSummary, invoiceToneColors, type InvoiceStatus, type InvoiceTone } from './invoice-utils';
import { invoiceStatusOptions, type Invoice, type InvoiceItem, type InvoiceStatusId } from './invoices-data';

export function InvoiceHeader({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack: () => void }) {
  return (
    <View style={styles.header}>
      <CapitalGlassIconButton
        accessibilityLabel="رجوع"
        hitSlop={8}
        iconColor={colors.text.muted}
        iconName="chevron-forward-outline"
        iconSize={21}
        onPress={onBack}
        pressedStyle={styles.pressed}
        radius={radii.control}
        style={styles.backButton}
      />
      <View style={styles.headerCopy}>
        <AppText align="center" style={styles.headerTitle} variant="screenTitle">
          {title}
        </AppText>
        {subtitle ? (
          <AppText align="center" tone="secondary" variant="supporting">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      <View style={styles.headerSlot} />
    </View>
  );
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const tone = invoiceToneColors[status.tone];

  return (
    <View style={[styles.statusBadge, { backgroundColor: tone.tint, borderColor: tone.border }]}>
      <AppText align="center" style={[styles.statusBadgeText, { color: tone.text }]} variant="caption">
        {status.label}
      </AppText>
    </View>
  );
}

export function InvoiceProgressBar({ progress, tone }: { progress: number; tone: InvoiceTone }) {
  const clamped = Math.max(0, Math.min(progress, 100));

  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { backgroundColor: invoiceToneColors[tone].accent, width: `${clamped}%` }]} />
    </View>
  );
}

export function InvoiceCard({ invoice, onPress }: { invoice: Invoice; onPress: (id: string) => void }) {
  const summary = getInvoiceSummary(invoice);
  const tone = invoiceToneColors[summary.displayStatus.tone];

  return (
    <Pressable
      accessibilityLabel={`${summary.clientName}، ${summary.invoiceNumber}، ${summary.total} ر.س، ${summary.paid} ر.س مدفوع، ${summary.remaining} ر.س متبقي، ${summary.displayStatus.label}`}
      accessibilityRole="button"
      onPress={() => onPress(summary.id)}
      style={({ pressed }) => [styles.invoiceCard, summary.displayStatus.tone === 'danger' && styles.dangerCard, summary.paidInFull && styles.paidCard, pressed && styles.pressed]}
    >
      <View style={styles.invoiceTop}>
        <View style={styles.invoiceIdentity}>
          <View style={[styles.invoiceIcon, { backgroundColor: tone.tint }]}>
            <Ionicons color={tone.accent} name={summary.displayStatus.icon} size={19} />
          </View>
          <View style={styles.invoiceCopy}>
            <AppText variant="cardTitle">{summary.clientName}</AppText>
            <AppText align="left" tone="secondary" variant="caption">
              {directionSafeText(summary.invoiceNumber)}
            </AppText>
          </View>
        </View>
        <InvoiceStatusBadge status={summary.displayStatus} />
        <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={17} />
      </View>

      <View style={styles.amountGrid}>
        <InvoiceMetric label="الإجمالي" value={summary.total} />
        <InvoiceMetric label="المدفوع" tone={summary.paid > 0 ? 'green' : undefined} value={summary.paid} />
        <InvoiceMetric label="المتبقي" tone={summary.displayStatus.tone} value={summary.remaining} />
      </View>

      <InvoiceProgressBar progress={summary.progress} tone={summary.displayStatus.tone} />

      <View style={styles.cardFooter}>
        <AppText align="left" tone="secondary" variant="caption">
          {directionSafeText(`الإصدار: ${summary.issueDate}`)}
        </AppText>
        <AppText style={{ color: tone.text }} variant="caption">
          {summary.dueText}
        </AppText>
      </View>
    </Pressable>
  );
}

export function InvoiceMetric({ label, value, tone }: { label: string; value: number; tone?: InvoiceTone | 'green' }) {
  const color = tone === 'green' ? invoiceToneColors.green.text : tone ? invoiceToneColors[tone].text : colors.text.primary;

  return (
    <View style={styles.metric}>
      <AppText align="center" tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText align="center" style={[styles.metricValue, { color }]} variant="caption">
        {formatSar(value)}
      </AppText>
    </View>
  );
}

export function TextField({
  label,
  value,
  placeholder,
  error,
  onChangeText,
  ltr,
}: {
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  onChangeText: (value: string) => void;
  ltr?: boolean;
}) {
  return (
    <View style={styles.formField}>
      <AppText variant="supporting">{label}</AppText>
      <View style={[styles.textField, error && styles.fieldError]}>
        <TextInput
          accessibilityLabel={label}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          style={[styles.textInput, ltr && styles.ltrInput]}
          value={value}
        />
      </View>
      {error ? <FieldError message={error} /> : null}
    </View>
  );
}

export function AmountField({
  label,
  value,
  error,
  helper,
  onChangeText,
}: {
  label: string;
  value: string;
  error?: string;
  helper?: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.formField}>
      <AppText variant="supporting">{label}</AppText>
      <View style={[styles.amountField, error && styles.fieldError]}>
        <TextInput
          accessibilityLabel={label}
          keyboardType="numeric"
          onChangeText={onChangeText}
          placeholder="0"
          placeholderTextColor={colors.text.tertiary}
          style={styles.amountInput}
          value={value}
        />
        <AppText align="left" tone="secondary" variant="caption">
          ر.س
        </AppText>
      </View>
      {helper ? (
        <AppText tone="secondary" variant="caption">
          {helper}
        </AppText>
      ) : null}
      {error ? <FieldError message={error} /> : null}
    </View>
  );
}

export function SelectField({
  label,
  value,
  error,
  iconName,
  onPress,
}: {
  label: string;
  value: string;
  error?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <View style={styles.formField}>
      <AppText variant="supporting">{label}</AppText>
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.selectField, error && styles.fieldError, pressed && styles.pressed]}
      >
        {iconName ? (
          <View style={styles.fieldIcon}>
            <Ionicons color={colors.text.tertiary} name={iconName} size={17} />
          </View>
        ) : null}
        <AppText style={styles.selectValue} variant="cardTitle">
          {value || 'اختر'}
        </AppText>
        <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={17} />
      </Pressable>
      {error ? <FieldError message={error} /> : null}
    </View>
  );
}

export function InvoiceItemsEditor({
  items,
  itemError,
  onAddItem,
  onChangeItem,
  onRemoveItem,
}: {
  items: InvoiceItem[];
  itemError?: string;
  onAddItem: () => void;
  onChangeItem: (id: string, patch: Partial<InvoiceItem>) => void;
  onRemoveItem: (id: string) => void;
}) {
  return (
    <View style={styles.formField}>
      <AppText variant="supporting">بنود الفاتورة</AppText>
      {items.map((item) => {
        const lineTotal = item.quantity * item.unitPrice;

        return (
          <SolidCard key={item.id} style={[styles.itemCard, itemError && styles.fieldError]}>
            <Pressable accessibilityLabel="حذف البند" accessibilityRole="button" onPress={() => onRemoveItem(item.id)} style={styles.itemDelete}>
              <Ionicons color={colors.text.tertiary} name="trash-outline" size={16} />
            </Pressable>
            <TextInput
              accessibilityLabel="وصف البند"
              onChangeText={(value) => onChangeItem(item.id, { description: value })}
              placeholder="أدخل وصف البند"
              placeholderTextColor={colors.text.tertiary}
              style={styles.itemDescription}
              value={item.description}
            />
            <View style={styles.itemInputs}>
              <View style={styles.itemInputWrap}>
                <AppText tone="secondary" variant="caption">
                  الكمية
                </AppText>
                <TextInput
                  accessibilityLabel="الكمية"
                  keyboardType="numeric"
                  onChangeText={(value) => onChangeItem(item.id, { quantity: Number(value) || 0 })}
                  placeholder="0"
                  placeholderTextColor={colors.text.tertiary}
                  style={styles.itemInput}
                  value={String(item.quantity)}
                />
              </View>
              <View style={styles.itemInputWrap}>
                <AppText tone="secondary" variant="caption">
                  السعر
                </AppText>
                <TextInput
                  accessibilityLabel="السعر"
                  keyboardType="numeric"
                  onChangeText={(value) => onChangeItem(item.id, { unitPrice: Number(value) || 0 })}
                  placeholder="0"
                  placeholderTextColor={colors.text.tertiary}
                  style={styles.itemInput}
                  value={String(item.unitPrice)}
                />
              </View>
            </View>
            <View style={styles.itemTotalRow}>
              <AppText tone="secondary" variant="caption">
                الإجمالي
              </AppText>
              <AppText align="left" style={styles.itemTotal} variant="caption">
                {formatSar(lineTotal)}
              </AppText>
            </View>
          </SolidCard>
        );
      })}
      {itemError ? <FieldError message={itemError} /> : null}
      <Pressable accessibilityLabel="إضافة بند" accessibilityRole="button" onPress={onAddItem} style={({ pressed }) => [styles.addItemButton, pressed && styles.pressed]}>
        <Ionicons color="#2EA8FF" name="add-outline" size={19} />
        <AppText style={styles.linkText} variant="cardTitle">
          إضافة بند
        </AppText>
      </Pressable>
    </View>
  );
}

export function InvoiceTotalsCard({ subtotal, discount, tax, total }: { subtotal: number; discount: number; tax: number; total: number }) {
  return (
    <SolidCard style={styles.totalsCard}>
      <TotalRow label="المجموع الفرعي" value={subtotal} />
      <TotalRow label="الخصم" value={discount} />
      <TotalRow label="الضريبة" value={tax} />
      <View style={styles.totalDivider} />
      <TotalRow large label="الإجمالي" tone="green" value={total} />
    </SolidCard>
  );
}

export function InvoiceMiniCard({ invoice }: { invoice: Invoice }) {
  const summary = getInvoiceSummary(invoice);

  return (
    <SolidCard style={styles.miniCard}>
      <View style={styles.invoiceTop}>
        <View style={styles.invoiceIdentity}>
          <View style={[styles.invoiceIcon, { backgroundColor: invoiceToneColors[summary.displayStatus.tone].tint }]}>
            <Ionicons color={invoiceToneColors[summary.displayStatus.tone].accent} name={summary.displayStatus.icon} size={18} />
          </View>
          <View style={styles.invoiceCopy}>
            <AppText variant="cardTitle">{summary.clientName}</AppText>
            <AppText align="left" tone="secondary" variant="caption">
              {directionSafeText(summary.invoiceNumber)}
            </AppText>
          </View>
        </View>
        <InvoiceStatusBadge status={summary.displayStatus} />
      </View>
      <View style={styles.amountGrid}>
        <InvoiceMetric label="الإجمالي" value={summary.total} />
        <InvoiceMetric label="المدفوع" tone="green" value={summary.paid} />
        <InvoiceMetric label="المتبقي" tone={summary.displayStatus.tone} value={summary.remaining} />
      </View>
      <InvoiceProgressBar progress={summary.progress} tone={summary.displayStatus.tone} />
    </SolidCard>
  );
}

export function PickerSheet({
  title,
  visible,
  options,
  selectedValue,
  onSelect,
  onClose,
}: {
  title: string;
  visible: boolean;
  options: readonly string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal animationType={Platform.OS === 'ios' ? 'slide' : 'fade'} onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>
      <View style={styles.sheetRoot}>
        <Pressable accessibilityLabel="إغلاق القائمة" onPress={onClose} style={styles.sheetBackdrop} />
        <View style={[styles.sheetCard, { paddingBottom: insets.bottom + spacing.xl }]}>
          <CapitalBottomSheetHeaderSurface />
          <View style={styles.sheetHandle} />
          <AppText variant="sectionTitle">{title}</AppText>
          {options.map((option) => {
            const selected = option === selectedValue;

            return (
              <Pressable
                accessibilityLabel={option}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={option}
                onPress={() => onSelect(option)}
                style={({ pressed }) => [styles.optionRow, selected && styles.optionRowSelected, pressed && styles.pressed]}
              >
                <AppText style={selected && styles.optionTextSelected} variant="body">
                  {option}
                </AppText>
                {selected ? <Ionicons color={colors.brand.calmGreen} name="checkmark-outline" size={18} /> : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

export function BottomConfirmSheet({
  visible,
  title,
  description,
  primaryLabel,
  secondaryLabel,
  danger,
  primaryVariant,
  secondaryVariant,
  onPrimaryPress,
  onSecondaryPress,
}: {
  visible: boolean;
  title: string;
  description: string;
  primaryLabel: string;
  secondaryLabel: string;
  danger?: boolean;
  primaryVariant?: 'primary' | 'secondary' | 'danger';
  secondaryVariant?: 'primary' | 'secondary' | 'danger';
  onPrimaryPress: () => void;
  onSecondaryPress: () => void;
}) {
  const insets = useSafeAreaInsets();
  const resolvedPrimaryVariant = primaryVariant ?? (danger ? 'danger' : 'secondary');
  const resolvedSecondaryVariant = secondaryVariant ?? (danger ? 'secondary' : 'primary');

  return (
    <Modal animationType={Platform.OS === 'ios' ? 'slide' : 'fade'} onRequestClose={onSecondaryPress} statusBarTranslucent transparent visible={visible}>
      <View style={styles.sheetRoot}>
        <Pressable accessibilityLabel={secondaryLabel} onPress={onSecondaryPress} style={styles.sheetBackdrop} />
        <View style={[styles.confirmSheet, { paddingBottom: insets.bottom + spacing.xl }]}>
          <CapitalBottomSheetHeaderSurface />
          <View style={styles.sheetHandle} />
          <AppText variant="sectionTitle">{title}</AppText>
          <AppText tone="secondary" variant="body">
            {description}
          </AppText>
          <View style={styles.confirmActions}>
            <AppButton onPress={onSecondaryPress} variant={resolvedSecondaryVariant}>
              {secondaryLabel}
            </AppButton>
            <AppButton onPress={onPrimaryPress} variant={resolvedPrimaryVariant}>
              {primaryLabel}
            </AppButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function NoticeBanner({ message, tone = 'success' }: { message: string; tone?: 'success' | 'warning' | 'danger' }) {
  const isWarning = tone === 'warning';
  const isDanger = tone === 'danger';
  const color = isDanger ? colors.semantic.danger : isWarning ? colors.semantic.warning : '#35D39A';

  return (
    <View style={[styles.notice, isDanger ? styles.dangerNotice : isWarning ? styles.warningNotice : styles.successNotice]}>
      <Ionicons color={color} name={isDanger ? 'warning-outline' : isWarning ? 'warning-outline' : 'checkmark-circle-outline'} size={17} />
      <AppText style={{ color }} variant="supporting">
        {message}
      </AppText>
    </View>
  );
}

export function FieldError({ message }: { message: string }) {
  return (
    <AppText style={styles.errorText} variant="caption">
      {message}
    </AppText>
  );
}

export function invoiceStatusNameToId(name: string): InvoiceStatusId {
  return invoiceStatusOptions.find((status) => status.label === name)?.id ?? 'awaiting-payment';
}

export function invoiceStatusIdToName(id: InvoiceStatusId) {
  return invoiceStatusOptions.find((status) => status.id === id)?.label ?? '';
}

function TotalRow({ label, value, tone, large }: { label: string; value: number; tone?: 'green'; large?: boolean }) {
  return (
    <View style={styles.totalRow}>
      <AppText variant={large ? 'cardTitle' : 'supporting'}>{label}</AppText>
      <AppText align="left" style={[large ? styles.totalValueLarge : styles.totalValue, tone === 'green' && styles.greenText]} variant="caption">
        {formatSar(value)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  headerCopy: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
  },
  headerTitle: {
    lineHeight: 31,
  },
  headerSlot: {
    height: 42,
    width: 42,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  statusBadgeText: {
    fontSize: 11,
    lineHeight: 16,
  },
  progressTrack: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radii.pill,
    height: 7,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: radii.pill,
    height: '100%',
  },
  invoiceCard: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: 18,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  dangerCard: {
    backgroundColor: 'rgba(42,10,10,0.50)',
    borderColor: 'rgba(229,103,90,0.28)',
  },
  paidCard: {
    backgroundColor: 'rgba(5,38,24,0.48)',
    borderColor: 'rgba(53,211,154,0.26)',
  },
  invoiceTop: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  invoiceIdentity: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    minWidth: 0,
  },
  invoiceIcon: {
    alignItems: 'center',
    borderRadius: radii.control,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  invoiceCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  amountGrid: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radii.control,
    flexDirection: 'row-reverse',
    paddingVertical: spacing.sm,
  },
  metric: {
    alignItems: 'center',
    borderLeftColor: colors.surface.separator,
    borderLeftWidth: StyleSheet.hairlineWidth,
    flex: 1,
    gap: spacing.xs,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    writingDirection: 'ltr',
  },
  cardFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formField: {
    gap: spacing.sm,
  },
  textField: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  textInput: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 15,
    padding: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  ltrInput: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  amountField: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  amountInput: {
    color: colors.text.primary,
    flex: 1,
    fontFamily: typography.fontFamily.bold,
    fontSize: 22,
    fontWeight: '700',
    padding: 0,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  selectField: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  fieldIcon: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderRadius: radii.control,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  selectValue: {
    flex: 1,
  },
  fieldError: {
    borderColor: colors.semantic.danger,
  },
  errorText: {
    color: colors.semantic.danger,
    textAlign: 'right',
  },
  itemCard: {
    gap: spacing.md,
  },
  itemDelete: {
    alignSelf: 'flex-start',
  },
  itemDescription: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
    fontWeight: '700',
    padding: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  itemInputs: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  itemInputWrap: {
    backgroundColor: '#1A2230',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.control,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  itemInput: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    fontWeight: '700',
    padding: 0,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  itemTotalRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  itemTotal: {
    color: colors.text.primary,
    fontWeight: '700',
    writingDirection: 'ltr',
  },
  addItemButton: {
    alignItems: 'center',
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderStyle: 'dashed',
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 48,
  },
  linkText: {
    color: '#2EA8FF',
  },
  totalsCard: {
    gap: spacing.sm,
  },
  totalRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  totalValue: {
    color: colors.text.primary,
    fontWeight: '700',
    writingDirection: 'ltr',
  },
  totalValueLarge: {
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 24,
    writingDirection: 'ltr',
  },
  totalDivider: {
    backgroundColor: colors.surface.separator,
    height: StyleSheet.hairlineWidth,
  },
  greenText: {
    color: '#35D39A',
  },
  miniCard: {
    gap: spacing.md,
  },
  sheetRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.62)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  sheetCard: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.xl,
  },
  sheetHandle: {
    alignSelf: 'center',
    backgroundColor: colors.text.tertiary,
    borderRadius: radii.pill,
    height: 4,
    opacity: 0.55,
    width: 42,
  },
  optionRow: {
    alignItems: 'center',
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    minHeight: 46,
    paddingHorizontal: spacing.md,
  },
  optionRowSelected: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.34)',
  },
  optionTextSelected: {
    color: colors.brand.calmGreen,
  },
  confirmSheet: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.xl,
  },
  confirmActions: {
    gap: spacing.sm,
  },
  notice: {
    alignItems: 'center',
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    padding: spacing.md,
  },
  successNotice: {
    backgroundColor: 'rgba(53,211,154,0.10)',
    borderColor: 'rgba(53,211,154,0.24)',
  },
  warningNotice: {
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.24)',
  },
  dangerNotice: {
    backgroundColor: colors.semantic.dangerTint,
    borderColor: 'rgba(229,103,90,0.30)',
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.99 }],
  },
});
