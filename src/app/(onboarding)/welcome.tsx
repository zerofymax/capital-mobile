import { Redirect } from 'expo-router';

import { routes } from '@/constants/routes';

export default function OnboardingWelcomeRoute() {
  return <Redirect href={routes.financialSetupBusinessInfo} />;
}
