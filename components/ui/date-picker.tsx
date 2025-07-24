"use client";

import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
}

export function DatePicker({ date, onDateChange }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-2 justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="h-4 w-4" />
          {date ? (
            format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
          ) : (
            <span>Selecionar data</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <DayPicker
          mode="single"
          selected={date}
          onSelect={onDateChange}
          locale={ptBR}
          initialFocus
          className="rounded-md border"
        />
      </PopoverContent>
    </Popover>
  );
}
