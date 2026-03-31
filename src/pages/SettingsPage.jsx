import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Moon, Sun, LogOut, User, ChevronRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const toggleDarkMode = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    if (newValue) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleLogout = () => {
    base44.auth.logout("/");
  };

  return (
    <div className="px-5 pt-6">
      <h1 className="text-2xl font-bold mb-6">Cài đặt</h1>

      {/* User info */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border/50 p-4 shadow-sm mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{user.full_name || "Người dùng"}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Settings list */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        {/* Dark mode */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/50">
          <div className="flex items-center gap-3">
            {darkMode ? (
              <Moon className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Sun className="w-5 h-5 text-muted-foreground" />
            )}
            <span className="text-sm font-medium">Chế độ tối</span>
          </div>
          <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-between w-full px-4 py-3.5 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-5 h-5 text-destructive" />
            <span className="text-sm font-medium text-destructive">Đăng xuất</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* App info */}
      <div className="text-center mt-10">
        <p className="text-xs text-muted-foreground">Habit Tracker v1.0</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">Xây dựng thói quen tốt mỗi ngày 🌱</p>
      </div>
    </div>
  );
}