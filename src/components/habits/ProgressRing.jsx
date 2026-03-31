import { motion } from "framer-motion";

export default function ProgressRing({ completed, total }) {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="6"
        />
        <motion.circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-foreground">{percentage}%</span>
        <span className="text-[10px] text-muted-foreground font-medium">{completed}/{total}</span>
      </div>
    </div>
  );
}