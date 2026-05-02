export function formatUSD(amount: number): string {
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);
}

export function formatOG(amount: number): string {
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  
  if (safeAmount >= 1000000) {
    return (safeAmount / 1000000).toFixed(2) + 'M';
  }
  if (safeAmount >= 1000) {
    return (safeAmount / 1000).toFixed(2) + 'K';
  }
  return safeAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatOGShort(amount: number): string {
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  
  if (safeAmount >= 1000000) {
    return (safeAmount / 1000000).toFixed(1) + 'M';
  }
  if (safeAmount >= 1000) {
    return (safeAmount / 1000).toFixed(1) + 'K';
  }
  return safeAmount.toFixed(2);
}

export function formatTimeAgo(date: Date): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 'Unknown';
  }
  
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function calculateProgress(current: number, target: number): number {
  const safeCurrent = typeof current === 'number' && !isNaN(current) ? current : 0;
  const safeTarget = typeof target === 'number' && !isNaN(target) && target > 0 ? target : 1;
  
  const progress = (safeCurrent / safeTarget) * 100;
  return Math.min(100, Math.max(0, progress));
}

export function formatMilestone(target: number): string {
  const safeTarget = typeof target === 'number' && !isNaN(target) ? target : 0;
  return '$' + (safeTarget / 1000000) + 'M';
}

export function safeNumber(value: unknown, defaultValue: number = 0): number {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  return defaultValue;
}
