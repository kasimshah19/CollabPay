import { describe, it, expect } from 'vitest';
import { 
  rupeesToPaise, 
  applyBps, 
  calculatePayout, 
  PLATFORM_FEE_BPS, 
  GST_BPS, 
  TDS_BPS 
} from './money';

describe('money math', () => {
  describe('rupeesToPaise', () => {
    it('converts correctly', () => {
      expect(rupeesToPaise(5000)).toBe(500000);
      expect(rupeesToPaise(10.5)).toBe(1050);
      expect(rupeesToPaise(0.14)).toBe(14);
      expect(rupeesToPaise(0)).toBe(0);
    });

    it('throws on invalid inputs', () => {
      expect(() => rupeesToPaise(-5)).toThrow();
      expect(() => rupeesToPaise(NaN)).toThrow();
      expect(() => rupeesToPaise(10.555)).toThrow(/decimal places/);
      // @ts-ignore
      expect(() => rupeesToPaise('10')).toThrow();
    });
  });

  describe('applyBps', () => {
    it('applies bps and rounds half up correctly', () => {
      // 15 paise * 10% = 1.5 paise -> rounds to 2
      expect(applyBps(15, 1000)).toBe(2);
      // 14 paise * 10% = 1.4 paise -> rounds to 1
      expect(applyBps(14, 1000)).toBe(1);
    });

    it('throws on invalid amounts', () => {
      expect(() => applyBps(-10, 1000)).toThrow();
      expect(() => applyBps(10.5, 1000)).toThrow();
    });
  });

  describe('calculatePayout', () => {
    it('matches the exact Rs 5,000 example', () => {
      // Fee Rs 5,000 -> 500,000 paise
      const res = calculatePayout(500000);
      
      expect(res.feePaise).toBe(500000);
      expect(res.platformFeePaise).toBe(50000); // 10% of 500k
      expect(res.gstPaise).toBe(9000); // 18% of 50k
      expect(res.tdsPaise).toBe(5000); // 1% of 500k
      
      expect(res.creatorNetPaise).toBe(495000); // 500k - 5k
      expect(res.brandTotalPaise).toBe(559000); // 500k + 50k + 9k
    });

    it('maintains invariants for zero fee', () => {
      const res = calculatePayout(0);
      expect(res.creatorNetPaise + res.tdsPaise).toBe(res.feePaise);
      expect(res.brandTotalPaise).toBe(res.feePaise + res.platformFeePaise + res.gstPaise);
    });

    it('maintains invariants for odd amounts', () => {
      const res = calculatePayout(12345); // 123.45 Rs
      expect(res.creatorNetPaise + res.tdsPaise).toBe(res.feePaise);
      expect(res.brandTotalPaise).toBe(res.feePaise + res.platformFeePaise + res.gstPaise);
    });
  });
});
