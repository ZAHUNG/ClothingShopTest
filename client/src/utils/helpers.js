// Format price to Vietnamese currency format
export const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

// Format date to Vietnamese format
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Get order status color class
export const getOrderStatusColor = (status) => {
  switch (status) {
    case 'Đang xử lý':
      return 'text-yellow-600';
    case 'Đã giao hàng':
      return 'text-green-600';
    case 'Đã hủy':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};
