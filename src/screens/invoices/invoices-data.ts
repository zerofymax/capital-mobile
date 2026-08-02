import type { Ionicons } from '@expo/vector-icons';

export type InvoiceStatusId = 'awaiting-payment' | 'due-soon' | 'overdue' | 'partially-paid' | 'paid' | 'cancelled';

export type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type InvoicePayment = {
  id: string;
  amount: number;
  date: string;
  method: string;
  reference: string;
  note?: string;
};

export type Invoice = {
  id: string;
  clientName: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  discount: number;
  tax: number;
  paid: number;
  status: InvoiceStatusId;
  notes: string;
  createdAt: string;
  paymentDate?: string;
  items: InvoiceItem[];
  payments: InvoicePayment[];
};

export type InvoiceStatusMeta = {
  id: InvoiceStatusId;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export const invoiceStatusOptions: InvoiceStatusMeta[] = [
  { id: 'awaiting-payment', label: 'بانتظار الدفع', icon: 'time-outline' },
  { id: 'due-soon', label: 'مستحقة قريبًا', icon: 'flag-outline' },
  { id: 'overdue', label: 'متأخرة', icon: 'warning-outline' },
  { id: 'partially-paid', label: 'مدفوعة جزئيًا', icon: 'home-outline' },
  { id: 'paid', label: 'مدفوعة', icon: 'checkmark-circle-outline' },
];

export const paymentMethodOptions = ['تحويل بنكي', 'بطاقة', 'نقدًا', 'شيك', 'أخرى'] as const;

export const invoiceIssueDateOptions = ['1 يوليو 2026', '10 يونيو 2026', '12 يوليو 2026', '23 يوليو 2026', '25 يونيو 2026'] as const;
export const invoiceDueDateOptions = ['15 يوليو 2026', '25 يوليو 2026', '28 يوليو 2026', '5 أغسطس 2026', '23 أغسطس 2026'] as const;

export const initialInvoices: Invoice[] = [
  {
    id: 'invoice-digital-horizon',
    clientName: 'شركة الأفق الرقمية',
    invoiceNumber: 'INV-2026-1042',
    issueDate: '1 يوليو 2026',
    dueDate: '28 يوليو 2026',
    discount: 0,
    tax: 0,
    paid: 0,
    status: 'due-soon',
    notes: 'يرجى السداد خلال 30 يومًا',
    createdAt: '1 يوليو 2026',
    items: [{ id: 'item-development', description: 'خدمات تطوير وتصميم', quantity: 1, unitPrice: 12500 }],
    payments: [],
  },
  {
    id: 'invoice-alrowad',
    clientName: 'مؤسسة الرواد',
    invoiceNumber: 'INV-2026-1038',
    issueDate: '25 يونيو 2026',
    dueDate: '25 يوليو 2026',
    discount: 0,
    tax: 0,
    paid: 3500,
    status: 'partially-paid',
    notes: 'دفعة جزئية مسجلة',
    createdAt: '25 يونيو 2026',
    items: [{ id: 'item-alrowad-services', description: 'خدمات رقمية شهرية', quantity: 1, unitPrice: 8750 }],
    payments: [
      {
        id: 'payment-alrowad-1',
        amount: 3500,
        date: '20 يوليو 2026',
        method: 'تحويل بنكي',
        reference: 'PAY-2026-0084',
      },
    ],
  },
  {
    id: 'invoice-masar-store',
    clientName: 'متجر المسار',
    invoiceNumber: 'INV-2026-1029',
    issueDate: '10 يونيو 2026',
    dueDate: '15 يوليو 2026',
    discount: 0,
    tax: 0,
    paid: 0,
    status: 'overdue',
    notes: 'فاتورة متأخرة تحتاج متابعة',
    createdAt: '10 يونيو 2026',
    items: [{ id: 'item-masar-commerce', description: 'خدمات إدارة متجر إلكتروني', quantity: 1, unitPrice: 6500 }],
    payments: [],
  },
  {
    id: 'invoice-tawazun-club',
    clientName: 'نادي التوازن',
    invoiceNumber: 'INV-2026-1047',
    issueDate: '12 يوليو 2026',
    dueDate: '5 أغسطس 2026',
    discount: 0,
    tax: 0,
    paid: 0,
    status: 'awaiting-payment',
    notes: 'متبقي 13 يومًا',
    createdAt: '12 يوليو 2026',
    items: [{ id: 'item-tawazun', description: 'اشتراك خدمات تشغيلية', quantity: 1, unitPrice: 4000 }],
    payments: [],
  },
  {
    id: 'invoice-nokhba',
    clientName: 'شركة النخبة',
    invoiceNumber: 'INV-2026-1016',
    issueDate: '1 يوليو 2026',
    dueDate: '18 يوليو 2026',
    discount: 0,
    tax: 0,
    paid: 11000,
    status: 'paid',
    notes: 'تم تحصيل الفاتورة بالكامل',
    createdAt: '1 يوليو 2026',
    paymentDate: '18 يوليو 2026',
    items: [{ id: 'item-nokhba', description: 'خدمات استشارية', quantity: 1, unitPrice: 11000 }],
    payments: [
      {
        id: 'payment-nokhba-1',
        amount: 11000,
        date: '18 يوليو 2026',
        method: 'تحويل بنكي',
        reference: 'PAY-2026-0079',
      },
    ],
  },
];
