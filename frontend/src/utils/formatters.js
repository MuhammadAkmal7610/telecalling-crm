import { format, parseISO } from 'date-fns';

export const formatDate = (dateString, formatStr = 'MMM dd, yyyy') => {
  if (!dateString) return '-';
  try {
    return format(parseISO(dateString), formatStr);
  } catch (error) {
    return dateString;
  }
};

export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '-';
  // Simple formatting for Indian numbers, can be expanded
  const cleaned = ('' + phoneNumber).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{5})(\d{5})$/);
  if (match) {
    return `+${match[1]} ${match[2]}-${match[3]}`;
  }
  return phoneNumber;
};
