import { format, subDays, isAfter, isBefore, parseISO, isSameDay } from "date-fns";

export function getTodayStr() {
  return format(new Date(), "yyyy-MM-dd");
}

export function isHabitScheduledForDate(habit, dateStr) {
  if (!habit) return false;
  const date = parseISO(dateStr);
  
  if (habit.start_date && isBefore(date, parseISO(habit.start_date))) {
    return false;
  }
  
  if (habit.frequency === "daily") return true;
  
  if (habit.frequency === "weekly" && habit.days_of_week?.length > 0) {
    return habit.days_of_week.includes(date.getDay());
  }
  
  return true;
}

export function calculateStreak(habit, completions) {
  if (!completions || completions.length === 0) return 0;
  
  const habitCompletions = completions
    .filter((c) => c.habit_id === habit.id)
    .map((c) => c.date)
    .sort((a, b) => b.localeCompare(a));
  
  if (habitCompletions.length === 0) return 0;
  
  let streak = 0;
  let checkDate = new Date();
  
  // Check if today is scheduled and not completed yet — start from yesterday
  const todayStr = getTodayStr();
  const todayCompleted = habitCompletions.includes(todayStr);
  
  if (todayCompleted) {
    streak = 1;
  } else {
    // If today is scheduled but not completed, start checking from yesterday
    if (isHabitScheduledForDate(habit, todayStr)) {
      checkDate = subDays(checkDate, 1);
    }
  }
  
  // Count backwards
  let daysBack = todayCompleted ? 1 : 0;
  for (let i = 0; i < 365; i++) {
    const d = subDays(new Date(), i + (todayCompleted ? 1 : daysBack === 0 ? 0 : 0));
    const dStr = format(subDays(new Date(), i + (todayCompleted ? 1 : 0)), "yyyy-MM-dd");
    
    if (!isHabitScheduledForDate(habit, dStr)) continue;
    
    if (habitCompletions.includes(dStr)) {
      streak++;
    } else {
      break;
    }
  }
  
  return todayCompleted ? streak : streak;
}

// Simpler streak calculation
export function getStreak(habitId, completions) {
  const dates = completions
    .filter(c => c.habit_id === habitId)
    .map(c => c.date)
    .filter((v, i, a) => a.indexOf(v) === i) // unique
    .sort((a, b) => b.localeCompare(a)); // newest first

  if (dates.length === 0) return 0;

  const today = getTodayStr();
  let streak = 0;
  let current = new Date();

  // If today is completed, start from today
  if (dates.includes(today)) {
    streak = 1;
    current = subDays(current, 1);
  } else {
    // Start from yesterday
    current = subDays(current, 1);
  }

  for (let i = 0; i < 365; i++) {
    const dStr = format(current, "yyyy-MM-dd");
    if (dates.includes(dStr)) {
      streak++;
      current = subDays(current, 1);
    } else {
      break;
    }
  }

  return streak;
}

export const HABIT_COLORS = [
  "#e84393", "#fd79a8", "#6c5ce7", "#a29bfe",
  "#00b894", "#00cec9", "#fdcb6e", "#e17055",
  "#0984e3", "#74b9ff", "#ff7675", "#fab1a0",
];

export const HABIT_EMOJIS = [
  "💪", "📚", "🧘", "🏃", "💧", "🍎", "😴", "✍️",
  "🎯", "🧹", "💊", "🎵", "🌅", "🚶", "🧠", "❤️",
];