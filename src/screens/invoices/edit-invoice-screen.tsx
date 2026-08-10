import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';
import {
  AmountField,
  BottomConfirmSheet,
  InvoiceHeader,
  InvoiceItemsEditor,
  InvoiceMiniCard,
  InvoiceSectionHeading,
  invoiceStatusIdToName,
  invoiceStatusNameToId,
  InvoiceTotalsCard,
  NoticeBanner,
  PickerSheet,
  SelectField,
  TextField,
} from './components';
import { compareInvoiceDates, formatAmountInput, formatSar, getInvoiceSubtotal, parseAmount } from './invoice-utils';
import { findInvoiceNumber, updateInvoice, useInvoicesStore } from './invoices-store';
import { initialInvoices, invoiceDueDateOptions, invoiceIssueDateOptions, invoiceStatusOptions, type Invoice, type InvoiceItem, type InvoiceStatusId } from './invoices-data';

type PickerType = 'issue' | 'due' | 'status' | null;

type InvoiceFormErrors = {
  clientName?: string;
  invoiceNumber?: string;
  issueDate?: string;
  dueDate?: string;
  items?: string;
  total?: string;
};

export function EditInvoiceScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const { invoices } = useInvoicesStore();
  const original = invoices.find((item) => item.id === params.id) ?? invoices[0] ?? initialInvoices[0]!;
  const [clientName, setClientName] = useState(original.clientName);
  const [invoiceNumber, setInvoiceNumber] = useState(original.invoiceNumber);
  const [issueDate, setIssueDate] = useState(original.issueDate);
  const [dueDate, setDueDate] = useState(original.dueDate);
  const [discount, setDiscount] = useState(String(original.discount));
  const [tax, setTax] = useState(String(original.tax));
  const [status, setStatus] = useState<InvoiceStatusId>(original.status);
  const [notes, setNotes] = useState(original.notes);
  const [items, setItems] = useState<InvoiceItem[]>(original.items);
  const [picker, setPicker] = useState<PickerType>(null);
  const [submitted, setSubmitted] = useState(false);
  const [discardVisible, setDiscardVisible] = useState(false);
  const parsedDiscount = parseAmount(discount) ?? 0;
  const parsedTax = parseAmount(tax) ?? 0;
  const subtotal = getInvoiceSubtotal({ items });
  const total = Math.max(subtotal - parsedDiscount + parsedTax, 0);
  const dirty =
    clientName.trim() !== original.clientName ||
    invoiceNumber.trim() !== original.invoiceNumber ||
    issueDate !== original.issueDate ||
    dueDate !== original.dueDate ||
    parsedDiscount !== original.discount ||
    parsedTax !== original.tax ||
    status !== original.status ||
    notes.trim() !== original.notes ||
    JSON.stringify(items) !== JSON.stringify(original.items);
  const errors = useMemo(
    () => validateInvoiceForm({ clientName, dueDate, invoiceNumber, issueDate, items, originalId: original.id, paid: original.paid, total }),
    [clientName, dueDate, invoiceNumber, issueDate, items, original.id, original.paid, total],
  );
  const blockingError = Boolean(errors.clientName || errors.invoiceNumber || errors.issueDate || errors.dueDate || errors.items || errors.total);
  const previewInvoice: Invoice = {
    ...original,
    clientName: clientName.trim() || original.clientName,
    discount: Math.max(parsedDiscount, 0),
    dueDate,
    invoiceNumber: invoiceNumber.trim() || original.invoiceNumber,
    issueDate,
    items,
    notes,
    status,
    tax: Math.max(parsedTax, 0),
  };

  function handleBack() {
    if (dirty) {
      setDiscardVisible(true);
      return;
    }

    router.back();
  }

  function handleSave() {
    setSubmitted(true);

    if (!dirty || blockingError) {
      return;
    }

    updateInvoice(original.id, {
      clientName: clientName.trim(),
      discount: Math.max(parsedDiscount, 0),
      dueDate,
      invoiceNumber: invoiceNumber.trim(),
      issueDate,
      items,
      notes: notes.trim(),
      paid: original.paid,
      status,
      tax: Math.max(parsedTax, 0),
    });
    router.replace({ pathname: routes.invoiceDetails, params: { id: original.id } });
  }

  function updateItem(id: string, patch: Partial<InvoiceItem>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function addItem() {
    setItems((current) => [...current, { id: `draft-item-${Date.now()}`, description: '', quantity: 1, unitPrice: 0 }]);
  }

  function removeItem(id: string) {
    setItems((current) => (current.length > 1 ? current.filter((item) => item.id !== id) : current));
  }

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardRoot}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom: Math.max(insets.bottom + spacing.xxl, spacing.screenBottom),
              paddingTop: Platform.OS === 'ios' ? spacing.sm : Math.max(insets.top + spacing.sm, 48),
            },
          ]}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <InvoiceHeader rtl onBack={handleBack} subtitle="حدث بيانات الفاتورة ومواعيدها" title="تعديل الفاتورة" />

          {original.paid > 0 ? (
            <SolidCard style={[styles.paymentInfoCard, Platform.OS !== 'web' && styles.paymentInfoCardAndroid]}>
              <AppText style={[styles.blueText, Platform.OS !== 'web' && styles.paymentInfoTextAndroid]} variant="cardTitle">
                {directionSafeText(`الدفعات المسجلة: ${formatSar(original.paid)}`)}
              </AppText>
              <AppText style={Platform.OS !== 'web' ? styles.paymentInfoTextAndroid : undefined} variant="supporting">
                تعديل الفاتورة لا يحذف الدفعات المسجلة مسبقًا.
              </AppText>
            </SolidCard>
          ) : (
            <NoticeBanner message="تعديل الفاتورة لا يحذف الدفعات المسجلة مسبقًا." tone="warning" />
          )}

          {dirty ? <NoticeBanner message="لديك تغييرات غير محفوظة" tone="warning" /> : null}
          {original.paid > 0 && dirty ? <NoticeBanner message="تم تسجيل دفعات على هذه الفاتورة، وسيتم الاحتفاظ بها." tone="warning" /> : null}

          <TextField error={submitted ? errors.clientName : undefined} label="اسم العميل" onChangeText={setClientName} placeholder="اسم العميل" value={clientName} />
          <TextField error={submitted ? errors.invoiceNumber : undefined} label="رقم الفاتورة" ltr onChangeText={setInvoiceNumber} placeholder="INV-2026-1042" value={invoiceNumber} />

          <View style={styles.twoColumns}>
            <View style={styles.flexField}>
              <SelectField androidRtlLayout error={submitted ? errors.issueDate : undefined} iconName="calendar-outline" label="تاريخ الإصدار" ltr onPress={() => setPicker('issue')} value={issueDate} />
            </View>
            <View style={styles.flexField}>
              <SelectField androidRtlLayout error={submitted ? errors.dueDate : undefined} iconName="calendar-outline" label="تاريخ الاستحقاق" ltr onPress={() => setPicker('due')} value={dueDate} />
            </View>
          </View>

          <InvoiceItemsEditor androidRtlLayout itemError={submitted ? errors.items : undefined} items={items} onAddItem={addItem} onChangeItem={updateItem} onRemoveItem={removeItem} />

          <View style={styles.twoColumns}>
            <View style={styles.flexField}>
              <AmountField label="الخصم" onChangeText={(value) => setDiscount(formatAmountInput(value))} value={discount} />
            </View>
            <View style={styles.flexField}>
              <AmountField label="الضريبة" onChangeText={(value) => setTax(formatAmountInput(value))} value={tax} />
            </View>
          </View>
          <InvoiceTotalsCard androidRtlLayout discount={parsedDiscount} subtotal={subtotal} tax={parsedTax} total={total} />
          {submitted && errors.total ? (
            <AppText style={styles.errorText} variant="caption">
              {errors.total}
            </AppText>
          ) : null}

          <SelectField androidRtlLayout iconName="time-outline" label="حالة الدفع" onPress={() => setPicker('status')} value={invoiceStatusIdToName(status)} />
          <TextField label="ملاحظات" onChangeText={setNotes} placeholder="اختياري" value={notes} />

          <View style={styles.section}>
            <InvoiceSectionHeading title="معاينة التعديلات" />
            <InvoiceMiniCard invoice={previewInvoice} />
          </View>

          <AppButton disabled={!dirty || blockingError} iconName="checkmark-outline" onPress={handleSave}>
            حفظ التغييرات
          </AppButton>
          <AppButton onPress={handleBack} variant="ghost">
            إلغاء
          </AppButton>
        </ScrollView>
      </KeyboardAvoidingView>

      <PickerSheet
        androidRtlLayout
        ltr
        onClose={() => setPicker(null)}
        onSelect={(value) => {
          setIssueDate(value);
          setPicker(null);
        }}
        options={invoiceIssueDateOptions}
        selectedValue={issueDate}
        title="اختر تاريخ الإصدار"
        visible={picker === 'issue'}
      />
      <PickerSheet
        androidRtlLayout
        ltr
        onClose={() => setPicker(null)}
        onSelect={(value) => {
          setDueDate(value);
          setPicker(null);
        }}
        options={invoiceDueDateOptions}
        selectedValue={dueDate}
        title="اختر تاريخ الاستحقاق"
        visible={picker === 'due'}
      />
      <PickerSheet
        androidRtlLayout
        onClose={() => setPicker(null)}
        onSelect={(value) => {
          setStatus(invoiceStatusNameToId(value));
          setPicker(null);
        }}
        options={invoiceStatusOptions.map((item) => item.label)}
        selectedValue={invoiceStatusIdToName(status)}
        title="اختر حالة الدفع"
        visible={picker === 'status'}
      />
      <BottomConfirmSheet
        description="لديك تعديلات غير محفوظة على الفاتورة."
        onPrimaryPress={() => {
          setDiscardVisible(false);
          router.replace({ pathname: routes.invoiceDetails, params: { id: original.id } });
        }}
        onSecondaryPress={() => setDiscardVisible(false)}
        primaryLabel="تجاهل التغييرات"
        primaryVariant="danger"
        secondaryLabel="متابعة التعديل"
        secondaryVariant="primary"
        title="تجاهل التغييرات؟"
        visible={discardVisible}
      />
    </View>
  );
}

