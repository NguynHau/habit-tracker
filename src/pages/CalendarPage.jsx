import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, isToday, addMonths, subMonths, startOfWeek, endOfWeek
} from "date-fns";
import { vi } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { isHabitScheduledForDate } from "@/lib/habitUtils";

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: habits = [] } = useQuery({
    queryKey: ["habits"],
    queryFn: () => base44.entities.Habit.list("-created_date"),
  });

  const { data: completions = [] } = useQuery({
    queryKey: ["completions"],
    queryFn: () => base44.entities.HabitCompletion.list("-date", 1000),
  });

  // Build calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  // Completion map: date -> count of completed / total
  const dateStats = useMemo(() => {
    const stats = {};
    calendarDays.forEach((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const scheduled = habits.filter(
        (h) => h.is_active !== false && isHabitScheduledForDate(h, dateStr)
      );
      const completed = completions.filter(
        (c) => c.date === dateStr
      );
      if (scheduled.length > 0) {
        stats[dateStr] = {
          total: scheduled.length,
          done: completed.length,
          ratio: completed.length / scheduled.length,
        };
      }
    });
    return stats;
  }, [calendarDays, habits, completions]);

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const selectedHabits = habits.filter(
    (h) => h.is_active !== false && isHabitScheduledForDate(h, selectedDateStr)
  );
  const selectedCompletedIds = new Set(
    completions.filter((c) => c.date === selectedDateStr).map((c) => c.habit_id)
  );

  const getHeatColor = (ratio) => {
    if (ratio >= 1) return "bg-primary text-primary-foreground";
    if (ratio >= 0.5) return "bg-primary/40 text-foreground";
    if (ratio > 0) return "bg-primary/15 text-foreground";
    return "";
  };

  return (
    <div className="px-5 pt-6">
      {/* Month header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Lịch</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded-xl hover:bg-muted"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold min-w-[120px] text-center">
            {format(currentMonth, "MMMM yyyy", { locale: vi })}
          </span>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-xl hover:bg-muted"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-card rounded-2xl border border-border/50 p-3 shadow-sm mb-6">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
            <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const stat = dateStats[dateStr];
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = dateStr === selectedDateStr;
            const today = isToday(day);

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(day)}
                className={`aspect-square rounded-xl flex items-center justify-center text-xs font-medium relative transition-all
                  ${!isCurrentMonth ? "opacity-30" : ""}
                  ${isSelected ? "ring-2 ring-primary ring-offset-1 ring-offset-card" : ""}
                  ${stat ? getHeatColor(stat.ratio) : "hover:bg-muted"}
                `}
              >
                <span>{format(day, "d")}</span>
                {today && !stat && (
                  <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected date details */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">
          {format(selectedDate, "d MMMM, yyyy", { locale: vi })}
        </h3>
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDateStr}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            {selectedHabits.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Không có thói quen nào vào ngày này
              </p>
            ) : (
              selectedHabits.map((h) => {
                const done = selectedCompletedIds.has(h.id);
                return (
                  <div
                    key={h.id}
                    className="flex items-center gap-3 bg-card rounded-xl p-3 border border-border/50"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-sm"
                      style={{ backgroundColor: (h.color || "#e84393") + "18" }}
                    >
                      {h.emoji || "🎯"}
                    </div>
                    <span className={`flex-1 text-sm font-medium ${done ? "line-through text-muted-foreground" : ""}`}>
                      {h.name}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        done ? "text-white" : "border-2 border-border"
                      }`}
                      style={done ? { backgroundColor: h.color || "#e84393" } : {}}
                    >
                      {done && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}