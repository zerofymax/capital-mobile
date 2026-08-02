import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText } from '@/components/ui';
import { routes } from '@/constants/routes';
import { spacing } from '@/theme/spacing';
import {
  AmountField,
  InvoiceHeader,
  InvoiceItemsEditor,
  InvoiceMiniCard,
  invoiceStatusIdToName,
  invoiceStatusNameToId,
  InvoiceTotalsCard,
  NoticeBanner,
  PickerSheet,
  SelectField,
  TextField,
} from './components';
import { compareInvoiceDates, formatAmountInput, getInvoiceSubtotal, parseAmount } from './invoice-utils';
import { addInvoice, findInvoiceNumber } from './invoices-store';
import { invoiceDueDateOptions, invoiceIssueDateOptions, invoiceStatusOptions, type Invoice, type InvoiceItem, type InvoiceStatusId } from './invoices-data';

type PickerType = 'issue' | 'due' | 'status' | null;

type InvoiceFormErrors = {
  clientName?: string;
  invoiceNumber?: string;
  issueDate?: string;
  dueDate?: string;
  items?: string;
  paid?: string;
};

export function AddInvoiceScreen() {
  const insets = useSafeAreaInsets();
  const savingRef = useRef(false);
  const [clientName, setClientName] = useState('شركة الأفق الرقمية');
  const [invoiceNumber, setInvoiceNumber] = useState('INV-2026-1051');
  const [issueDate, setIssueDate] = useState('23 يوليو 2026');
  const [dueDate, setDueDate] = useState('23 أغسطس 2026');
  const [discount, setDiscount] = useState('0');
  const [tax, setTax] = useState('0');
  const [paid, setPaid] = useState('0');
  const [status, setStatus] = useState<InvoiceStatusId>('awaiting-payment');
  const [notes, setNotes] = useState('يرجى السداد خلال 30 يومًا');
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: 'draft-item-1', description: 'خدمات تطوير وتصميم', quantity: 1, unitPrice: 12500 },
    { id: 'draft-item-2', description: 'دعم فني شهري', quantity: 1, unitPrice: 1500 },
  ]);
  const [picker, setPicker] = useState<PickerType>(null);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const parsedDiscount = parseAmount(discount) ?? 0;
  const parsedTax = parseAmount(tax) ?? 0;
  const parsedPaid = parseAmount(paid) ?? 0;
  const subtotal = getInvoiceSubtotal({ items });
  const total = Math.max(subtotal - parsedDiscount + parsedTax, 0);
  const errors = useMemo(
    () => validateInvoiceForm({ clientName, discount: parsedDiscount, dueDate, invoiceNumber, issueDate, items, paid: parsedPaid, tax: parsedTax, total }),
    [clientName, dueDate, invoiceNumber, issueDate, items, parsedDiscount, parsedPaid, parsedTax, total],
  );
  const blockingError = Boolean(errors.clientName || errors.invoiceNumber || errors.issueDate || errors.dueDate || errors.items || errors.paid);
  const previewInvoice: Invoice = {
    id: 'preview-invoice',
    clientName: clientName.trim() || 'شركة الأفق الرقمية',
    invoiceNumber: invoiceNumber.trim() || 'INV-2026-1051',
    issueDate,
    dueDate,
    discount: Math.max(parsedDiscount, 0),
    tax: Math.max(parsedTax, 0),
    paid: Math.max(parsedPaid, 0),
    status,
    notes,
    createdAt: issueDate,
    items,
    payments: [],
  };

  function handleSave() {
    if (savingRef.current) {
      return;
    }

    setSubmitted(true);

    if (blockingError) {
      return;
    }

    savingRef.current = true;
    setSaving(true);
    addInvoice({
      clientName: clientName.trim(),
      discount: Math.max(parsedDiscount, 0),
      dueDate,
      invoiceNumber: invoiceNumber.trim(),
      issueDate,
      items,
      notes: notes.trim(),
      paid: Math.max(parsedPaid, 0),
      status,
      tax: Math.max(parsedTax, 0),
    });
    router.replace(routes.invoices);
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
              paddingTop: Math.max(insets.top + spacing.sm, 48),
            },
          ]}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <InvoiceHeader onBack={() => router.back()} subtitle="أنشئ فاتورة جديدة لمتابعة التحصيل" title="إضافة فاتورة" />

          <NoticeBanner message="هذه الفاتورة مخصصة للمتابعة داخل التطبيق، ولا يتم إرسالها أو تحصيلها تلقائيًا." tone="warning" />

          <TextField error={submitted ? errors.clientName : undefined} label="اسم العميل" onChangeText={setClientName} placeholder="مثال: شركة الأفق الرقمية" value={clientName} />
          <TextField error={submitted ? errors.invoiceNumber : undefined} label="رقم الفاتورة" ltr onChangeText={setInvoiceNumber} placeholder="INV-2026-1051" value={invoiceNumber} />

          <View style={styles.twoColumns}>
            <SelectField error={submitted ? errors.issueDate : undefined} iconName="calendar-outline" label="تاريخ الإصدار" onPress={() => setPicker('issue')} value={issueDate} />
            <SelectField error={submitted ? errors.dueDate : undefined} iconName="calendar-outline" label="تاريخ الاستحقاق" onPress={() => setPicker('due')} value={dueDate} />
          </View>

          <InvoiceItemsEditor itemError={submitted ? errors.items : undefined} items={items} onAddItem={addItem} onChangeItem={updateItem} onRemoveItem={removeItem} />

          <View style={styles.twoColumns}>
            <AmountField label="الخصم" onChangeText={(value) => setDiscount(formatAmountInput(value))} value={discount} />
            <AmountField label="الضريبة" onChangeText={(value) => setTax(formatAmountInput(value))} value={tax} />
          </View>
          <InvoiceTotalsCard discount={parsedDiscount} subtotal={subtotal} tax={parsedTax} total={total} />

          <SelectField iconName="time-outline" label="حالة الدفع" onPress={() => setPicker('status')} value={invoiceStatusIdToName(status)} />
          {(status === 'paid' || status === 'partially-paid') && (
            <AmountField error={submitted ? errors.paid : undefined} label="المبلغ المدفوع" onChangeText={(value) => setPaid(formatAmountInput(value))} value={paid} />
          )}
          <TextField label="ملاحظات" onChangeText={setNotes} placeholder="اختياري" value={notes} />

          <View style={styles.section}>
            <AppText variant="cardTitle">معاينة الفاتورة</AppText>
            <InvoiceMiniCard invoice={previewInvoice} />
          </View>

          <AppButton disabled={blockingError || saving} iconName="checkmark-outline" loading={saving} onPress={handleSave}>
            حفظ الفاتورة
          </AppButton>
          <AppButton onPress={() => router.back()} variant="ghost">
            إلغاء
          </AppButton>
        </ScrollView>
      </KeyboardAvoidingView>

      <PickerSheet
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
    </View>
  );
}

function validateInvoiceForm({
  clientName,
  dueDate,
  invoiceNumber,
  issueDate,
  items,
  paid,
  total,
}: {
  clientName: string;
  discount: number;
  dueDate: string;
  invoiceNumber: string;
  issueDate: string;
  items: InvoiceItem[];
  paid: number;
  tax: number;
  total: number;
}) {
  const errors: InvoiceFormErrors = {};

  if (!clientName.trim()) {
    errors.clientName = 'يرجى إدخال اسم العميل';
  }

  if (!invoiceNumber.trim()) {
    errors.invoiceNumber = 'يرجى إدخال رقم الفاتورة';
  } else if (findInvoiceNumber(invoiceNumber.trim())) {
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

  if (paid > total) {
    errors.paid = 'المبلغ المدفوع لا يمكن أن يتجاوز إجمالي الفاتورة';
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
  twoColumns: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  section: {
    gap: spacing.md,
  },
});
