import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useNotifications, NotificationItem } from "@/features/notifications/useNotifications";
import { formatDateManila } from "@/utils/date-utils";
import { Link } from "react-router-dom";

export function AdminNotificationBell() {
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = (type: NotificationItem['type']) => {
    switch(type) {
      case 'fitting': return "mdi:calendar-clock";
      case 'pickup': return "mdi:hanger";
      case 'return': return "mdi:keyboard-return";
      case 'overdue': return "mdi:alert-circle";
      case 'cancelled': return "mdi:cancel";
      default: return "mdi:bell";
    }
  };

  const getColor = (type: NotificationItem['type']) => {
    switch(type) {
      case 'fitting': return "text-purple-600 bg-purple-100";
      case 'pickup': return "text-green-600 bg-green-100";
      case 'return': return "text-blue-600 bg-blue-100";
      case 'overdue': return "text-red-600 bg-red-100";
      case 'cancelled': return "text-gray-600 bg-gray-100";
      default: return "text-pink-600 bg-pink-100";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-pink-50 transition-colors text-pink-950/70 hover:text-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
      >
        <Icon icon="mdi:bell-outline" className="size-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-pink-100 z-50 overflow-hidden flex flex-col max-h-[80vh]">
          <div className="p-4 border-b border-pink-50 flex items-center justify-between bg-pink-50/50">
            <h3 className="font-bold text-pink-950 flex items-center gap-2">
              Notifications
              {unreadCount > 0 && <span className="bg-brand-accent text-white px-2 py-0.5 rounded-full text-xs">{unreadCount} new</span>}
            </h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs font-semibold text-brand-primary hover:text-brand-accent transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="overflow-y-auto flex-1 storybook-scrollbar p-2">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-pink-950/50 flex flex-col items-center">
                <Icon icon="mdi:bell-sleep" className="size-12 mb-2 opacity-20" />
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map(notif => (
                  <div 
                    key={notif.id}
                    className={`p-3 rounded-xl flex gap-3 transition-colors cursor-pointer ${notif.read ? 'opacity-75 hover:bg-gray-50' : 'bg-pink-50/30 hover:bg-pink-50'}`}
                    onClick={() => {
                      if (!notif.read) markAsRead(notif.id);
                    }}
                  >
                    <div className={`shrink-0 flex items-center justify-center size-10 rounded-full ${getColor(notif.type)}`}>
                      <Icon icon={getIcon(notif.type)} className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${notif.read ? 'font-medium text-pink-950/80' : 'font-bold text-pink-950'}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-pink-950/60 mt-0.5 truncate">{notif.message}</p>
                      <p className="text-[10px] text-pink-950/40 mt-1 uppercase tracking-wider font-semibold">
                        {formatDateManila(notif.date, "hh:mm a")}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="shrink-0 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-pink-50 bg-gray-50/50 text-center">
            <Link 
              to="/admin/schedule" 
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-brand-primary hover:text-brand-accent transition-colors"
            >
              View Full Schedule
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
