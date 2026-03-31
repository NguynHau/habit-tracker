import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Trash2 } from "lucide-react";
import { HABIT_COLORS, HABIT_EMOJIS } from "@/lib/habitUtils";
import { format } from "date-fns";

const DAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export default function HabitForm({ habit, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    emoji: "🎯",
    frequency: "daily",
    days_of_week: [1, 2, 3, 4, 5],
    start_date: format(new Date(), "yyyy-MM-dd"),
    color: HABIT_COLORS[0],
    is_active: true,
  });

  useEffect(() => {
    if (habit) {
      setForm({
        name: habit.name || "",
        description: habit.description || "",
        emoji: habit.emoji || "🎯",
        frequency: habit.frequency || "daily",
        days_of_week: habit.days_of_week || [1, 2, 3, 4, 5],
        start_date: habit.start_date || format(new Date(), "yyyy-MM-dd"),
        color: habit.color || HABIT_COLORS[0],
        is_active: habit.is_active !== false,
      });
    }
  }, [habit]);

  const toggleDay = (day) => {
    setForm((prev) => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter((d) => d !== day)
        : [...prev.days_of_week, day],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="absolute bottom-0 left-0 right-0 max-w-lg mx-auto bg-card rounded-t-3xl border-t border-border shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-muted-foreground/20 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <h2 className="text-lg font-bold">
            {habit ? "Chỉnh sửa" : "Thói quen mới"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-8 space-y-5">
          {/* Emoji picker */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Biểu tượng</Label>
            <div className="flex flex-wrap gap-2">
              {HABIT_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setForm({ ...form, emoji: e })}
                  className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all ${
                    form.emoji === e
                      ? "bg-primary/15 ring-2 ring-primary scale-110"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Tên thói quen</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="VD: Đọc sách 30 phút"
              className="rounded-xl h-11"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Mô tả (tuỳ chọn)</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Thêm ghi chú..."
              className="rounded-xl resize-none"
              rows={2}
            />
          </div>

          {/* Frequency */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Tần suất</Label>
            <div className="flex gap-2">
              {[
                { value: "daily", label: "Hàng ngày" },
                { value: "weekly", label: "Chọn ngày" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, frequency: opt.value })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    form.frequency === opt.value
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Days of week */}
          <AnimatePresence>
            {form.frequency === "weekly" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex gap-1.5 justify-between">
                  {DAYS.map((day, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleDay(idx)}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                        form.days_of_week.includes(idx)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Color picker */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Màu sắc</Label>
            <div className="flex flex-wrap gap-2.5">
              {HABIT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={`w-8 h-8 rounded-full transition-all ${
                    form.color === c ? "ring-2 ring-offset-2 ring-offset-card scale-110" : ""
                  }`}
                  style={{ backgroundColor: c, ringColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {habit && onDelete && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => onDelete(habit.id)}
                className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <Button
              type="submit"
              size="lg"
              className="flex-1 rounded-xl h-12 text-[15px] font-semibold"
              disabled={!form.name.trim()}
            >
              {habit ? "Lưu thay đổi" : "Tạo thói quen"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}