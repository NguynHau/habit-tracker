import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Plus, Sparkles, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import HabitCard from "@/components/habits/HabitCard";
import ProgressRing from "@/components/habits/ProgressRing";
import HabitForm from "@/components/habits/HabitForm";
import { getTodayStr, isHabitScheduledForDate, getStreak } from "@/lib/habitUtils";

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [filterMode, setFilterMode] = useState("all"); // all, done, undone
  const queryClient = useQueryClient();
  const todayStr = getTodayStr();

  const { data: habits = [] } = useQuery({
    queryKey: ["habits"],
    queryFn: () => base44.entities.Habit.list("-created_date"),
  });

  const { data: completions = [] } = useQuery({
    queryKey: ["completions"],
    queryFn: () => base44.entities.HabitCompletion.list("-date", 1000),
  });

  const createHabit = useMutation({
    mutationFn: (data) => base44.entities.Habit.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      setShowForm(false);
    },
  });

  const updateHabit = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Habit.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      setEditingHabit(null);
    },
  });

  const deleteHabit = useMutation({
    mutationFn: (id) => base44.entities.Habit.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      setEditingHabit(null);
    },
  });

  const toggleCompletion = useMutation({
    mutationFn: async ({ habitId }) => {
      const existing = completions.find(
        (c) => c.habit_id === habitId && c.date === todayStr
      );
      if (existing) {
        await base44.entities.HabitCompletion.delete(existing.id);
      } else {
        await base44.entities.HabitCompletion.create({
          habit_id: habitId,
          date: todayStr,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["completions"] });
    },
  });

  const todayHabits = habits.filter(
    (h) => h.is_active !== false && isHabitScheduledForDate(h, todayStr)
  );

  const completedIds = new Set(
    completions.filter((c) => c.date === todayStr).map((c) => c.habit_id)
  );

  const filteredHabits = todayHabits.filter((h) => {
    if (filterMode === "done") return completedIds.has(h.id);
    if (filterMode === "undone") return !completedIds.has(h.id);
    return true;
  });

  const completedCount = todayHabits.filter((h) => completedIds.has(h.id)).length;

  const today = new Date();
  const greeting = today.getHours() < 12 ? "Chào buổi sáng" : today.getHours() < 18 ? "Chào buổi chiều" : "Chào buổi tối";

  return (
    <div className="px-5 pt-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{greeting} ✨</p>
          <h1 className="text-2xl font-bold mt-0.5">
            {format(today, "EEEE", { locale: vi })}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {format(today, "d MMMM, yyyy", { locale: vi })}
          </p>
        </div>
        <ProgressRing completed={completedCount} total={todayHabits.length} />
      </div>

      {/* Filter tabs */}
      {todayHabits.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          {[
            { key: "all", label: "Tất cả" },
            { key: "undone", label: "Chưa xong" },
            { key: "done", label: "Đã xong" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterMode(f.key)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                filterMode === f.key
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Habit list */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              streak={getStreak(habit.id, completions)}
              isCompleted={completedIds.has(habit.id)}
              onToggle={() => toggleCompletion.mutate({ habitId: habit.id })}
              onClick={() => setEditingHabit(habit)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {todayHabits.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Bắt đầu ngày mới</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Tạo thói quen đầu tiên để theo dõi
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium text-sm"
          >
            Tạo thói quen
          </button>
        </motion.div>
      )}

      {/* All done state */}
      {todayHabits.length > 0 && completedCount === todayHabits.length && filterMode === "all" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8 mt-4"
        >
          <p className="text-3xl mb-2">🎉</p>
          <p className="font-semibold text-foreground">Tuyệt vời!</p>
          <p className="text-sm text-muted-foreground">Bạn đã hoàn thành tất cả hôm nay</p>
        </motion.div>
      )}

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => { setEditingHabit(null); setShowForm(true); }}
        className="fixed bottom-24 right-5 max-w-lg w-14 h-14 bg-primary text-primary-foreground rounded-2xl shadow-lg shadow-primary/25 flex items-center justify-center z-40"
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </motion.button>

      {/* Form modal */}
      <AnimatePresence>
        {(showForm || editingHabit) && (
          <HabitForm
            habit={editingHabit}
            onSave={(data) => {
              if (editingHabit) {
                updateHabit.mutate({ id: editingHabit.id, data });
              } else {
                createHabit.mutate(data);
              }
            }}
            onDelete={(id) => deleteHabit.mutate(id)}
            onClose={() => { setShowForm(false); setEditingHabit(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}