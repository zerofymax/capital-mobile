import { useSyncExternalStore } from 'react';

export type ProfileAvatarType = 'initial' | 'icon';
export type ProfileAvatarColorId = 'green' | 'blue' | 'gold' | 'purple' | 'gray';

export type UserProfileState = {
  displayName: string;
  email: string;
  phone: string;
  jobTitle: string;
  avatarType: ProfileAvatarType;
  avatarInitial: string;
  avatarColor: ProfileAvatarColorId;
};

export const profileAvatarColors: readonly {
  id: ProfileAvatarColorId;
  label: string;
  value: string;
  border: string;
}[] = [
  { id: 'green', label: 'أخضر', value: 'rgba(31,90,58,0.34)', border: 'rgba(167,200,161,0.38)' },
  { id: 'blue', label: 'أزرق', value: 'rgba(32,87,143,0.32)', border: 'rgba(92,171,255,0.34)' },
  { id: 'gold', label: 'ذهبي', value: 'rgba(150,101,24,0.32)', border: 'rgba(232,163,61,0.34)' },
  { id: 'purple', label: 'بنفسجي', value: 'rgba(104,76,156,0.32)', border: 'rgba(180,145,255,0.30)' },
  { id: 'gray', label: 'رمادي', value: 'rgba(124,135,151,0.24)', border: 'rgba(214,218,225,0.22)' },
];

const defaultAvatarColor = profileAvatarColors[0]!;

const initialUserProfile: UserProfileState = {
  displayName: 'عبدالله',
  email: 'abdullah@capital.app',
  phone: '+966 50 000 0000',
  jobTitle: 'مالك نشاط',
  avatarType: 'initial',
  avatarInitial: 'ع',
  avatarColor: 'green',
};

let currentUserProfile = initialUserProfile;
const listeners = new Set<() => void>();

function emitUserProfileChange() {
  listeners.forEach((listener) => listener());
}

export function getProfileInitial(displayName: string) {
  return displayName.trim().charAt(0) || 'م';
}

export function getUserProfile() {
  return currentUserProfile;
}

export function replaceUserProfile(profile: UserProfileState) {
  currentUserProfile = { ...profile };
  emitUserProfileChange();
}

export function subscribeUserProfile(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useUserProfile() {
  return useSyncExternalStore(subscribeUserProfile, getUserProfile, getUserProfile);
}

export function updateUserProfile(nextProfile: Partial<UserProfileState>) {
  const displayName = nextProfile.displayName?.trim() ?? currentUserProfile.displayName;
  const avatarType = nextProfile.avatarType ?? currentUserProfile.avatarType;

  currentUserProfile = {
    ...currentUserProfile,
    ...nextProfile,
    displayName,
    email: nextProfile.email?.trim() ?? currentUserProfile.email,
    phone: nextProfile.phone?.trim() ?? currentUserProfile.phone,
    jobTitle: nextProfile.jobTitle?.trim() ?? currentUserProfile.jobTitle,
    avatarType,
    avatarInitial: avatarType === 'initial' ? nextProfile.avatarInitial ?? getProfileInitial(displayName) : '',
  };
  emitUserProfileChange();

  return currentUserProfile;
}

export function resetUserProfile() {
  currentUserProfile = initialUserProfile;
  emitUserProfileChange();
}

export function getProfileAvatarColor(colorId: ProfileAvatarColorId) {
  return profileAvatarColors.find((color) => color.id === colorId) ?? defaultAvatarColor;
}
