import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { projectNotificationService } from '../services/projectNotificationService';
import { db } from '../services/firebase';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  // Utiliser React Query pour gérer l'état et le cache
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.uid],
    queryFn: async () => {
      const snapshot = await db
        .collection('notifications')
        .where('recipients', 'array-contains', user.uid)
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));
    },
    enabled: !!user?.uid,
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unreadCount', user?.uid],
    queryFn: async () => {
      const doc = await db
        .collection('users')
        .doc(user.uid)
        .get();
      return doc.data()?.unreadNotifications || 0;
    },
    enabled: !!user?.uid,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId) => 
      projectNotificationService.markNotificationAsRead(notificationId, user.uid),
  });

  if (!user) return null;

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900"
      >
        <Bell className="w-6 h-6" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full"
            >
              {unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute right-0 w-80 mt-2 bg-white rounded-lg shadow-lg z-50"
          >
            <div className="p-4">
              <h3 className="text-lg font-medium mb-4">Notifications</h3>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"
                    />
                  </div>
                ) : notifications.length === 0 ? (
                  <p className="text-gray-500 text-center">No notifications</p>
                ) : (
                  <motion.div layout className="space-y-2">
                    {notifications.map(notification => (
                      <motion.div
                        layout
                        key={notification.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                        onClick={() => markAsReadMutation.mutate(notification.id)}
                      >
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {notification.timestamp.toLocaleDateString()}
                        </p>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;