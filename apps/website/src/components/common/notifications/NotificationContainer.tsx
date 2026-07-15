"use client";

import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NotificationCard } from "./NotificationCard";

export type ToastNotification = {
  id: number | string;
  title: string;
  message: string;
  duration?: number;
};

export type NotificationContainerHandle = {
  addNotification: (notif: ToastNotification) => void;
};

const NotificationContainer = forwardRef<NotificationContainerHandle>(
  (_, ref) => {
    const [notifications, setNotifications] = useState<ToastNotification[]>([]);

    const addNotification = useCallback((notif: ToastNotification) => {
      setNotifications((prev) => [...prev, notif]);
    }, []);

    const removeNotification = useCallback((id: number | string) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        addNotification,
      }),
      [addNotification]
    );

    return (
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 items-end pointer-events-none">
        <AnimatePresence initial={false}>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              className="pointer-events-auto"
            >
              <NotificationCard
                key={notif.id}
                id={notif.id}
                title={notif.title}
                message={notif.message}
                duration={notif.duration ?? 3000}
                onClose={(id) => removeNotification(id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }
);

NotificationContainer.displayName = "NotificationContainer";

export default NotificationContainer;
