import type { ImportedTransactionDraft, ValidatedImportRow } from './data-transfer-types';

export function createDuplicateKey(transaction: ImportedTransactionDraft) {
  return [
    transaction.date,
    transaction.type,
    Math.round(transaction.amount * 100) / 100,
    normalizeKeyPart(transaction.description),
    normalizeKeyPart(transaction.reference),
  ].join('|');
}

export function detectDuplicateRows(validatedRows: readonly ValidatedImportRow[], existingKeys: ReadonlySet<string>) {
  const seenKeys = new Set(existingKeys);

  return validatedRows.map((row) => {
    if (!row.draft || row.status === 'error') {
      return row;
    }

    const duplicateKey = createDuplicateKey(row.draft);

    if (seenKeys.has(duplicateKey)) {
      return { ...row, status: 'duplicate' as const, duplicateKey, errors: ['عملية مكررة'] };
    }

    seenKeys.add(duplicateKey);
    return { ...row, duplicateKey };
  });
}

function normalizeKeyPart(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('ar-SA');
}
