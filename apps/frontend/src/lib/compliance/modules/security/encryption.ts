/**
 * Encryption Module
 * Simple encryption utilities for sensitive data
 */

/**
 * Simple string obfuscation (for demo purposes)
 * In production, use proper encryption libraries
 */
export function obfuscateString(input: string): string {
  if (!input) return '';

  // Simple base64 encoding with rotation
  const encoded = btoa(input);
  return encoded.split('').reverse().join('');
}

/**
 * Deobfuscate string
 */
export function deobfuscateString(obfuscated: string): string {
  if (!obfuscated) return '';

  try {
    const reversed = obfuscated.split('').reverse().join('');
    return atob(reversed);
  } catch {
    return '';
  }
}

/**
 * Hash sensitive data (simple hash for demo)
 */
export function hashSensitiveData(input: string): string {
  if (!input) return '';

  // Simple hash function (use proper crypto in production)
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(16);
}

/**
 * Mask sensitive data for display
 */
export function maskSensitiveData(
  input: string,
  visibleChars: number = 4
): string {
  if (!input || input.length <= visibleChars) return '*'.repeat(input.length);

  const visible = input.slice(-visibleChars);
  const masked = '*'.repeat(input.length - visibleChars);

  return masked + visible;
}

/**
 * Generate secure random string
 */
export function generateSecureToken(length: number = 32): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}
