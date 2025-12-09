/**
 * Check if a date is expired (past today)
 */
export const isExpired = (dateStr: string | null | undefined): boolean => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date < today;
};

/**
 * Check if a date is expiring soon (within next 30 days)
 */
export const isExpiringSoon = (dateStr: string | null | undefined): boolean => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  date.setHours(0, 0, 0, 0);
  return date >= today && date <= thirtyDaysFromNow;
};

/**
 * Get the status of a date (expired, expiring_soon, or valid)
 */
export const getDateStatus = (dateStr: string | null | undefined): 'expired' | 'expiring_soon' | 'valid' => {
  if (!dateStr) return 'valid';
  if (isExpired(dateStr)) return 'expired';
  if (isExpiringSoon(dateStr)) return 'expiring_soon';
  return 'valid';
};

/**
 * Format date for display (DD/MM/YY)
 */
export const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};


