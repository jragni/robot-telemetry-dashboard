import { useState, useEffect } from 'react';
import type { Observable } from 'rxjs';

import { createLogger } from '@/lib/logger';

const log = createLogger('useObservable');

export function useObservable<T>(
  observable$: Observable<T>,
  initialValue: T
): T {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    const subscription = observable$.subscribe({
      next: setValue,
      error: (err) => log.error('Observable error:', err),
    });
    return () => subscription.unsubscribe();
  }, [observable$]);

  return value;
}
