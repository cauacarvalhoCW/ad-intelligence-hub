"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Verificar se já tem preferência salva
    const saved = localStorage.getItem("dark-mode");
    if (saved) {
      const darkMode = JSON.parse(saved);
      setIsDark(darkMode);
      document.documentElement.classList.toggle("dark", darkMode);
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);

    // Aplicar apenas a classe 'dark' no HTML - NÃO MUDA A PÁGINA INTEIRA
    document.documentElement.classList.toggle("dark", newDarkMode);

    // Salvar preferência
    localStorage.setItem("dark-mode", JSON.stringify(newDarkMode));
  };

  return (
    <div className="flex items-center gap-2">
      <Sun
        className={`h-4 w-4 ${isDark ? "text-gray-400" : "text-yellow-500"}`}
      />
      <button
        onClick={toggleDarkMode}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          isDark
            ? "bg-blue-600 focus:ring-blue-500"
            : "bg-gray-200 focus:ring-gray-500"
        }`}
        title={isDark ? "Modo claro" : "Modo escuro"}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out ${
            isDark ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      <Moon
        className={`h-4 w-4 ${isDark ? "text-blue-400" : "text-gray-400"}`}
      />
    </div>
  );
}
