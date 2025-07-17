/**
 * Utility functions for formatting values in the UI
 */

/**
 * Format a number as currency with the specified currency symbol
 * @param value - The value to format
 * @param currency - The currency code (USD, EUR, etc.)
 * @param locale - The locale to use for formatting (defaults to 'en-US')
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number | string,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return `0.00 ${currency}`;
  }
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numValue);
  } catch (error) {
    // Fallback formatting if Intl is not supported or currency is invalid
    return `${numValue.toFixed(2)} ${currency}`;
  }
};

/**
 * Format a crypto amount with appropriate decimal places based on token
 * @param amount - The amount to format
 * @param token - The token symbol
 * @returns Formatted amount string
 */
export const formatCryptoAmount = (
  amount: number | string,
  token: string
): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return `0 ${token}`;
  }
  
  // Different tokens have different standard decimal places
  const decimalPlaces = getTokenDecimalPlaces(token);
  
  // Format the number with the appropriate decimal places
  return `${numAmount.toFixed(decimalPlaces)} ${token}`;
};

/**
 * Get the standard number of decimal places for a given token
 * @param token - The token symbol
 * @returns Number of decimal places
 */
const getTokenDecimalPlaces = (token: string): number => {
  const upperToken = token.toUpperCase();
  
  // Common decimal place standards
  switch (upperToken) {
    case 'BTC':
      return 8;
    case 'ETH':
    case 'DOT':
    case 'KSM':
      return 6;
    case 'SOL':
      return 4;
    default:
      return 2;
  }
};

/**
 * Format a wallet address for display (truncate middle)
 * @param address - The wallet address to format
 * @param startChars - Number of characters to show at start
 * @param endChars - Number of characters to show at end
 * @returns Formatted address string
 */
export const formatAddress = (
  address: string,
  startChars: number = 6,
  endChars: number = 4
): string => {
  if (!address || address.length <= startChars + endChars) {
    return address || '';
  }
  
  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
};

/**
 * Format a timestamp as a relative time (e.g. "2 hours ago")
 * @param timestamp - The timestamp to format
 * @returns Formatted relative time string
 */
export const formatRelativeTime = (timestamp: Date | string | number): string => {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

/**
 * Format a percentage value
 * @param value - The percentage value to format
 * @param decimalPlaces - Number of decimal places to show
 * @returns Formatted percentage string
 */
export const formatPercentage = (
  value: number | string,
  decimalPlaces: number = 2
): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '0%';
  }
  
  return `${numValue.toFixed(decimalPlaces)}%`;
};
