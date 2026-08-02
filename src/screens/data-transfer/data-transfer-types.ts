export type CsvDelimiter = ',' | ';' | '\t';

export type CsvRawRow = Record<string, string>;

export type CsvParseError = {
  rowNumber: number;
  message: string;
};

export type CsvParseResult = {
  headers: string[];
  rows: CsvRawRow[];
  delimiter: CsvDelimiter;
  errors: CsvParseError[];
};

export type CsvColumnMapping = {
  date?: string;
  description?: string;
  amount?: string;
  type?: string;
  category?: string;
  reference?: string;
  notes?: string;
  party?: string;
  account?: string;
};

export type CsvDateFormat = 'yyyy-mm-dd' | 'dd/mm/yyyy' | 'dd-mm-yyyy' | 'ambiguous';

export type ImportedTransactionType = 'income' | 'expense';

export type ImportedTransactionDraft = {
  rowNumber: number;
  date: string;
  description: string;
  amount: number;
  type: ImportedTransactionType;
  category: string;
  reference: string;
  notes: string;
  party: string;
  account: string;
};

export type ImportRowStatus = 'valid' | 'duplicate' | 'error';

export type ValidatedImportRow = {
  rowNumber: number;
  status: ImportRowStatus;
  draft?: ImportedTransactionDraft;
  errors: string[];
  duplicateKey?: string;
};

export type ImportSummary = {
  totalRows: number;
  validRows: number;
  duplicateRows: number;
  errorRows: number;
  detectedDateFormat: CsvDateFormat;
};

export type ImportResult = {
  importedCount: number;
  duplicateSkipped: number;
  errorSkipped: number;
};

export type ExportDatasetType =
  | 'transactions'
  | 'invoices'
  | 'recurring_expenses'
  | 'budgets'
  | 'goals'
  | 'milestones'
  | 'financial_summary';

export type ExportPeriod =
  | 'current-month'
  | 'previous-month'
  | 'last-3-months'
  | 'last-6-months'
  | 'current-year'
  | 'all';

export type CsvExportValue = string | number | boolean | null | undefined;

export type CsvExportRow = Record<string, CsvExportValue>;

export type ExportDatasetSummary = {
  dataset: ExportDatasetType;
  label: string;
  rowCount: number;
};

export type DataExportPreview = {
  fileName: string;
  createdAt: string;
  rows: CsvExportRow[];
  previewRows: CsvExportRow[];
  summaries: ExportDatasetSummary[];
  csvText: string;
};
