import { toCurrency } from '../currency.util';

describe('Currency Util', () => {
  describe('toCurrency', () => {
    it('should format the price as VND by default', () => {
      const result = toCurrency({ price: 0 });

      expect(result).toBe('0');
    });

    it('should format the price in USD when specified', () => {
      const result = toCurrency({ price: 1234.56, locale: 'en-US', currency: 'USD', style: 'currency' });

      expect(result).toBe('$1,234.56');
    });

    it('should format the price in EUR when specified', () => {
      const result = toCurrency({ price: 1234.56, locale: 'de-DE', currency: 'EUR', style: 'currency' });

      expect(result).toBe('1.234,56 €');
    });

    it('should format the price as a decimal when style is decimal', () => {
      const result = toCurrency({ price: 1234.56, locale: 'en-US', style: 'decimal' });

      expect(result).toBe('1,234.56');
    });

    it('should format the price as a percentage when style is percent', () => {
      const result = toCurrency({ price: 0.123, locale: 'en-US', style: 'percent' });

      expect(result).toBe('12%');
    });
  });
});
