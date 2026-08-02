import { useSyncExternalStore } from 'react';

export type QuickAccessCodeState = {
  isEnabled: boolean;
  code: string | null;
};

const initialQuickAccessCodeState: QuickAccessCodeState = {
  isEnabled: false,
  code: null,
};

let quickAccessCodeState = initialQuickAccessCodeState;
const listeners = new Set<() => void>();

function emitQuickAccessCodeChange() {
  listeners.forEach((listener) => listener());
}

export function getQuickAccessCodeState() {
  return quickAccessCodeState;
}

export function subscribeQuickAccessCode(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useQuickAccessCodeState() {
  return useSyncExternalStore(subscribeQuickAccessCode, getQuickAccessCodeState, getQuickAccessCodeState);
}

export function setQuickAccessCode(code: string) {
  quickAccessCodeState = {
    isEnabled: true,
    code,
  };
  emitQuickAccessCodeChange();
}

export function verifyQuickAccessCode(code: string) {
  return quickAccessCodeState.isEnabled && quickAccessCodeState.code === code;
}

export function changeQuickAccessCode(currentCode: string, nextCode: string) {
  if (!verifyQuickAccessCode(currentCode)) {
    return false;
  }

  setQuickAccessCode(nextCode);
  return true;
}

export function removeQuickAccessCode() {
  quickAccessCodeState = {
    isEnabled: false,
    code: null,
  };
  emitQuickAccessCodeChange();
}

export function isWeakQuickAccessCode(code: string) {
  return ['0000', '1111', '1234', '4321'].includes(code);
}

export function normalizeQuickAccessCode(value: string) {
  return value.replace(/\D/g, '').slice(0, 4);
}