function validateInvoiceForm({
  clientName,
  dueDate,
  invoiceNumber,
  issueDate,
  items,
  originalId,
  paid,
  total,
}: {
  clientName: string;
  dueDate: string;
  invoiceNumber: string;
  issueDate: string;
  items: InvoiceItem[];
  originalId: string;
  paid: number;
  total: number;
}) {
  const errors: InvoiceFormErrors = {};

  if (!clientName.trim()) {
    errors.clientName = 'يرجى إدخال اسم العميل';
  }

  if (!invoiceNumber.trim()) {
    errors.invoiceNumber = 'يرجى إدخال رقم الفاتورة';
  } else if (findInvoiceNumber(invoiceNumber.trim(), originalId)) {
    errors.invoiceNumber = 'رقم الفاتورة مستخدم مسبقًا';
  }

  if (!issueDate.trim()) {
    errors.issueDate = 'يرجى اختيار تاريخ الإصدار';
  }

  if (!dueDate.trim()) {
    errors.dueDate = 'يرجى اختيار تاريخ الاستحقاق';
  } else if (issueDate.trim() && compareInvoiceDates(issueDate, dueDate) <= 0) {
    errors.dueDate = 'تاريخ الاستحقاق يجب أن يكون بعد تاريخ الإصدار';
  }

  if (!items.length) {
    errors.items = 'أضف بندًا واحدًا على الأقل';
  } else if (items.some((item) => !item.description.trim())) {
    errors.items = 'يرجى إدخال وصف البند';
  } else if (items.some((item) => item.quantity <= 0)) {
    errors.items = 'الكمية يجب أن تكون أكبر من صفر';
  } else if (items.some((item) => item.unitPrice <= 0)) {
    errors.items = 'السعر يجب أن يكون أكبر من صفر';
  }

  if (total < paid) {
    errors.total = 'إجمالي الفاتورة لا يمكن أن يكون أقل من المبلغ المدفوع';
  }

  return errors;
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#000000',
    flex: 1,
  },
  keyboardRoot: {
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  paymentInfoCard: {
    backgroundColor: 'rgba(2,25,42,0.92)',
    borderColor: 'rgba(46,168,255,0.22)',
    gap: spacing.sm,
  },
  paymentInfoCardAndroid: {
    alignItems: 'flex-end',
  },
  paymentInfoTextAndroid: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  blueText: {
    color: '#9DD5FF',
  },
  twoColumns: {
    alignItems: 'flex-start',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  flexField: {
    flex: 1,
    minWidth: 0,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  errorText: {
    color: colors.semantic.danger,
    textAlign: 'right',
  },
});
