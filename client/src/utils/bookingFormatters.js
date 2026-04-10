// Shared formatters and badge helpers for booking-related UIs

export const formatDateTime = (dateString) => {
  if (!dateString) return '-';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-green-100 text-green-800 border border-green-300';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 border border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border border-gray-300';
  }
};

export const getPaymentBadgeClass = (status) => {
  switch (status) {
    case 'PAID':
      return 'bg-green-100 text-green-800 border border-green-300';
    case 'UNPAID':
      return 'bg-red-100 text-red-800 border border-red-300';
    case 'REFUNDED':
      return 'bg-blue-100 text-blue-800 border border-blue-300';
    case 'FAILED':
      return 'bg-orange-100 text-orange-800 border border-orange-300';
    default:
      return 'bg-gray-100 text-gray-800 border border-gray-300';
  }
};
