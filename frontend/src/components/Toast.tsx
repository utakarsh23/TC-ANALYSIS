"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  icon?: React.ReactNode;
  onClose: () => void;
  onClick?: () => void;
  duration?: number;
}

export default function Toast({
  message,
  icon,
  onClose,
  onClick,
  duration = 5000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-slide-up">
      <button
        onClick={onClick}
        className="flex items-center gap-3 px-5 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl shadow-2xl hover:scale-105 transition-transform duration-200 backdrop-blur-lg border border-zinc-700 dark:border-zinc-300"
      >
        {icon && <span className="text-xl">{icon}</span>}
        <span className="font-semibold text-sm">{message}</span>
        <svg
          className="w-5 h-5 ml-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}
