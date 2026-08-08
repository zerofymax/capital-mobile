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

export function InvoiceHeader({
  title,
  subtitle,
  onBack,
  rtl = true,
}: {
  title: string;
  subtitle?: string;
  onBack: () => void;
  rtl?: boolean;
}) {
  return (
    <View style={[styles.header, rtl && styles.headerRtl, Platform.OS === 'android' && styles.headerAndroid]}>
      <CapitalGlassIconButton
        accessibilityLabel="رجوع"
        hitSlop={8}
        iconColor={colors.text.muted}
        iconName={Platform.OS === 'android' ? 'chevron-back-outline' : 'chevron-forward-outline'}
        iconSize={21}
        onPress={onBack}
        pressedStyle={styles.pressed}
        radius={radii.control}
        style={styles.backButton}
      />
      <View style={[styles.headerCopy, rtl && styles.headerCopyRtl, Platform.OS === 'android' && styles.headerCopyAndroid]}>
        <AppText align={rtl ? 'right' : 'center'} style={[styles.headerTitle, rtl && styles.headerTextRtl]} variant="screenTitle">
          {rtl ? directionSafeText(title) : title}
        </AppText>
        {subtitle ? (
          <AppText align={rtl ? 'right' : 'center'} style={rtl && styles.headerTextRtl} tone="secondary" variant="supporting">
            {rtl ? directionSafeText(subtitle) : subtitle}
          </AppText>
        ) : null}
      </View>
      <View style={[styles.headerSlot, Platform.OS === 'android' && styles.headerSlotAndroid]} />
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

export function InvoiceProgressBar({
  progress,
  tone,
  startFromLeftOnAndroid = false,
}: {
  progress: number;
  tone: InvoiceTone;
  startFromLeftOnAndroid?: boolean;
}) {
  const clamped = Math.max(0, Math.min(progress, 100));
  const startsFromLeft = Platform.OS === 'android' && startFromLeftOnAndroid;

  return (
    <View style={[styles.progressTrack, startsFromLeft && styles.progressTrackLeft]}>
      <View style={[styles.progressFill, { backgroundColor: invoiceToneColors[tone].accent, width: `${clamped}%` }]} />
    </View>
  );
}

export function InvoiceCard({
  invoice,
  onPress,
  layoutVariant = 'default',
}: {
  invoice: Invoice;
  onPress: (id: string) => void;
  layoutVariant?: 'default' | 'invoicesListRtl';
}) {
  const summary = getInvoiceSummary(invoice);
  const tone = invoiceToneColors[summary.displayStatus.tone];
  const useInvoicesListRtl = Platform.OS === 'android' && layoutVariant === 'invoicesListRtl';

  return (
    <Pressable
      accessibilityLabel={`${summary.clientName}، ${summary.invoiceNumber}، ${summary.total} ر.س، ${summary.paid} ر.س مدفوع، ${summary.remaining} ر.س متبقي، ${summary.displayStatus.label}`}
      accessibilityRole="button"
      onPress={() => onPress(summary.id)}
      style={({ pressed }) => [styles.invoiceCard, summary.displayStatus.tone === 'danger' && styles.dangerCard, summary.paidInFull && styles.paidCard, pressed && styles.pressed]}
    >
      {useInvoicesListRtl ? (
        <View style={[styles.invoiceTop, styles.invoiceTopListRtl]}>
          <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={17} />
          <View style={[styles.invoiceIcon, { backgroundColor: tone.tint }]}>
            <Ionicons color={tone.accent} name={summary.displayStatus.icon} size={19} />
          </View>
          <View style={styles.invoiceTopSpacer} />
          <InvoiceStatusBadge status={summary.displayStatus} />
          <View style={[styles.invoiceCopy, styles.invoiceCopyListRtl]}>
            <AppText align="right" style={styles.invoiceClientNameListRtl} variant="cardTitle">
              {summary.clientName}
            </AppText>
            <AppText
              align="right"
              numberOfLines={1}
              style={[styles.invoiceNumber, styles.invoiceNumberListRtl]}
              tone="secondary"
              variant="caption"
            >
              {directionSafeText(summary.invoiceNumber)}
            </AppText>
          </View>
        </View>
      ) : (
        <View style={styles.invoiceTop}>
          <View style={styles.invoiceIdentity}>
            <View style={[styles.invoiceIcon, { backgroundColor: tone.tint }]}>
              <Ionicons color={tone.accent} name={summary.displayStatus.icon} size={19} />
            </View>
            <View style={styles.invoiceCopy}>
              <AppText variant="cardTitle">{summary.clientName}</AppText>
              <AppText align="left" style={styles.invoiceNumber} tone="secondary" variant="caption">
                {directionSafeText(summary.invoiceNumber)}
              </AppText>
            </View>
          </View>
          <InvoiceStatusBadge status={summary.displayStatus} />
          <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={17} />
        </View>
      )}

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
      <AppText style={styles.formLabel} variant="supporting">
        {label}
      </AppText>
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
  androidRtlLayout = false,
  onChangeText,
}: {
  label: string;
  value: string;
  error?: string;
  helper?: string;
  androidRtlLayout?: boolean;
  onChangeText: (value: string) => void;
}) {
  const useAndroidRtlLayout = Platform.OS === 'android' && androidRtlLayout;

  return (
    <View style={styles.formField}>
      <AppText style={styles.formLabel} variant="supporting">
        {label}
      </AppText>
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
        <AppText style={useAndroidRtlLayout ? styles.fieldHelperAndroid : undefined} tone="secondary" variant="caption">
          {directionSafeText(helper)}
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
  ltr = false,
  androidRtlLayout = false,
  androidCenterValue = false,
  onPress,
}: {
  label: string;
  value: string;
  error?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  ltr?: boolean;
  androidRtlLayout?: boolean;
  androidCenterValue?: boolean;
  onPress: () => void;
}) {
  const useAndroidRtlLayout = Platform.OS === 'android' && androidRtlLayout;
  const useAndroidCenteredValue = useAndroidRtlLayout && androidCenterValue;
  const valueText = (
    <AppText
      align={ltr ? 'left' : 'right'}
      style={[styles.selectValue, ltr && styles.selectValueLtr, useAndroidRtlLayout && styles.selectValueAndroid]}
      variant="cardTitle"
    >
      {ltr ? directionSafeText(value || 'اختر') : value || 'اختر'}
    </AppText>
  );
  const fieldIcon = iconName ? (
    <View style={styles.fieldIcon}>
      <Ionicons color={colors.text.tertiary} name={iconName} size={17} />
    </View>
  ) : null;
  const chevron = <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={17} />;

  return (
    <View style={styles.formField}>
      <AppText style={styles.formLabel} variant="supporting">
        {label}
      </AppText>
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.selectField, useAndroidRtlLayout && styles.selectFieldAndroid, error && styles.fieldError, pressed && styles.pressed]}
      >
        {useAndroidRtlLayout ? (
          <>
            {chevron}
            {fieldIcon}
            <View style={[styles.selectValueSlotAndroid, useAndroidCenteredValue && styles.selectValueSlotCenteredAndroid]}>{valueText}</View>
          </>
        ) : (
          <>
            {valueText}
            {fieldIcon}
            {chevron}
          </>
        )}
      </Pressable>
      {error ? <FieldError message={error} /> : null}
    </View>
  );
}

