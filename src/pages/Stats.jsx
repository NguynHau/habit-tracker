import { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { vi } from "date-fns/locale";
import { motion } from "framer-motion";
import { Flame, Target, TrendingUp, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { getStreak, isHabitScheduledForDate } from "@/lib/habitUtils";

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + "18" }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Stats() {
  const { data: habits = [] } = useQuery({
    queryKey: ["habits"],
    queryFn: () => base44.entities.Habit.list("-created_date"),
  });

  const { data: completions = [] } = useQuery({
    queryKey: ["completions"],
    queryFn: () => base44.entities.HabitCompletion.list("-date", 1000),
  });

  const activeHabits = habits.filter((h) => h.is_active !== false);

  // Best streak across all habits
  const bestStreak = useMemo(() => {
    if (activeHabits.length === 0) return 0;
    return Math.max(...activeHabits.map((h) => getStreak(h.id, completions)), 0);
  }, [activeHabits, completions]);

  // Total completions
  const totalCompletions = completions.length;

  // Overall completion rate (last 30 days)
  const last30 = useMemo(() => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date(),
    });

    let totalScheduled = 0;
    let totalDone = 0;

    days.forEach((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const scheduled = activeHabits.filter((h) => isHabitScheduledForDate(h, dateStr));
      const done = completions.filter((c) => c.date === dateStr);
      totalScheduled += scheduled.length;
      totalDone += done.length;
    });

    return totalScheduled === 0 ? 0 : Math.round((totalDone / totalScheduled) * 100);
  }, [activeHabits, completions]);

  // Weekly chart data (last 7 days)
  const weeklyData = useMemo(() => {
    return eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date(),
    }).map((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const scheduled = activeHabits.filter((h) => isHabitScheduledForDate(h, dateStr)).length;
      const done = completions.filter((c) => c.date === dateStr).length;
      return {
        day: format(day, "EEE", { locale: vi }),
        done,
        total: scheduled,
        rate: scheduled === 0 ? 0 : Math.round((done / scheduled) * 100),
      };
    });
  }, [activeHabits, completions]);

  // Per-habit stats
  const habitStats = useMemo(() => {
    return activeHabits.map((h) => ({
      ...h,
      streak: getStreak(h.id, completions),
      totalDone: completions.filter((c) => c.habit_id === h.id).length,
    })).sort((a, b) => b.streak - a.streak);
  }, [activeHabits, completions]);

  return (
    <div className="px-5 pt-6 pb-4">
      <h1 className="text-2xl font-bold mb-6">Thống kê</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard icon={Flame} label="Streak dài nhất" value={bestStreak} color="#e17055" />
        <StatCard icon={Target} label="Tổng hoàn thành" value={totalCompletions} color="#0984e3" />
        <StatCard icon={TrendingUp} label="Tỷ lệ 30 ngày" value={`${last30}%`} color="#00b894" />
        <StatCard icon={Award} label="Thói quen" value={activeHabits.length} color="#6c5ce7" />
      </div>

      {/* Weekly chart */}
      <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-sm mb-6">
        <h3 className="text-sm font-semibold mb-4">7 ngày gần đây</h3>
        {weeklyData.some((d) => d.total > 0) ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData} barGap={4}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: 12,
                }}
                formatter={(value, name) => [value, name === "done" ? "Hoàn thành" : "Tổng"]}
              />
              <Bar dataKey="total" fill="hsl(var(--muted))" radius={[6, 6, 0, 0]} />
              <Bar dataKey="done" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">Chưa có dữ liệu</p>
        )}
      </div>

      {/* Per habit */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Theo thói quen</h3>
        <div className="space-y-2">
          {habitStats.map((h, i) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 bg-card rounded-xl p-3 border border-border/50"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-sm shrink-0"
                style={{ backgroundColor: (h.color || "#e84393") + "18" }}
              >
                {h.emoji || "🎯"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{h.name}</p>
                <p className="text-xs text-muted-foreground">{h.totalDone} lần hoàn thành</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-sm font-semibold text-orange-500">{h.streak}</span>
              </div>
            </motion.div>
          ))}
          {habitStats.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">Chưa có thói quen nào</p>
          )}
        </div>
      </div>
    </div>
  );
}