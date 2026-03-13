/**
 * Platform detection utilities for Capacitor (Android app) vs web portal.
 * These helpers let us conditionally adapt behavior WITHOUT affecting the web portal.
 */

/** Returns true when running inside the native Capacitor shell (Android APK) */
export const isNativeApp = () => {
  return typeof window !== 'undefined' && !!window.Capacitor?.isNativePlatform?.();
};

/** Returns true on mobile screen widths OR inside the native app */
export const isMobileView = () => {
  return isNativeApp() || (typeof window !== 'undefined' && window.innerWidth < 768);
};
