import { useState, useMemo, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useFittings } from "@/features/sales/useFittings";
import { useRentalBookings } from "@/features/sales/useRentalBookings";
import { Calendar, dateFnsLocalizer, Event as CalendarEvent, View, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { getManilaDate, parseManilaDate } from "@/utils/date-utils";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Icon } from "@iconify/react";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

type AppEvent = CalendarEvent & {
  id: string;
  type: 'fitting' | 'pickup' | 'return' | 'overdue';
  status: string;
  customerName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details: any;
};

export function SchedulePage() {
  const { data: fittings } = useFittings();
  const { data: rentals } = useRentalBookings();

  const [view, setView] = useState<View>(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768 ? Views.AGENDA : Views.MONTH;
  });
  const [date, setDate] = useState(() => {
    const m = getManilaDate();
    return new Date(m.getFullYear(), m.getMonth(), m.getDate());
  });
  const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && view === Views.MONTH) {
        setView(Views.AGENDA);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [view]);

  const events = useMemo(() => {
    const evts: AppEvent[] = [];

    if (fittings) {
      fittings.forEach(f => {
        if (f.status === 'Cancelled' || f.status === 'No Show') return;
        const d = parseManilaDate(f.date);
        
        // Try to parse time, assuming "HH:mm AM/PM" or similar
        let hours = 9;
        let mins = 0;
        if (f.time) {
          const match = f.time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
          if (match) {
            hours = parseInt(match[1]);
            mins = parseInt(match[2]);
            if (match[3] && match[3].toUpperCase() === 'PM' && hours < 12) hours += 12;
            if (match[3] && match[3].toUpperCase() === 'AM' && hours === 12) hours = 0;
          }
        }
        
        const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hours, mins);
        const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour fitting

        evts.push({
          id: `fitting-${f.id}`,
          title: `Fitting: ${f.representativeName}`,
          start,
          end,
          allDay: !f.time,
          type: 'fitting',
          status: f.status,
          customerName: f.representativeName,
          details: f
        });
      });
    }

    if (rentals) {
      rentals.forEach(r => {
        if (r.status === 'Cancelled' || r.status === 'Returned') return;

        const dStart = parseManilaDate(r.startDate);
        const start = new Date(dStart.getFullYear(), dStart.getMonth(), dStart.getDate(), 10, 0, 0, 0);

        let end: Date;
        if (r.endDate) {
          const dEnd = parseManilaDate(r.endDate);
          end = new Date(dEnd.getFullYear(), dEnd.getMonth(), dEnd.getDate(), 17, 0, 0, 0);
        } else {
          end = new Date(start);
          end.setHours(17, 0, 0, 0);
        }

        // Outbound Event (Pickup/Delivery/Courier/Meet Up)
        // Only show if the gown hasn't been picked up yet
        if (['Pending', 'Scheduled', 'Reserved', 'Ready for Pickup'].includes(r.status)) {
          const acquisitionMode = r.pickupMode || 'Pick Up';
          evts.push({
            id: `pickup-${r.id}`,
            title: `${acquisitionMode}: ${r.customerName}`,
            start,
            end: new Date(start.getTime() + 60 * 60 * 1000), // 1 hour pickup window
            allDay: false,
            type: 'pickup',
            status: r.status,
            customerName: r.customerName,
            details: r
          });
        }

        // Return Event
        if (r.endDate) {
          evts.push({
            id: `return-${r.id}`,
            title: `Return Due: ${r.customerName}`,
            start: end,
            end: new Date(end.getTime() + 60 * 60 * 1000),
            allDay: true, // Display at the top of the day as a due date
            type: 'return',
            status: r.status,
            customerName: r.customerName,
            details: r
          });
        }

        // Overdue Event (if overdue)
        if (r.status === 'Overdue') {
          const m = getManilaDate();
          const overdueStart = new Date(m.getFullYear(), m.getMonth(), m.getDate(), 9, 0, 0, 0);
          evts.push({
            id: `overdue-${r.id}`,
            title: `OVERDUE: ${r.customerName}`,
            start: overdueStart,
            end: new Date(overdueStart.getTime() + 24 * 60 * 60 * 1000),
            allDay: true,
            type: 'overdue',
            status: r.status,
            customerName: r.customerName,
            details: r
          });
        }
      });
    }

    return evts;
  }, [fittings, rentals]);

  const eventPropGetter = (event: AppEvent) => {
    let backgroundColor = "#f3f4f6";
    let borderColor = "#4b5563";
    let textColor = "#1f2937";
    
    switch (event.status) {
      case 'Pending': backgroundColor = "#fce7f3"; borderColor = "#db2777"; textColor = "#831843"; break; // pink
      case 'Scheduled':
      case 'Reserved': backgroundColor = "#dbeafe"; borderColor = "#2563eb"; textColor = "#1e3a8a"; break; // blue
      case 'Ready for Pickup': backgroundColor = "#e0e7ff"; borderColor = "#4f46e5"; textColor = "#312e81"; break; // indigo
      case 'Picked Up': backgroundColor = "#f3e8ff"; borderColor = "#9333ea"; textColor = "#581c87"; break; // purple
      case 'Due Today': backgroundColor = "#ffedd5"; borderColor = "#ea580c"; textColor = "#7c2d12"; break; // orange
      case 'No Show':
      case 'Overdue': backgroundColor = "#fee2e2"; borderColor = "#dc2626"; textColor = "#7f1d1d"; break; // red
      case 'Completed':
      case 'Returned': backgroundColor = "#d1fae5"; borderColor = "#059669"; textColor = "#064e3b"; break; // emerald
      case 'Cancelled': backgroundColor = "#f3f4f6"; borderColor = "#4b5563"; textColor = "#1f2937"; break; // gray
    }

    if (view === 'agenda') {
      return {
        style: {
          backgroundColor: 'transparent',
          color: textColor,
          borderLeft: `6px solid ${borderColor}`,
        }
      };
    }

    return {
      style: {
        backgroundColor,
        color: textColor,
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: "4px",
        borderTop: "0", borderRight: "0", borderBottom: "0",
        padding: "2px 6px",
        fontWeight: "600",
        fontSize: "0.75rem",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
      }
    };
  };

  return (
    <div>
      <AdminPageHeader 
        title="Schedule" 
        description="Manage fittings, pickups, and returns in a master calendar view."
      />

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-6 bg-white p-4 rounded-2xl shadow-soft border border-pink-100">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border-l-4 bg-[#fce7f3] border-[#db2777] text-[#831843] shadow-sm"><Icon icon="mdi:clock-outline" className="size-3.5 opacity-80" /><span className="text-xs font-bold">Pending</span></div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border-l-4 bg-[#dbeafe] border-[#2563eb] text-[#1e3a8a] shadow-sm"><Icon icon="mdi:calendar-check" className="size-3.5 opacity-80" /><span className="text-xs font-bold">Reserved / Scheduled</span></div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border-l-4 bg-[#e0e7ff] border-[#4f46e5] text-[#312e81] shadow-sm"><Icon icon="mdi:package-variant-closed" className="size-3.5 opacity-80" /><span className="text-xs font-bold">Ready for Pickup</span></div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border-l-4 bg-[#f3e8ff] border-[#9333ea] text-[#581c87] shadow-sm"><Icon icon="mdi:hanger" className="size-3.5 opacity-80" /><span className="text-xs font-bold">Picked Up</span></div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border-l-4 bg-[#ffedd5] border-[#ea580c] text-[#7c2d12] shadow-sm"><Icon icon="mdi:alert-circle-outline" className="size-3.5 opacity-80" /><span className="text-xs font-bold">Due Today</span></div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border-l-4 bg-[#d1fae5] border-[#059669] text-[#064e3b] shadow-sm"><Icon icon="mdi:check-circle-outline" className="size-3.5 opacity-80" /><span className="text-xs font-bold">Returned / Completed</span></div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border-l-4 bg-[#fee2e2] border-[#dc2626] text-[#7f1d1d] shadow-sm"><Icon icon="mdi:alert" className="size-3.5 opacity-80" /><span className="text-xs font-bold">Overdue / No Show</span></div>
      </div>

      {/* Calendar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-soft border border-pink-100 h-[600px] sm:h-[700px] font-sans">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          eventPropGetter={eventPropGetter}
          components={{
            event: ({ event }: any) => {
              let icon = "mdi:calendar";
              switch (event.status) {
                case 'Pending': icon = "mdi:clock-outline"; break;
                case 'Scheduled':
                case 'Reserved': icon = "mdi:calendar-check"; break;
                case 'Ready for Pickup': icon = "mdi:package-variant-closed"; break;
                case 'Picked Up': icon = "mdi:hanger"; break;
                case 'Due Today': icon = "mdi:alert-circle-outline"; break;
                case 'No Show':
                case 'Overdue': icon = "mdi:alert"; break;
                case 'Completed':
                case 'Returned': icon = "mdi:check-circle-outline"; break;
                case 'Cancelled': icon = "mdi:close-circle-outline"; break;
              }
              return (
                <div className="flex items-center gap-1 overflow-hidden" title={event.title}>
                  <Icon icon={icon} className="size-3.5 shrink-0 opacity-80" />
                  <span className="truncate">{event.title}</span>
                </div>
              );
            },
            agenda: {
              event: ({ event }: any) => {
                let bg = "#6b7280";
                switch (event.status) {
                  case 'Pending': bg = "#ec4899"; break;
                  case 'Scheduled':
                  case 'Reserved': bg = "#3b82f6"; break;
                  case 'Ready for Pickup': bg = "#6366f1"; break;
                  case 'Picked Up': bg = "#a855f7"; break;
                  case 'Due Today': bg = "#f97316"; break;
                  case 'No Show':
                  case 'Overdue': bg = "#ef4444"; break;
                  case 'Completed':
                  case 'Returned': bg = "#10b981"; break;
                  case 'Cancelled': bg = "#6b7280"; break;
                }
                return (
                  <span style={{ backgroundColor: bg, color: 'white', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    {event.title}
                  </span>
                );
              }
            }
          }}
          onSelectEvent={setSelectedEvent}
          popup
          className="rbn-calendar"
        />
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-pink-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-crystal overflow-hidden animate-in zoom-in-95 duration-200">
            <div className={`p-6 text-white flex items-start justify-between ${
              selectedEvent.status === 'Pending' ? 'bg-[#db2777]' :
              (selectedEvent.status === 'Scheduled' || selectedEvent.status === 'Reserved') ? 'bg-[#2563eb]' :
              selectedEvent.status === 'Ready for Pickup' ? 'bg-[#4f46e5]' :
              selectedEvent.status === 'Picked Up' ? 'bg-[#9333ea]' :
              selectedEvent.status === 'Due Today' ? 'bg-[#ea580c]' :
              (selectedEvent.status === 'No Show' || selectedEvent.status === 'Overdue') ? 'bg-[#dc2626]' :
              (selectedEvent.status === 'Completed' || selectedEvent.status === 'Returned') ? 'bg-[#059669]' :
              'bg-[#4b5563]'
            }`}>
              <div>
                <h3 className="text-xl font-bold leading-tight mb-1">{selectedEvent.title}</h3>
                <div className="flex items-center gap-1 text-sm font-medium text-white/90">
                  <Icon icon="mdi:calendar-clock" className="size-4" />
                  {format(selectedEvent.start!, "EEE, MMM d, yyyy 'at' h:mm a")}
                </div>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors shrink-0 -mt-1 -mr-2">
                <Icon icon="mdi:close" className="size-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-6">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Customer</p>
                  <p className="font-semibold text-gray-900">{selectedEvent.customerName}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                  <p className="font-semibold text-gray-900">{selectedEvent.status}</p>
                </div>
                {selectedEvent.type === 'fitting' ? (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Pax</p>
                    <p className="font-semibold text-gray-900">{selectedEvent.details.customerCount} people</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Booking Number</p>
                    <p className="font-semibold text-gray-900">{selectedEvent.details.bookingNumber}</p>
                  </div>
                )}
              </div>
              
              <a 
                href="/admin/sales" 
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-50 text-gray-700 font-bold hover:bg-gray-100 hover:text-gray-900 border border-gray-200 transition-colors"
              >
                Go to Sales Tracker
                <Icon icon="mdi:arrow-right" className="size-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Global styles for react-big-calendar to match our design language */}
      <style>{`
        .rbn-calendar .rbc-toolbar button {
          border-radius: 8px;
          border-color: #fce7f3;
          color: #831843;
          font-weight: 600;
          padding: 8px 16px;
          transition: all 0.2s;
        }
        .rbn-calendar .rbc-toolbar button.rbc-active {
          background-color: #d11275;
          color: white;
          border-color: #d11275;
        }
        .rbn-calendar .rbc-toolbar button:hover:not(.rbc-active) {
          background-color: #fdf2f8;
        }
        .rbn-calendar .rbc-header {
          padding: 12px 0;
          font-weight: 800;
          color: #831843;
          border-bottom: 2px solid #fce7f3;
        }
        .rbn-calendar .rbc-today {
          background-color: #fdf2f8;
        }
        .rbn-calendar .rbc-event {
          transition: transform 0.2s;
        }
        .rbn-calendar .rbc-event:hover {
          transform: scale(1.02);
          z-index: 10;
        }
        .rbn-calendar .rbc-month-view, .rbn-calendar .rbc-time-view, .rbn-calendar .rbc-agenda-view {
          border-color: #fce7f3;
          border-radius: 12px;
          overflow: hidden;
        }
        .rbn-calendar .rbc-day-bg {
          border-color: #fce7f3;
        }
        .rbn-calendar .rbc-month-row {
          border-color: #fce7f3;
        }

        /* Desktop Agenda View Alignments */
        .rbn-calendar .rbc-agenda-view {
          overflow-y: auto !important;
          flex: 1;
        }
        .rbn-calendar .rbc-agenda-view table.rbc-agenda-table {
          table-layout: fixed;
          width: 100%;
        }
        .rbn-calendar .rbc-agenda-view table.rbc-agenda-table thead {
          position: sticky;
          top: 0;
          background-color: white;
          z-index: 10;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .rbn-calendar .rbc-agenda-view table.rbc-agenda-table th,
        .rbn-calendar .rbc-agenda-view table.rbc-agenda-table td {
          text-align: left;
          padding: 12px;
          vertical-align: top;
        }
        .rbn-calendar .rbc-agenda-view table.rbc-agenda-table .rbc-agenda-date-cell {
          width: 25%;
          font-weight: 600;
        }
        .rbn-calendar .rbc-agenda-view table.rbc-agenda-table .rbc-agenda-time-cell {
          width: 25%;
        }
        .rbn-calendar .rbc-agenda-view table.rbc-agenda-table .rbc-agenda-event-cell {
          width: 50%;
        }

        /* Mobile Agenda View Overrides */
        @media (max-width: 768px) {
          .rbn-calendar .rbc-toolbar {
            display: flex;
            flex-direction: column;
            gap: 12px;
            align-items: center;
          }
          .rbn-calendar .rbc-toolbar .rbc-btn-group {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 4px;
            margin: 0;
          }
          .rbn-calendar .rbc-toolbar-label {
            font-size: 1.1em;
            margin: 8px 0;
            text-align: center;
          }
          .rbn-calendar .rbc-agenda-view table.rbc-agenda-table {
            display: block;
          }
          .rbn-calendar .rbc-agenda-view table.rbc-agenda-table thead {
            display: none;
          }
          .rbn-calendar .rbc-agenda-view table.rbc-agenda-table tbody,
          .rbn-calendar .rbc-agenda-view table.rbc-agenda-table tr,
          .rbn-calendar .rbc-agenda-view table.rbc-agenda-table td {
            display: block;
            width: 100%;
          }
          .rbn-calendar .rbc-agenda-view table.rbc-agenda-table tr {
            margin-bottom: 1rem;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            background-color: #ffffff;
            border: 1px solid #fce7f3;
          }
          .rbn-calendar .rbc-agenda-view table.rbc-agenda-table td.rbc-agenda-date-cell {
            font-weight: bold;
            font-size: 1.1em;
            color: #831843;
            border: none;
            padding: 12px 12px 4px;
          }
          .rbn-calendar .rbc-agenda-view table.rbc-agenda-table td.rbc-agenda-time-cell {
            font-weight: 600;
            color: #9d174d;
            border: none;
            padding: 0px 12px;
          }
          .rbn-calendar .rbc-agenda-view table.rbc-agenda-table td.rbc-agenda-event-cell {
            border: none;
            padding: 8px 12px 12px;
            color: #501838;
            font-weight: 600;
          }
          .rbn-calendar .rbc-time-view .rbc-allday-cell {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
