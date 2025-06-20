export function toCurrency({
  price,
  locale = 'vi-VN',
  currency = 'VND',
  style = 'decimal',
}: {
  price: number;
  locale?: string;
  currency?: string;
  style?: 'decimal' | 'currency' | 'percent' | 'unit';
}) {
  const priceFormatted = new Intl.NumberFormat(
    locale, // BCP 47 language tag
    {
      style,
      currency, // ISO 4217 currency code
    },
  ).format(price);

  return priceFormatted;
}
