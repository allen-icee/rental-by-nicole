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
        if (r.status === 'Cancelled') return;

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

        // Pickup Event
        evts.push({
          id: `pickup-${r.id}`,
          title: `Pickup: ${r.customerName}`,
          start,
          end: new Date(start.getTime() + 60 * 60 * 1000), // 1 hour pickup window
          allDay: false,
          type: 'pickup',
          status: r.status,
          customerName: r.customerName,
          details: r
        });

        // Return Event
        if (r.endDate) {
          evts.push({
            id: `return-${r.id}`,
            title: `Return: ${r.customerName}`,
            start: end,
            end: new Date(end.getTime() + 60 * 60 * 1000), // 1 hour return window
            allDay: false,
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
    let backgroundColor = "#d11275"; // pink (default)
    if (event.type === 'fitting') backgroundColor = "#9333ea"; // purple-600
    if (event.type === 'pickup') backgroundColor = "#16a34a"; // green-600
    if (event.type === 'return') backgroundColor = "#2563eb"; // blue-600
    if (event.type === 'overdue') backgroundColor = "#dc2626"; // red-600

    return {
      style: {
        backgroundColor,
        borderRadius: "8px",
        opacity: 0.9,
        color: "white",
        border: "0",
        display: "block",
        padding: "2px 6px",
        fontWeight: "bold",
        fontSize: "0.75rem",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
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
      <div className="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded-2xl shadow-soft border border-pink-100">
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-purple-600 shadow-sm"></div><span className="text-sm font-bold text-pink-950">Fittings</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-green-600 shadow-sm"></div><span className="text-sm font-bold text-pink-950">Pickups</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-blue-600 shadow-sm"></div><span className="text-sm font-bold text-pink-950">Returns</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-red-600 shadow-sm"></div><span className="text-sm font-bold text-pink-950">Overdue</span></div>
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
          onSelectEvent={setSelectedEvent}
          popup
          className="rbn-calendar"
        />
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-pink-950/20 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-crystal border border-pink-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className={`p-6 text-white flex items-start justify-between ${
              selectedEvent.type === 'fitting' ? 'bg-purple-600' :
              selectedEvent.type === 'pickup' ? 'bg-green-600' :
              selectedEvent.type === 'return' ? 'bg-blue-600' : 'bg-red-600'
            }`}>
              <div>
                <span className="inline-block px-2 py-1 bg-white/20 rounded-md text-xs font-bold uppercase tracking-wider mb-2">
                  {selectedEvent.type}
                </span>
                <h3 className="text-2xl font-black font-display leading-tight">{selectedEvent.title}</h3>
                <p className="font-semibold text-white/80 mt-1">{format(selectedEvent.start!, "EEEE, MMMM do yyyy 'at' h:mm a")}</p>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <Icon icon="mdi:close" className="size-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-pink-50/50 border border-pink-100">
                <Icon icon="mdi:account" className="size-6 text-brand-primary" />
                <div>
                  <p className="text-xs font-bold text-pink-950/60 uppercase tracking-wider">Customer</p>
                  <p className="font-bold text-pink-950">{selectedEvent.customerName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-pink-50/50 border border-pink-100">
                <Icon icon="mdi:check-circle" className="size-6 text-brand-primary" />
                <div>
                  <p className="text-xs font-bold text-pink-950/60 uppercase tracking-wider">Status</p>
                  <p className="font-bold text-pink-950">{selectedEvent.status}</p>
                </div>
              </div>

              {selectedEvent.type === 'fitting' ? (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-pink-50/50 border border-pink-100">
                  <Icon icon="mdi:account-group" className="size-6 text-brand-primary" />
                  <div>
                    <p className="text-xs font-bold text-pink-950/60 uppercase tracking-wider">Pax</p>
                    <p className="font-bold text-pink-950">{selectedEvent.details.customerCount} people</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-pink-50/50 border border-pink-100">
                  <Icon icon="mdi:receipt-text" className="size-6 text-brand-primary" />
                  <div>
                    <p className="text-xs font-bold text-pink-950/60 uppercase tracking-wider">Booking Number</p>
                    <p className="font-bold text-pink-950">{selectedEvent.details.bookingNumber}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 pt-0">
              <a 
                href="/admin/sales" 
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-primary text-white font-bold shadow-soft hover:bg-brand-accent transition-colors"
              >
                Go to Sales Tracker
                <Icon icon="mdi:arrow-right" className="size-5" />
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
      `}</style>
    </div>
  );
}
