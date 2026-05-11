"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light'|'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const currentTheme = document.documentElement.getAttribute('data-theme') as 'light'|'dark' || 'light';
    setTheme(currentTheme);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', theme);
      try { 
        localStorage.setItem('theme', theme); 
      } catch (e) {}
    }
  }, [theme, mounted]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className="p-2 cursor-pointer"
        style={{ color: 'var(--panel-text)' }}
      >
        <Moon size={16} />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="p-2 cursor-pointer"
      style={{ color: 'var(--panel-text)' }}
    >
      {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
