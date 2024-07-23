import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../lib/firebase';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { useAnalytics } from '../hooks/useAnalytics';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

const NotificationBell: React.FC = () => {
  const [user] = useAuthState(auth);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { logAnalyticsEvent } = useAnalytics();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedNotifications: Notification[] = [];
      querySnapshot.forEach((doc) => {
        fetchedNotifications.push({ id: doc.id, ...doc.data() } as Notification);
      });
      setNotifications(fetchedNotifications);
    });

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), { read: true });
      logAnalyticsEvent('notification_read', { notificationId });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative">
          <Bell />
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
              {notifications.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <Card>
          <CardContent className="p-0">
            {notifications.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <li key={notification.id} className="p-4">
                    <p>{notification.message}</p>
                    <Button
                      variant="link"
                      onClick={() => markAsRead(notification.id)}
                      className="mt-2 text-sm"
                    >
                      Mark as read
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-4">No new notifications</p>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;