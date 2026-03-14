import { describe, it, expect } from 'vitest';

// A simple utility to test formatting
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

describe('formatCurrency', () => {
  it('should format numbers to VND currency', () => {
    // Note: space might be NBSP or other depending on environment, using regex or partial match
    const result = formatCurrency(100000);
    expect(result).toContain('100.000');
    expect(result).toContain('₫');
  });

  it('should handle zero correctly', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
    expect(result).toContain('₫');
  });
});
