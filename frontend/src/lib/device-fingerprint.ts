import FingerprintJS from '@fingerprintjs/fingerprintjs';

let fingerprintPromise: Promise<string> | null = null;

/**
 * Get device fingerprint for tracking and security
 * Uses FingerprintJS to generate a unique browser fingerprint
 * Result is cached for performance
 */
export async function getDeviceFingerprint(): Promise<string> {
  if (!fingerprintPromise) {
    fingerprintPromise = (async () => {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        return result.visitorId;
      } catch (error) {
        console.error('Failed to generate device fingerprint:', error);
        // Fallback to a random string if fingerprinting fails
        return `fallback-${Math.random().toString(36).substring(2, 15)}`;
      }
    })();
  }
  return fingerprintPromise;
}

/**
 * Clear cached fingerprint (useful for testing)
 */
export function clearDeviceFingerprint() {
  fingerprintPromise = null;
}