export function InvoiceItemsEditor({
  items,
  itemError,
  androidRtlLayout = false,
  onAddItem,
  onChangeItem,
  onRemoveItem,
}: {
  items: InvoiceItem[];
  itemError?: string;
  androidRtlLayout?: boolean;
  onAddItem: () => void;
  onChangeItem: (id: string, patch: Partial<InvoiceItem>) => void;
  onRemoveItem: (id: string) => void;
}) {
  const useAndroidRtlLayout = Platform.OS === 'android' && androidRtlLayout;

  return (
    <View style={styles.formField}>
      <AppText style={styles.formLabel} variant="supporting">
        بنود الفاتورة
      </AppText>
      {items.map((item) => {
        const lineTotal = item.quantity * item.unitPrice;
        const deleteButton = (
          <Pressable accessibilityLabel="حذف البند" accessibilityRole="button" onPress={() => onRemoveItem(item.id)} style={styles.itemDelete}>
            <Ionicons color={colors.text.tertiary} name="trash-outline" size={16} />
          </Pressable>
        );
        const descriptionInput = (
          <TextInput
            accessibilityLabel="وصف البند"
            onChangeText={(value) => onChangeItem(item.id, { description: value })}
            placeholder="أدخل وصف البند"
            placeholderTextColor={colors.text.tertiary}
            style={[styles.itemDescription, useAndroidRtlLayout && styles.itemDescriptionAndroid]}
            value={item.description}
          />
        );
        const itemTotalLabel = (
          <AppText style={useAndroidRtlLayout ? styles.itemLabelAndroid : undefined} tone="secondary" variant="caption">
            الإجمالي
          </AppText>
        );
        const itemTotalValue = (
          <AppText align="left" style={styles.itemTotal} variant="caption">
            {formatSar(lineTotal)}
          </AppText>
        );

        return (
          <SolidCard key={item.id} style={[styles.itemCard, itemError && styles.fieldError]}>
            {useAndroidRtlLayout ? (
              <View style={styles.itemHeaderAndroid}>
                {deleteButton}
                {descriptionInput}
              </View>
            ) : (
              <>
                {deleteButton}
                {descriptionInput}
              </>
            )}
            <View style={styles.itemInputs}>
              <View style={styles.itemInputWrap}>
                <AppText style={useAndroidRtlLayout ? styles.itemLabelAndroid : undefined} tone="secondary" variant="caption">
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
                <AppText style={useAndroidRtlLayout ? styles.itemLabelAndroid : undefined} tone="secondary" variant="caption">
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
            <View style={[styles.itemTotalRow, useAndroidRtlLayout && styles.itemTotalRowAndroid]}>
              {useAndroidRtlLayout ? itemTotalValue : itemTotalLabel}
              {useAndroidRtlLayout ? itemTotalLabel : itemTotalValue}
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

export function InvoiceTotalsCard({
  subtotal,
  discount,
  tax,
  total,
  androidRtlLayout = false,
}: {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  androidRtlLayout?: boolean;
}) {
  return (
    <SolidCard style={styles.totalsCard}>
      <TotalRow androidRtlLayout={androidRtlLayout} label="المجموع الفرعي" value={subtotal} />
      <TotalRow androidRtlLayout={androidRtlLayout} label="الخصم" value={discount} />
      <TotalRow androidRtlLayout={androidRtlLayout} label="الضريبة" value={tax} />
      <View style={styles.totalDivider} />
      <TotalRow androidRtlLayout={androidRtlLayout} large label="الإجمالي" tone="green" value={total} />
    </SolidCard>
  );
}

export function InvoiceMiniCard({ invoice }: { invoice: Invoice }) {
  const summary = getInvoiceSummary(invoice);
  const useAndroidRtlLayout = Platform.OS === 'android';

  return (
    <SolidCard style={styles.miniCard}>
      {useAndroidRtlLayout ? (
        <View style={[styles.invoiceTop, styles.invoiceTopListRtl]}>
          <View style={[styles.invoiceIcon, { backgroundColor: invoiceToneColors[summary.displayStatus.tone].tint }]}>
            <Ionicons color={invoiceToneColors[summary.displayStatus.tone].accent} name={summary.displayStatus.icon} size={18} />
          </View>
          <View style={styles.invoiceTopSpacer} />
          <InvoiceStatusBadge status={summary.displayStatus} />
          <View style={[styles.invoiceCopy, styles.invoiceCopyListRtl]}>
            <AppText align="right" style={styles.invoiceClientNameListRtl} variant="cardTitle">
              {summary.clientName}
            </AppText>
            <AppText align="right" numberOfLines={1} style={[styles.invoiceNumber, styles.invoiceNumberListRtl]} tone="secondary" variant="caption">
              {directionSafeText(summary.invoiceNumber)}
            </AppText>
          </View>
        </View>
      ) : (
        <View style={styles.invoiceTop}>
          <View style={styles.invoiceIdentity}>
            <View style={[styles.invoiceIcon, { backgroundColor: invoiceToneColors[summary.displayStatus.tone].tint }]}>
              <Ionicons color={invoiceToneColors[summary.displayStatus.tone].accent} name={summary.displayStatus.icon} size={18} />
            </View>
            <View style={styles.invoiceCopy}>
              <AppText variant="cardTitle">{summary.clientName}</AppText>
              <AppText align="left" style={styles.invoiceNumber} tone="secondary" variant="caption">
                {directionSafeText(summary.invoiceNumber)}
              </AppText>
            </View>
          </View>
          <InvoiceStatusBadge status={summary.displayStatus} />
        </View>
      )}
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
  ltr = false,
  androidRtlLayout = false,
  onSelect,
  onClose,
}: {
  title: string;
  visible: boolean;
  options: readonly string[];
  selectedValue: string;
  ltr?: boolean;
  androidRtlLayout?: boolean;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const useAndroidRtlLayout = Platform.OS === 'android' && androidRtlLayout;
  const titleText = (
    <AppText style={styles.sheetTitle} variant="sectionTitle">
      {title}
    </AppText>
  );

  return (
    <Modal animationType={Platform.OS === 'ios' ? 'slide' : 'fade'} onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>
      <View style={styles.sheetRoot}>
        <Pressable accessibilityLabel="إغلاق القائمة" onPress={onClose} style={styles.sheetBackdrop} />
        <View style={[styles.sheetCard, { paddingBottom: insets.bottom + spacing.xl }]}>
          <CapitalBottomSheetHeaderSurface />
          <View style={styles.sheetHandle} />
          {useAndroidRtlLayout ? <View style={styles.sheetTitleWrapperAndroid}>{titleText}</View> : titleText}
          {options.map((option) => {
            const selected = option === selectedValue;
            const optionText = (
              <AppText
                align={ltr ? 'left' : 'right'}
                style={[styles.optionText, ltr && styles.optionTextLtr, useAndroidRtlLayout && styles.optionTextAndroid, selected && styles.optionTextSelected]}
                variant="body"
              >
                {ltr ? directionSafeText(option) : option}
              </AppText>
            );
            const selectedIcon = selected ? <Ionicons color={colors.brand.calmGreen} name="checkmark-outline" size={18} /> : null;

            return (
              <Pressable
                accessibilityLabel={option}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={option}
                onPress={() => onSelect(option)}
                style={({ pressed }) => [styles.optionRow, useAndroidRtlLayout && styles.optionRowAndroid, selected && styles.optionRowSelected, pressed && styles.pressed]}
              >
                {useAndroidRtlLayout ? (
                  <>
                    {selectedIcon}
                    <View style={styles.optionSpacerAndroid} />
                    <View style={styles.optionTextSlotAndroid}>{optionText}</View>
                  </>
                ) : (
                  <>
                    {optionText}
                    {selectedIcon}
                  </>
                )}
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
          {Platform.OS === 'android' ? (
            <>
              <View style={styles.confirmTextWrapperAndroid}>
                <AppText style={styles.confirmTitleAndroid} variant="sectionTitle">
                  {title}
                </AppText>
              </View>
              <View style={styles.confirmTextWrapperAndroid}>
                <AppText style={styles.confirmDescriptionAndroid} tone="secondary" variant="body">
                  {directionSafeText(description)}
                </AppText>
              </View>
            </>
          ) : (
            <>
              <AppText variant="sectionTitle">{title}</AppText>
              <AppText tone="secondary" variant="body">
                {description}
              </AppText>
            </>
          )}
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
    <View style={[styles.notice, Platform.OS === 'android' && styles.noticeAndroid, isDanger ? styles.dangerNotice : isWarning ? styles.warningNotice : styles.successNotice]}>
      <Ionicons color={color} name={isDanger ? 'warning-outline' : isWarning ? 'warning-outline' : 'checkmark-circle-outline'} size={17} />
      <AppText style={[{ color }, Platform.OS === 'android' && styles.noticeTextAndroid]} variant="supporting">
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

function TotalRow({
  label,
  value,
  tone,
  large,
  androidRtlLayout = false,
}: {
  label: string;
  value: number;
  tone?: 'green';
  large?: boolean;
  androidRtlLayout?: boolean;
}) {
  const useAndroidRtlLayout = Platform.OS === 'android' && androidRtlLayout;
  const labelText = (
    <AppText style={useAndroidRtlLayout ? styles.totalLabelAndroid : undefined} variant={large ? 'cardTitle' : 'supporting'}>
      {label}
    </AppText>
  );
  const valueText = (
    <AppText align="left" style={[large ? styles.totalValueLarge : styles.totalValue, tone === 'green' && styles.greenText]} variant="caption">
      {formatSar(value)}
    </AppText>
  );

  return (
    <View style={[styles.totalRow, useAndroidRtlLayout && styles.totalRowAndroid]}>
      {useAndroidRtlLayout ? valueText : labelText}
      {useAndroidRtlLayout ? labelText : valueText}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerRtl: {
    flexDirection: 'row',
  },
  headerAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
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
    alignItems: 'stretch',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  headerCopyRtl: {
    alignItems: 'flex-end',
  },
  headerCopyAndroid: {
    alignItems: 'flex-end',
  },
  headerTitle: {
    lineHeight: 31,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  headerTextRtl: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  headerSlot: {
    height: 42,
    width: 42,
  },
  headerSlotAndroid: {
    display: 'none',
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
  progressTrackLeft: {
    alignItems: 'flex-start',
    direction: 'ltr',
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
    flexDirection: 'row',
    gap: spacing.sm,
  },
  invoiceTopListRtl: {
    direction: 'ltr',
    width: '100%',
  },
  invoiceTopSpacer: {
    flex: 0.25,
    minWidth: spacing.sm,
  },
  invoiceIdentity: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
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
  invoiceCopyListRtl: {
    alignItems: 'flex-end',
  },
  invoiceClientNameListRtl: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  invoiceNumber: {
    writingDirection: 'ltr',
  },
  invoiceNumberListRtl: {
    flexShrink: 0,
    textAlign: 'right',
    width: '100%',
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
  formLabel: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  fieldHelperAndroid: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
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
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  selectFieldAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
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
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  selectValueLtr: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  selectValueAndroid: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
  },
  selectValueSlotAndroid: {
    alignItems: 'flex-end',
    flex: 1,
    minWidth: 0,
  },
  selectValueSlotCenteredAndroid: {
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  fieldError: {
    borderColor: colors.semantic.danger,
  },
  errorText: {
    color: colors.semantic.danger,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  itemCard: {
    gap: spacing.md,
  },
  itemHeaderAndroid: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  itemDelete: {
    alignSelf: 'flex-end',
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
  itemDescriptionAndroid: {
    flex: 1,
    minWidth: 0,
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
  itemLabelAndroid: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  itemTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemTotalRowAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
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
    flexDirection: 'row',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalRowAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  totalLabelAndroid: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
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
  sheetTitle: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  sheetTitleWrapperAndroid: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    width: '100%',
  },
  optionRow: {
    alignItems: 'center',
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 46,
    paddingHorizontal: spacing.md,
  },
  optionRowAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  optionSpacerAndroid: {
    flex: 1,
    minWidth: spacing.sm,
  },
  optionTextSlotAndroid: {
    alignItems: 'flex-end',
    flexShrink: 1,
    minWidth: 0,
  },
  optionRowSelected: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.34)',
  },
  optionText: {
    flex: 1,
    minWidth: 0,
  },
  optionTextAndroid: {
    flex: 0,
    flexShrink: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  optionTextLtr: {
    textAlign: 'left',
    writingDirection: 'ltr',
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
  confirmTextWrapperAndroid: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    width: '100%',
  },
  confirmTitleAndroid: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  confirmDescriptionAndroid: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  notice: {
    alignItems: 'center',
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    padding: spacing.md,
  },
  noticeAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  noticeTextAndroid: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
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
