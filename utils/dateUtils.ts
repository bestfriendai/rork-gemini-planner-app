export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const formatTime = (date: Date): string => {
  return date.toTimeString().substring(0, 5);
};

export const formatDateForDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

export const getCurrentDate = (): string => {
  return formatDate(new Date());
};

export const getDaysOfWeek = (date: Date): string[] => {
  const day = date.getDay();
  const result = [];
  
  // Get the date of the Sunday at the beginning of the week
  const sunday = new Date(date);
  sunday.setDate(date.getDate() - day);
  
  // Generate dates for the whole week
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(sunday);
    currentDate.setDate(sunday.getDate() + i);
    result.push(formatDate(currentDate));
  }
  
  return result;
};

export const isToday = (dateString: string): boolean => {
  const today = getCurrentDate();
  return dateString === today;
};

export const isSameDay = (date1: string, date2: string): boolean => {
  return date1 === date2;
};