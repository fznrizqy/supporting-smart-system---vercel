
import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { CalendarEvent, EventType, Equipment, User, UserRole } from '../types';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalIcon, Clock } from 'lucide-react';
import EventModal from './EventModal';
import ConfirmationModal from './ConfirmationModal';

interface ScheduleCalendarProps {
  equipmentList: Equipment[];
  currentUser: User;
  users: User[];
  onLogAction: (action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESET' | 'IMPORT', targetId: string, targetName: string, details?: string) => Promise<void>;
}

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({ equipmentList, currentUser, users, onLogAction }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>(undefined);
  
  // Deletion State
  const [eventToDelete, setEventToDelete] = useState<number | null>(null);

  const canManageSchedule = [UserRole.Admin, UserRole.Supporting].includes(currentUser.role);

  const events = useLiveQuery(async () => {
    // Get all events
    return await db.events.toArray();
  }, [currentDate]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)
  
  // Navigation Handlers
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = () => setCurrentDate(new Date());

  // Event Handlers
  const handleDayClick = (day: number) => {
    if (!canManageSchedule) return;
    const clickedDate = new Date(year, month, day);
    setSelectedDate(clickedDate);
    setEditingEvent(undefined); // New event mode
    setIsModalOpen(true);
  };

  const handleEventClick = (e: React.MouseEvent, event: CalendarEvent) => {
    e.stopPropagation();
    setEditingEvent(event); // Read-only mode for existing events
    setSelectedDate(new Date(event.startDate));
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (event: CalendarEvent) => {
    if (!event.id) {
      // Add new event
      try {
        const id = await db.events.add(event);
        await onLogAction('CREATE', `EVENT-${id}`, event.title, `Scheduled for ${new Date(event.startDate).toLocaleDateString()}`);
      } catch (error) {
        console.error("Failed to save event:", error);
        alert("Failed to save event.");
      }
    } 
    // Note: No update logic as existing events are read-only
  };

  // Step 1: Request Deletion (Opens Confirmation Modal)
  const requestDeleteEvent = (id: number) => {
    setEventToDelete(id);
  };

  // Step 2: Execute Deletion (Called by Confirmation Modal)
  const executeDeleteEvent = async () => {
    if (eventToDelete === null) return;

    try {
      const id = eventToDelete;
      // Fetch event first to get details for log
      // FIX: Using manual find as custom API does not support .get()
      const allEvents = await db.events.toArray();
      const event = allEvents.find((e: any) => e.id === id);
      
      if (!event) {
          alert("Event not found or already deleted.");
      } else {
          await db.events.delete(id);
          // Log to audit trail
          await onLogAction('DELETE', `EVENT-${id}`, event.title, `Event deleted from schedule. Original Date: ${new Date(event.startDate).toLocaleDateString()}`);
      }
      
      // Close Modals
      setEventToDelete(null);
      setIsModalOpen(false);

    } catch (error) {
      console.error("Failed to delete event:", error);
      alert("Failed to delete event. Please try again.");
    }
  };

  // Helper to get events for a specific day
  const getEventsForDay = (day: number) => {
    if (!events) return [];
    
    const targetStart = new Date(year, month, day, 0, 0, 0).getTime();
    const targetEnd = new Date(year, month, day, 23, 59, 59).getTime();

    return events.filter(e => {
      const eStart = new Date(e.startDate).getTime();
      const eEnd = new Date(e.endDate).getTime();
      // Check if event overlaps with this day
      return eStart <= targetEnd && eEnd >= targetStart;
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  };

  const getEventTypeColor = (type: EventType) => {
    switch(type) {
      case EventType.Maintenance: return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
      case EventType.Calibration: return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
      case EventType.Verification: return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
      default: return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  // Generate Calendar Grid
  const renderCalendarDays = () => {
    const blanks = Array(firstDayOfMonth).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    return (
      <>
        {blanks.map((_, i) => (
          <div key={`blank-${i}`} className="bg-slate-50/50 dark:bg-slate-900/20 border-b border-r border-slate-200 dark:border-slate-700 min-h-[90px]"></div>
        ))}
        {days.map(day => {
          const dayEvents = getEventsForDay(day);
          const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

          return (
            <div 
              key={day} 
              onClick={() => handleDayClick(day)}
              className={`bg-white dark:bg-slate-800 border-b border-r border-slate-200 dark:border-slate-700 min-h-[90px] p-1.5 ${canManageSchedule ? 'hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer' : ''} transition-colors group relative flex flex-col gap-1`}
            >
              <div className="flex justify-between items-start">
                <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                  isToday 
                    ? 'bg-sky-500 text-white' 
                    : 'text-slate-700 dark:text-slate-300 group-hover:bg-slate-200 dark:group-hover:bg-slate-600'
                }`}>
                  {day}
                </span>
                {canManageSchedule && (
                  <button 
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-sky-500 transition-opacity"
                    title="Add Event"
                  >
                    <Plus size={14} />
                  </button>
                )}
              </div>
              
              <div className="flex flex-col gap-1 mt-0.5 overflow-y-auto max-h-[55px] custom-scrollbar">
                {dayEvents.map(event => (
                  <div 
                    key={event.id}
                    onClick={(e) => handleEventClick(e, event)}
                    className={`text-[10px] px-1 py-0.5 rounded border truncate cursor-pointer transition-transform hover:scale-[1.02] ${getEventTypeColor(event.type)}`}
                    title={`${event.title} (${new Date(event.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})`}
                  >
                    <span className="font-semibold mr-1">
                      {new Date(event.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-[calc(100vh-13rem)]">
      {/* Calendar Toolbar */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <CalIcon className="text-sky-500" size={20} />
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5">
            <button onClick={prevMonth} className="p-1 hover:bg-white dark:hover:bg-slate-600 rounded-md transition-colors text-slate-600 dark:text-slate-300">
              <ChevronLeft size={18} />
            </button>
            <button onClick={nextMonth} className="p-1 hover:bg-white dark:hover:bg-slate-600 rounded-md transition-colors text-slate-600 dark:text-slate-300">
              <ChevronRight size={18} />
            </button>
          </div>
          <button 
            onClick={today}
            className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 px-2 py-1 rounded-lg transition-colors"
          >
            Today
          </button>
        </div>

        {canManageSchedule && (
          <button 
            onClick={() => {
              setSelectedDate(new Date());
              setEditingEvent(undefined);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors shadow-sm text-sm"
          >
            <Plus size={16} />
            Add Event
          </button>
        )}
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 flex-1 overflow-auto bg-slate-200 dark:bg-slate-700 gap-px border-b border-slate-200 dark:border-slate-700">
        {renderCalendarDays()}
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        // Pass request function instead of direct execution
        onDelete={canManageSchedule ? requestDeleteEvent : undefined}
        initialEvent={editingEvent || {}}
        selectedDate={selectedDate}
        equipmentList={equipmentList}
        currentUserId={currentUser.id}
        readOnly={!!editingEvent} // Existing events are read-only
        users={users} // Pass user list for creator lookup
      />

      <ConfirmationModal 
        isOpen={eventToDelete !== null}
        onClose={() => setEventToDelete(null)}
        onConfirm={executeDeleteEvent}
        title="Delete Event"
        message="Are you sure you want to delete this scheduled event? This action cannot be undone."
        confirmText="Delete Event"
        isDanger={true}
      />
    </div>
  );
};

export default ScheduleCalendar;
