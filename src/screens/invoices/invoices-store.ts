import { useSyncExternalStore } from 'react';

import { formatInvoiceDateForDisplay, getInvoiceSubtotal, getStatusFromPayment } from './invoice-utils';
import { initialInvoices, type Invoice, type InvoiceItem, type InvoicePayment, type InvoiceStatusId } from './invoices-data';

export type InvoiceDraft = {
  clientName: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  discount: number;
  tax: number;
  paid: number;
  status: InvoiceStatusId;
  notes: string;
  items: InvoiceItem[];
};

export type PaymentDraft = {
  amount: number;
  method: string;
  date: string;
  reference: string;
  note?: string;
};

export type InvoicesSnapshot = {
  invoices: Invoice[];
  notice: string | null;
};

const listeners = new Set<() => void>();

let snapshot: InvoicesSnapshot = {
  invoices: initialInvoices,
  notice: null,
};

function emit(nextSnapshot: InvoicesSnapshot) {
  snapshot = nextSnapshot;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function useInvoicesStore() {
  return useSyncExternalStore(subscribe, () => snapshot, () => snapshot);
}

export function getInvoicesSnapshot() {
  return snapshot;
}

export function replaceInvoices(invoices: readonly Invoice[]) {
  emit({ invoices: [...invoices], notice: null });
}

export function addInvoice(draft: InvoiceDraft) {
  const subtotal = getInvoiceSubtotal({ items: draft.items });
  const total = Math.max(subtotal - draft.discount + draft.tax, 0);
  const paid = Math.min(draft.paid, total);
  const invoice: Invoice = {
    ...draft,
    id: `invoice-${draft.invoiceNumber.toLowerCase()}-${Date.now()}`,
    paid,
    status: getStatusFromPayment(total, paid, draft.status),
    createdAt: draft.issueDate,
    paymentDate: paid >= total && total > 0 ? draft.dueDate : undefined,
    payments:
      paid > 0
        ? [
            {
              id: `payment-initial-${Date.now()}`,
              amount: paid,
              date: draft.issueDate,
              method: 'إضافة يدوية',
              reference: `PAY-${Date.now()}`,
            },
          ]
        : [],
  };

  emit({ invoices: [...snapshot.invoices, invoice], notice: 'تمت إضافة الفاتورة بنجاح' });
}

export function updateInvoice(id: string, draft: InvoiceDraft) {
  emit({
    invoices: snapshot.invoices.map((invoice) => {
      if (invoice.id !== id) {
        return invoice;
      }

      const subtotal = getInvoiceSubtotal({ items: draft.items });
      const total = Math.max(subtotal - draft.discount + draft.tax, 0);
      const paid = Math.min(invoice.paid, total);

      return {
        ...invoice,
        ...draft,
        paid,
        status: getStatusFromPayment(total, paid, draft.status),
        payments: invoice.payments,
        paymentDate: paid >= total && total > 0 ? invoice.paymentDate ?? draft.dueDate : undefined,
      };
    }),
    notice: 'تم تحديث الفاتورة بنجاح',
  });
}

export function recordPayment(invoiceId: string, draft: PaymentDraft) {
  let paidInFull = false;

  const invoices = snapshot.invoices.map((invoice) => {
    if (invoice.id !== invoiceId) {
      return invoice;
    }

    const total = Math.max(getInvoiceSubtotal({ items: invoice.items }) - invoice.discount + invoice.tax, 0);
    const remaining = Math.max(total - invoice.paid, 0);
    const amount = Math.min(draft.amount, remaining);
    const nextPaid = Math.min(invoice.paid + amount, total);
    paidInFull = total > 0 && nextPaid >= total;
    const payment: InvoicePayment = {
      id: `payment-${Date.now()}`,
      amount,
      date: draft.date,
      method: draft.method,
      reference: draft.reference,
      note: draft.note,
    };

    const status: InvoiceStatusId = paidInFull ? 'paid' : 'partially-paid';

    return {
      ...invoice,
      paid: nextPaid,
      status,
      paymentDate: paidInFull ? draft.date : invoice.paymentDate,
      payments: [...invoice.payments, payment],
    };
  });

  emit({
    invoices,
    notice: paidInFull ? 'تم تحصيل كامل قيمة الفاتورة' : 'تمت إضافة الدفعة بنجاح',
  });
}

export function markInvoiceAsPaid(invoiceId: string) {
  const paymentDate = formatInvoiceDateForDisplay(new Date(), true);
  const invoices = snapshot.invoices.map((invoice) => {
    if (invoice.id !== invoiceId) {
      return invoice;
    }

    const total = Math.max(getInvoiceSubtotal({ items: invoice.items }) - invoice.discount + invoice.tax, 0);
    const remaining = Math.max(total - invoice.paid, 0);

    return {
      ...invoice,
      paid: total,
      status: 'paid' as const,
      paymentDate,
      payments:
        remaining > 0
          ? [
              ...invoice.payments,
              {
                id: `payment-mark-paid-${Date.now()}`,
                amount: remaining,
                date: paymentDate,
                method: 'تحويل بنكي',
                reference: `PAY-${Date.now()}`,
                note: 'تحديد الفاتورة كمدفوعة',
              },
            ]
          : invoice.payments,
    };
  });

  emit({ invoices, notice: 'تم تحديث الفاتورة كمدفوعة' });
}

export function deleteInvoice(id: string) {
  emit({
    invoices: snapshot.invoices.filter((invoice) => invoice.id !== id),
    notice: 'تم حذف الفاتورة',
  });
}

export function findInvoiceNumber(invoiceNumber: string, excludeId?: string) {
  return snapshot.invoices.find((invoice) => invoice.invoiceNumber === invoiceNumber && invoice.id !== excludeId);
}

export function findPaymentReference(reference: string) {
  return snapshot.invoices.some((invoice) => invoice.payments.some((payment) => payment.reference === reference));
}

export function clearInvoicesNotice() {
  if (snapshot.notice) {
    emit({ ...snapshot, notice: null });
  }
}
