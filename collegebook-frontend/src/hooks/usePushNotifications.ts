import { useState, useEffect } from 'react';
import { subscribeToPushNotifications, unsubscribeFromPushNotifications } from '@/lib/api/notifications';

// Utility to convert VAPID public key
const urlB64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      
      // Check existing subscription
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(sub => {
          setSubscription(sub);
        });
      });
    }
  }, []);

  const requestPermissionAndSubscribe = async () => {
    if (!isSupported) {
      console.warn('Push notifications are not supported by this browser');
      return false;
    }

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        
        // Ensure VITE_VAPID_PUBLIC_KEY is available
        const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          console.error('VITE_VAPID_PUBLIC_KEY is missing from environment variables');
          return false;
        }

        const applicationServerKey = urlB64ToUint8Array(vapidPublicKey);

        // Subscribing browser
        let sub = await registration.pushManager.getSubscription();
        if (!sub) {
          sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey,
          });
        }
        
        setSubscription(sub);

        // Send to backend
        await subscribeToPushNotifications(sub);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error subscribing to push notifications', error);
      return false;
    }
  };

  const unsubscribe = async () => {
    if (subscription) {
      try {
        await unsubscribeFromPushNotifications(subscription.endpoint);
        await subscription.unsubscribe();
        setSubscription(null);
        return true;
      } catch (error) {
        console.error('Error unsubscribing from push notifications', error);
        return false;
      }
    }
    return true;
  };

  return {
    isSupported,
    permission,
    isSubscribed: !!subscription,
    subscribe: requestPermissionAndSubscribe,
    unsubscribe,
  };
};
