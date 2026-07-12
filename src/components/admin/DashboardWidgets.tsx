import { useNotifications, NotificationItem } from "@/features/notifications/useNotifications";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

export function DashboardWidgets() {
  const { notifications } = useNotifications();

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
      case 'fitting': return "text-purple-600 bg-purple-100 border-purple-200";
      case 'pickup': return "text-green-600 bg-green-100 border-green-200";
      case 'return': return "text-blue-600 bg-blue-100 border-blue-200";
      case 'overdue': return "text-red-600 bg-red-100 border-red-200";
      case 'cancelled': return "text-gray-600 bg-gray-100 border-gray-200";
      default: return "text-pink-600 bg-pink-100 border-pink-200";
    }
  };

  // Group notifications
  const today = notifications.filter(n => n.title.includes("Today"));
  const upcoming = notifications.filter(n => n.title.includes("Upcoming"));
  const overdue = notifications.filter(n => n.type === 'overdue');

  type WidgetCardProps = { title: string; items: NotificationItem[]; emptyText: string; icon: string; color: string; };
  const WidgetCard = ({ title, items, emptyText, icon, color }: WidgetCardProps) => (
    <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-soft flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-xl ${color}`}>
          <Icon icon={icon} className="size-5" />
        </div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-brand-accent/70">{title}</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 storybook-scrollbar max-h-48">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-pink-950/40">
            <Icon icon="mdi:check-circle-outline" className="size-8 mb-2 opacity-50" />
            <p className="text-xs font-semibold">{emptyText}</p>
          </div>
        ) : (
          items.map((item: NotificationItem) => (
            <div key={item.id} className="p-3 rounded-xl bg-pink-50/50 border border-pink-100/50 flex gap-3 items-center">
              <div className={`shrink-0 flex items-center justify-center size-8 rounded-full ${getColor(item.type)}`}>
                <Icon icon={getIcon(item.type)} className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-pink-950 truncate">{item.message}</p>
                <p className="text-xs font-semibold text-brand-primary">{item.title}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-6 mb-6">
      <WidgetCard 
        title="Today's Schedule" 
        items={today} 
        emptyText="Nothing scheduled for today." 
        icon="mdi:calendar-today"
        color="bg-purple-100 text-purple-600"
      />
      
      <WidgetCard 
        title="Action Required" 
        items={overdue} 
        emptyText="No overdue items! Great job." 
        icon="mdi:alert"
        color="bg-red-100 text-red-600"
      />
      
      <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-soft flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
              <Icon icon="mdi:calendar-arrow-right" className="size-5" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-brand-accent/70">Upcoming</h3>
          </div>
          <Link to="/admin/schedule" className="text-xs font-bold text-brand-primary hover:text-brand-accent">
            View Calendar
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 storybook-scrollbar max-h-48">
          {upcoming.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-pink-950/40">
              <Icon icon="mdi:calendar-blank" className="size-8 mb-2 opacity-50" />
              <p className="text-xs font-semibold">No upcoming events this week.</p>
            </div>
          ) : (
            upcoming.map((item: NotificationItem) => (
              <div key={item.id} className="p-3 rounded-xl bg-pink-50/50 border border-pink-100/50 flex gap-3 items-center">
                <div className={`shrink-0 flex items-center justify-center size-8 rounded-full ${getColor(item.type)}`}>
                  <Icon icon={getIcon(item.type)} className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-pink-950 truncate">{item.message}</p>
                  <p className="text-[10px] font-bold text-pink-950/50 uppercase tracking-wide mt-0.5">{item.title}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
