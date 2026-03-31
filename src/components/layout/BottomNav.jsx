import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, BarChart3, Settings } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { path: "/", icon: Home, label: "Trang chủ" },
  { path: "/calendar", icon: Calendar, label: "Lịch" },
  { path: "/stats", icon: BarChart3, label: "Thống kê" },
  { path: "/settings", icon: Settings, label: "Cài đặt" },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <item.icon
                className={`w-5 h-5 relative z-10 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <span
                className={`text-[10px] font-medium relative z-10 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}