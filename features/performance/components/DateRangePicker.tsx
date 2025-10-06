"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, AlertCircle } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

// ============================================
// DATE RANGE PICKER V2 - TWO INPUTS
// ============================================
// Melhor UX: 2 inputs separados (início/fim)
// Validação: data fim >= data início
// Cada input com seu próprio calendário
// ============================================

interface DateRangePickerProps {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [fromDate, setFromDate] = useState<Date | undefined>(value?.from);
  const [toDate, setToDate] = useState<Date | undefined>(value?.to);
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync with external value changes
  useEffect(() => {
    setFromDate(value?.from);
    setToDate(value?.to);
  }, [value?.from, value?.to]);

  // Validate dates
  const validateDates = (from: Date | undefined, to: Date | undefined): boolean => {
    if (!from && !to) {
      setError(null);
      return true;
    }

    if (from && !to) {
      setError("Selecione a data final");
      return false;
    }

    if (!from && to) {
      setError("Selecione a data inicial");
      return false;
    }

    if (from && to && to < from) {
      setError("Data final deve ser maior ou igual à data inicial");
      return false;
    }

    setError(null);
    return true;
  };

  const handleFromChange = (date: Date | undefined) => {
    setFromDate(date);
    setIsFromOpen(false);

    if (date && toDate) {
      if (validateDates(date, toDate)) {
        onChange({ from: date, to: toDate });
      }
    } else if (!date && !toDate) {
      onChange(undefined);
    }
  };

  const handleToChange = (date: Date | undefined) => {
    setToDate(date);
    setIsToOpen(false);

    if (fromDate && date) {
      if (validateDates(fromDate, date)) {
        onChange({ from: fromDate, to: date });
      }
    } else if (!fromDate && !date) {
      onChange(undefined);
    }
  };

  const clearDates = () => {
    setFromDate(undefined);
    setToDate(undefined);
    setError(null);
    onChange(undefined);
  };

  const hasValidRange = fromDate && toDate && !error;

  return (
    <div className="flex items-start gap-2">
      {/* Data Início */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="date-from" className="text-xs font-medium text-muted-foreground">
          Data Início
        </Label>
        <Popover open={isFromOpen} onOpenChange={setIsFromOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date-from"
              variant="outline"
              className={cn(
                "w-[160px] justify-start text-left font-normal",
                !fromDate && "text-muted-foreground",
                error && "border-destructive"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {fromDate ? format(fromDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={fromDate}
              onSelect={handleFromChange}
              initialFocus
              locale={ptBR}
              disabled={(date) => toDate ? date > toDate : false}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Separador */}
      <div className="flex items-center pt-7 text-muted-foreground">→</div>

      {/* Data Fim */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="date-to" className="text-xs font-medium text-muted-foreground">
          Data Fim
        </Label>
        <Popover open={isToOpen} onOpenChange={setIsToOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date-to"
              variant="outline"
              className={cn(
                "w-[160px] justify-start text-left font-normal",
                !toDate && "text-muted-foreground",
                error && "border-destructive"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {toDate ? format(toDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={toDate}
              onSelect={handleToChange}
              initialFocus
              locale={ptBR}
              disabled={(date) => fromDate ? date < fromDate : false}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Clear Button */}
      {hasValidRange && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearDates}
          className="mt-7 h-10"
          title="Limpar datas"
        >
          ✕
        </Button>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-1.5 mt-7 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}