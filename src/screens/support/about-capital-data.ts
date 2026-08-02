import Constants from 'expo-constants';

import packageJson from '../../../package.json';

export type AppVersionInfo = {
  versionLabel: string;
  buildNumber?: string;
  environmentLabel: string;
};

export type ReleaseNoteItem = {
  id: string;
  label: string;
};

export type AboutCapitalLinkItem = {
  id:
    | 'privacy'
    | 'terms'
    | 'open-source'
    | 'help-center'
    | 'send-feedback'
    | 'contact-support'
    | 'rate-app'
    | 'share-app';
  title: string;
  description: string;
  icon:
    | 'shield-checkmark-outline'
    | 'document-text-outline'
    | 'code-slash-outline'
    | 'help-circle-outline'
    | 'megaphone-outline'
    | 'chatbubbles-outline'
    | 'star-outline'
    | 'share-social-outline';
  soon?: boolean;
};

export type OpenSourceLicenseItem = {
  id: string;
  name: string;
  version: string;
  license: string;
  projectUrl: string;
};

type PackageJsonShape = {
  dependencies?: Record<string, string>;
};

const packageDependencies = (packageJson as PackageJsonShape).dependencies ?? {};

function cleanDependencyVersion(version: string | undefined, fallback: string) {
  const resolvedVersion = version ?? fallback;
  return resolvedVersion.replace(/^[~^]/, '') || fallback;
}

export function getAppVersionInfo(): AppVersionInfo {
  const expoConfig = Constants.expoConfig;
  const version = expoConfig?.version ?? packageJson.version;
  const iosBuildNumber = expoConfig?.ios?.buildNumber;
  const androidVersionCode = expoConfig?.android?.versionCode;
  const buildNumber =
    typeof iosBuildNumber === 'string'
      ? iosBuildNumber
      : typeof androidVersionCode === 'number'
        ? String(androidVersionCode)
        : undefined;

  return {
    buildNumber,
    environmentLabel: 'نسخة تجريبية محلية',
    versionLabel: `الإصدار ${version}`,
  };
}

export const releaseNotes: readonly ReleaseNoteItem[] = [
  { id: 'operations-invoices', label: 'تنظيم العمليات والفواتير.' },
  { id: 'saas-metrics', label: 'مؤشرات نمو شركات SaaS.' },
  { id: 'goals-budgets', label: 'الأهداف والمراحل المرتبطة بالميزانية.' },
  { id: 'company-update', label: 'تحديث الشركة الشهري.' },
  { id: 'recurring-reports', label: 'المصروفات المتكررة والتقارير المالية.' },
  { id: 'help-terms', label: 'مركز المساعدة والمصطلحات المالية.' },
];

export const legalInformationLinks: readonly AboutCapitalLinkItem[] = [
  {
    id: 'privacy',
    icon: 'shield-checkmark-outline',
    title: 'سياسة الخصوصية',
    description: 'كيف يتعامل Capital مع بياناتك وخصوصيتك.',
  },
  {
    id: 'terms',
    icon: 'document-text-outline',
    title: 'الشروط والأحكام',
    description: 'الشروط المنظمة لاستخدام التطبيق.',
  },
  {
    id: 'open-source',
    icon: 'code-slash-outline',
    title: 'تراخيص البرمجيات مفتوحة المصدر',
    description: 'المكتبات والتقنيات المستخدمة في بناء Capital.',
  },
];

export const helpAndContactLinks: readonly AboutCapitalLinkItem[] = [
  {
    id: 'help-center',
    icon: 'help-circle-outline',
    title: 'مركز المساعدة',
    description: 'إجابات وإرشادات لاستخدام النموذج.',
  },
  {
    id: 'send-feedback',
    icon: 'megaphone-outline',
    title: 'إرسال اقتراح أو الإبلاغ عن مشكلة',
    description: 'شاركنا رأيك أو أخبرنا عن مشكلة واجهتك.',
  },
  {
    id: 'contact-support',
    icon: 'chatbubbles-outline',
    title: 'التواصل مع الدعم',
    description: 'افتح نموذج التواصل الحالي داخل Capital.',
  },
];

export const appEngagementLinks: readonly AboutCapitalLinkItem[] = [
  {
    id: 'rate-app',
    icon: 'star-outline',
    title: 'تقييم Capital',
    description: 'سيكون متاحًا بعد توفر رابط متجر رسمي.',
    soon: true,
  },
  {
    id: 'share-app',
    icon: 'share-social-outline',
    title: 'مشاركة التطبيق',
    description: 'ستتوفر عند اعتماد رابط عام للتطبيق.',
    soon: true,
  },
];

export const openSourceLicenses: readonly OpenSourceLicenseItem[] = [
  {
    id: 'react',
    license: 'MIT',
    name: 'React',
    projectUrl: 'https://react.dev/',
    version: cleanDependencyVersion(packageDependencies.react, '19.2.3'),
  },
  {
    id: 'react-native',
    license: 'MIT',
    name: 'React Native',
    projectUrl: 'https://reactnative.dev/',
    version: cleanDependencyVersion(packageDependencies['react-native'], '0.86.0'),
  },
  {
    id: 'expo',
    license: 'MIT',
    name: 'Expo',
    projectUrl: 'https://github.com/expo/expo/tree/main/packages/expo',
    version: cleanDependencyVersion(packageDependencies.expo, '57.0.7'),
  },
  {
    id: 'expo-router',
    license: 'MIT',
    name: 'Expo Router',
    projectUrl: 'https://docs.expo.dev/routing/introduction/',
    version: cleanDependencyVersion(packageDependencies['expo-router'], '57.0.7'),
  },
];
