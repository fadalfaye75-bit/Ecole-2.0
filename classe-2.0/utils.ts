
export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  // Passing undefined as the first argument uses the browser's default locale
  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

export const isWithinDays = (dateStr: string, days: number): boolean => {
  const target = new Date(dateStr);
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays >= 0 && diffDays <= days;
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};
