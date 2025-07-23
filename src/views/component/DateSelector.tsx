"use client";

import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { Button } from "./ui/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/Popover";
import { Calendar as CalendarComponent } from "./ui/Calendar";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface DateSelectorProps {
  value: Date;
  onChange: (date: Date) => void;
}

export default function DateSelector({ value, onChange }: DateSelectorProps) {
  const [open, setOpen] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onChange(date);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center space-x-2 min-w-[280px] justify-start"
        >
          <Calendar size={16} />
          <span>{format(value, "yyyy년 M월 d일", { locale: ko })}</span>
          <ChevronDown size={16} className="ml-auto" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <CalendarComponent
          mode="single"
          selected={value}
          onSelect={handleDateSelect}
          initialFocus
          defaultMonth={value}
        />
      </PopoverContent>
    </Popover>
  );
}
