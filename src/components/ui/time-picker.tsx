"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface TimePickerProps {
  value: string; // "HH:MM" 24h format
  onChange: (value: string) => void;
  className?: string;
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const [hour, setHour] = React.useState("12");
  const [minute, setMinute] = React.useState("00");
  const [period, setPeriod] = React.useState<"AM" | "PM">("AM");

  // Parse value on mount or change
  React.useEffect(() => {
    if (value) {
      const [h, m] = value.split(":");
      const hourInt = parseInt(h);
      const periodVal = hourInt >= 12 ? "PM" : "AM";
      const displayHour = hourInt % 12 || 12; // Convert 0 to 12
      
      setHour(displayHour.toString().padStart(2, "0"));
      setMinute(m);
      setPeriod(periodVal);
    }
  }, [value]);

  const updateTime = (newHour: string, newMinute: string, newPeriod: "AM" | "PM") => {
    let h = parseInt(newHour);
    if (newPeriod === "PM" && h !== 12) h += 12;
    if (newPeriod === "AM" && h === 12) h = 0;
    
    onChange(`${h.toString().padStart(2, "0")}:${newMinute}`);
  };

  const handleHourChange = (v: string) => {
    setHour(v);
    updateTime(v, minute, period);
  };

  const handleMinuteChange = (v: string) => {
    setMinute(v);
    updateTime(hour, v, period);
  };

  const handlePeriodChange = (v: "AM" | "PM") => {
    setPeriod(v);
    updateTime(hour, minute, v);
  };

  // Generate options
  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0")); // Every minute as requested "Allow selecting hours & minutes"

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Hour */}
      <div className="flex-1">
        <Select value={hour} onValueChange={handleHourChange}>
          <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-xl px-3 font-bold text-center">
            <SelectValue placeholder="HH" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px] border-white/10 bg-[#1A1F2E] text-white">
            {hours.map((h) => (
              <SelectItem key={h} value={h} className="justify-center focus:bg-white/10 focus:text-white cursor-pointer hover:bg-white/5">
                {h}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <span className="text-gray-500 font-bold">:</span>

      {/* Minute */}
      <div className="flex-1">
        <Select value={minute} onValueChange={handleMinuteChange}>
          <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-xl px-3 font-bold text-center">
            <SelectValue placeholder="MM" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px] border-white/10 bg-[#1A1F2E] text-white">
            {minutes.map((m) => (
              <SelectItem key={m} value={m} className="justify-center focus:bg-white/10 focus:text-white cursor-pointer hover:bg-white/5">
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Period */}
      <div className="flex-1">
        <Select value={period} onValueChange={(v) => handlePeriodChange(v as "AM" | "PM")}>
          <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-xl px-3 font-bold text-center text-blue-400">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-[#1A1F2E] text-white">
            <SelectItem value="AM" className="justify-center focus:bg-white/10 focus:text-white cursor-pointer hover:bg-white/5">AM</SelectItem>
            <SelectItem value="PM" className="justify-center focus:bg-white/10 focus:text-white cursor-pointer hover:bg-white/5">PM</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
