import { useCallback, useEffect, useState } from 'react';

type Permission = 'default' | 'granted' | 'denied' | 'unsupported';

export function useNotification() {
  const [permission, setPermission] = useState<Permission>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return window.Notification.permission as Permission;
  });

  useEffect(() => {
    if (permission === 'unsupported') return;
    setPermission(window.Notification.permission as Permission);
  }, [permission]);

  const request = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported');
      return 'unsupported' as const;
    }
    const result = await window.Notification.requestPermission();
    setPermission(result as Permission);
    return result;
  }, []);

  const notify = useCallback(
    (title: string, body?: string) => {
      if (permission !== 'granted') return;
      new window.Notification(title, {
        body,
        icon: '/favicon.svg',
      });
    },
    [permission],
  );

  return { permission, request, notify };
}
