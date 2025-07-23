"use client";

import { useToast } from "../../viewModel/use-toast";
import { X } from "lucide-react";
import { Button } from "./Button";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-0 right-0 z-50 w-full max-w-sm p-4 space-y-4">
      {toasts.map((toast: any) => (
        <div
          key={toast.id}
          className={`rounded-lg border p-4 shadow-lg ${
            toast.variant === "destructive"
              ? "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-900/10 dark:text-red-400"
              : "border-gray-200 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium">{toast.title}</h4>
              {toast.description && (
                <p className="mt-1 text-sm opacity-90">{toast.description}</p>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={() => dismiss(toast.id)}>
              <X size={16} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
