"use client";

import { useState } from "react";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = ({
    title,
    description,
    variant = "default",
  }: Omit<Toast, "id">) => {
    const id = Date.now().toString();
    const newToast = { id, title, description, variant };

    setToasts((prev) => [...prev, newToast]);

    // 3초 후 자동 제거
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toast, toasts, dismiss };
}
