// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(key: string): void {
    this.metrics.set(key, performance.now());
  }

  endTimer(key: string): number {
    const startTime = this.metrics.get(key);
    if (!startTime) {
      // Don't warn for timers that weren't started, just return 0
      return 0;
    }

    const duration = performance.now() - startTime;
    this.metrics.delete(key);
    
    // Log slow operations
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${key} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  measureAsync<T>(key: string, fn: () => Promise<T>): Promise<T> {
    this.startTimer(key);
    return fn().finally(() => {
      this.endTimer(key);
    });
  }
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), wait);
  };
}

// Throttle utility
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export const performanceMonitor = PerformanceMonitor.getInstance();