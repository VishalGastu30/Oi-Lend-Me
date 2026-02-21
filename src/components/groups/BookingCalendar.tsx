"use client";

import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfDay } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Booking {
  startDate: string | Date;
  endDate: string | Date;
  id?: string;
  bookedBy?: {
      id: string;
      name: string;
      avatarUrl?: string;
  };
}

interface GroupItem {
  id: string;
  name: string;
  bookings: Booking[];
}

interface BookingCalendarProps {
  items: GroupItem[];
}

export function BookingCalendar({ items }: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addDays(monthEnd, 1));
  const prevMonth = () => setCurrentDate(addDays(monthStart, -1));

  // We need to calculate daily stats: how many items booked vs total
  const getDayStats = (date: Date) => {
      let bookedCount = 0;
      let dayBookings: { item: GroupItem; booking: Booking }[] = [];
      const dayStart = startOfDay(date);
      
      items.forEach(item => {
          const matchingBookings = item.bookings.filter(b => {
             const start = startOfDay(new Date(b.startDate));
             const end = startOfDay(new Date(b.endDate));
             return dayStart >= start && dayStart <= end;
          });
          
          if (matchingBookings.length > 0) {
              bookedCount++;
              matchingBookings.forEach(b => dayBookings.push({ item, booking: b }));
          }
      });
      return { booked: bookedCount, total: items.length, dayBookings };
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-bold text-white/40 uppercase tracking-wider py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, dayIdx) => {
          const stats = getDayStats(day);
          const load = stats.total > 0 ? stats.booked / stats.total : 0;
          const isPastDay = startOfDay(day) < startOfDay(new Date());
          
          const cellContent = (
            <div
              className={cn(
                "min-h-[100px] w-full rounded-xl p-3 border border-white/5 transition-all relative group text-left",
                !isSameMonth(day, monthStart) ? "opacity-30 bg-white/5" : "bg-white/5",
                isSameDay(day, new Date()) ? "ring-1 ring-[#4F9DFF]" : "",
                isPastDay ? "opacity-40 cursor-not-allowed grayscale" : "hover:bg-white/10 cursor-pointer"
              )}
            >
              <span className={cn(
                  "text-sm font-bold block mb-2",
                  isSameDay(day, new Date()) ? "text-[#4F9DFF]" : "text-white"
              )}>
                {format(day, "d")}
              </span>
              
              {stats.booked > 0 && (
                  <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-white/60">
                          <div className={cn("size-2 rounded-full", load > 0.5 ? "bg-orange-500" : "bg-blue-500")} />
                          {stats.booked} Booked
                      </div>
                  </div>
              )}
            </div>
          );

          if (stats.booked === 0) {
              return <div key={day.toString()}>{cellContent}</div>;
          }

          return (
            <Popover key={day.toString()}>
              <PopoverTrigger asChild>
                <div role="button">{cellContent}</div>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 bg-[#1A1F2E] border-white/10 text-white shadow-2xl overflow-hidden" align="center" side="top">
                  <div className="p-3 bg-white/5 border-b border-white/10 flex items-center gap-2">
                       <CalendarIcon className="w-4 h-4 text-blue-400" />
                       <span className="font-semibold">{format(day, 'EEEE, MMMM do')}</span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                      {stats.dayBookings.map((b, i) => (
                          <div key={i} className="p-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                              <div className="flex items-start gap-3">
                                  <Avatar className="w-8 h-8 rounded-full border border-white/10">
                                      {b.booking.bookedBy?.avatarUrl && <AvatarImage src={b.booking.bookedBy.avatarUrl} />}
                                      <AvatarFallback className="text-xs bg-blue-500/20 text-blue-300">
                                          {b.booking.bookedBy?.name?.[0] || '?'}
                                      </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate text-white">
                                          {b.item.name}
                                      </p>
                                      <p className="text-xs text-white/50 truncate mb-1.5">
                                          Reserved by {b.booking.bookedBy?.name || 'Unknown User'}
                                      </p>
                                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full w-fit">
                                          <Clock className="w-3 h-3" />
                                          {format(new Date(b.booking.startDate), 'MMM d')} - {format(new Date(b.booking.endDate), 'MMM d')}
                                      </div>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </PopoverContent>
            </Popover>
          );
        })}
      </div>
    </div>
  );
}
