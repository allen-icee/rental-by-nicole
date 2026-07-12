import { useEffect, useState, useMemo } from 'react';
import { useFittings } from '../sales/useFittings';
import { useRentalBookings } from '../sales/useRentalBookings';
import { getManilaDate, parseManilaDate, formatDateManila } from "../../utils/date-utils";
import { differenceInCalendarDays } from "date-fns";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'fitting' | 'pickup' | 'return' | 'overdue' | 'cancelled';
  read: boolean;
};

export function useNotifications() {
  const { data: fittings } = useFittings();
  const { data: rentals } = useRentalBookings();
  
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('notification_read_ids') || '[]');
    } catch {
      return [];
    }
  });

  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(setPermission);
      }
    }
  }, []);

  const notifications = useMemo(() => {
    if (!fittings || !rentals) return [];

    const now = getManilaDate();
    const todayStr = formatDateManila(now, "yyyy-MM-dd");
    const notifs: NotificationItem[] = [];

    // Process Fittings
    fittings.forEach(f => {
      if (f.status === 'Scheduled') {
        const fDate = parseManilaDate(f.date);
        const fStr = formatDateManila(fDate, "yyyy-MM-dd");
        if (fStr === todayStr) {
          notifs.push({
            id: `fitting-today-${f.id}`,
            title: "Today's Fitting",
            message: `${f.representativeName} at ${f.time}`,
            date: now.toISOString(),
            type: 'fitting',
            read: readIds.includes(`fitting-today-${f.id}`)
          });
        } else if (fDate > now && differenceInCalendarDays(fDate, now) <= 3) {
          notifs.push({
            id: `fitting-upcoming-${f.id}`,
            title: "Upcoming Fitting",
            message: `${f.representativeName} on ${formatDateManila(fDate)}`,
            date: now.toISOString(),
            type: 'fitting',
            read: readIds.includes(`fitting-upcoming-${f.id}`)
          });
        }
      } else if (f.status === 'No Show' || f.status === 'Cancelled') {
        notifs.push({
          id: `fitting-cancelled-${f.id}`,
          title: "Fitting Cancelled/No Show",
          message: `${f.representativeName}`,
          date: now.toISOString(),
          type: 'cancelled',
          read: readIds.includes(`fitting-cancelled-${f.id}`)
        });
      }
    });

    // Process Rentals
    rentals.forEach(r => {
      if (r.status === 'Cancelled') return;

      const startDate = parseManilaDate(r.startDate);
      const endDate = r.endDate ? parseManilaDate(r.endDate) : startDate;
      const startStr = formatDateManila(startDate, "yyyy-MM-dd");
      const endStr = formatDateManila(endDate, "yyyy-MM-dd");

      if (r.status === 'Reserved' || r.status === 'Ready for Pickup') {
        if (startStr === todayStr) {
          notifs.push({
            id: `pickup-today-${r.id}`,
            title: "Pickup Today",
            message: `${r.customerName} - ${r.bookingNumber}`,
            date: now.toISOString(),
            type: 'pickup',
            read: readIds.includes(`pickup-today-${r.id}`)
          });
        } else if (startDate > now && differenceInCalendarDays(startDate, now) <= 3) {
          notifs.push({
            id: `pickup-upcoming-${r.id}`,
            title: "Upcoming Pickup",
            message: `${r.customerName} on ${formatDateManila(startDate)}`,
            date: now.toISOString(),
            type: 'pickup',
            read: readIds.includes(`pickup-upcoming-${r.id}`)
          });
        }
      }

      if (r.status === 'Picked Up' || r.status === 'Due Today') {
        if (endStr === todayStr) {
          notifs.push({
            id: `return-today-${r.id}`,
            title: "Return Today",
            message: `${r.customerName} - ${r.bookingNumber}`,
            date: now.toISOString(),
            type: 'return',
            read: readIds.includes(`return-today-${r.id}`)
          });
        }
      }

      if (r.status === 'Overdue') {
        notifs.push({
          id: `overdue-${r.id}`,
          title: "Overdue Rental",
          message: `${r.customerName} - ${r.bookingNumber}`,
          date: now.toISOString(),
          type: 'overdue',
          read: readIds.includes(`overdue-${r.id}`)
        });
      }
    });

    return notifs.sort((a, b) => {
      if (a.type === 'overdue' && b.type !== 'overdue') return -1;
      if (b.type === 'overdue' && a.type !== 'overdue') return 1;
      if (!a.read && b.read) return -1;
      if (a.read && !b.read) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [fittings, rentals, readIds]);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    // Only show system notification if there are high priority unread things that we haven't notified about
    if (permission === 'granted' && unreadCount > 0) {
      const notifiedStr = localStorage.getItem('last_system_notif_date');
      const todayStr = new Date().toDateString();
      if (notifiedStr !== todayStr) {
        new Notification("Rental by Nicole", {
          body: `You have ${unreadCount} unread notifications. Check your dashboard!`,
          icon: "/favicon.ico"
        });
        localStorage.setItem('last_system_notif_date', todayStr);
      }
    }
  }, [unreadCount, permission]);

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    const newReadIds = Array.from(new Set([...readIds, ...allIds]));
    setReadIds(newReadIds);
    localStorage.setItem('notification_read_ids', JSON.stringify(newReadIds));
  };

  const markAsRead = (id: string) => {
    const newReadIds = [...readIds, id];
    setReadIds(newReadIds);
    localStorage.setItem('notification_read_ids', JSON.stringify(newReadIds));
  };

  return { notifications, unreadCount, markAllAsRead, markAsRead };
}
