import { motion, AnimatePresence } from "framer-motion";
import { Check, Flame } from "lucide-react";
import { useState } from "react";
import confetti from "canvas-confetti";

export default function HabitCard({ habit, streak, isCompleted, onToggle, onClick }) {
  const [justCompleted, setJustCompleted] = useState(false);

  const handleToggle = (e) => {
    e.stopPropagation();
    if (!isCompleted) {
      setJustCompleted(true);
      // Small confetti burst
      const rect = e.currentTarget.getBoundingClientRect();
      confetti({
        particleCount: 25,
        spread: 50,
        startVelocity: 20,
        gravity: 1.2,
        origin: {
          x: rect.left / window.innerWidth + rect.width / window.innerWidth / 2,
          y: rect.top / window.innerHeight,
        },
        colors: [habit.color || "#e84393", "#fdcb6e", "#00b894"],
        scalar: 0.7,
      });
      setTimeout(() => setJustCompleted(false), 600);
    }
    onToggle();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-card rounded-2xl p-4 shadow-sm border border-border/50 cursor-pointer active:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-3.5">
        {/* Emoji */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
          style={{ backgroundColor: (habit.color || "#e84393") + "18" }}
        >
          {habit.emoji || "🎯"}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-[15px] leading-tight truncate ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
            {habit.name}
          </h3>
          {streak > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-xs font-medium text-orange-500">{streak} ngày</span>
            </div>
          )}
          {streak === 0 && habit.description && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{habit.description}</p>
          )}
        </div>

        {/* Toggle Button */}
        <motion.button
          onClick={handleToggle}
          whileTap={{ scale: 0.85 }}
          animate={justCompleted ? { scale: [1, 1.3, 1] } : {}}
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
            isCompleted
              ? "text-white shadow-md"
              : "border-2 border-border bg-background"
          }`}
          style={isCompleted ? { backgroundColor: habit.color || "#e84393" } : {}}
        >
          <AnimatePresence mode="wait">
            {isCompleted && (
              <motion.div
                key="check"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              >
                <Check className="w-5 h-5" strokeWidth={3} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
}