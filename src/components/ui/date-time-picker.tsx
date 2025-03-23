import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface DateTimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export function DateTimePicker({
  date,
  setDate,
  disabled,
  className,
  placeholder = "Pick a date and time",
}: DateTimePickerProps) {
  const [selectedTime, setSelectedTime] = React.useState<string>(
    date ? format(date, "HH:mm") : ""
  );

  // Update the time when the date changes
  React.useEffect(() => {
    if (date) {
      // Ensure we're using the actual time from the date object
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      setSelectedTime(`${hours}:${minutes}`);
      console.log(`Date loaded with time: ${hours}:${minutes}`);
    }
  }, [date]);

  // Update the date with the selected time
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTimeValue = e.target.value;
    setSelectedTime(newTimeValue);
    
    if (date && newTimeValue) {
      const [hours, minutes] = newTimeValue.split(':').map(Number);
      // Create a new date object to avoid mutating the original
      const newDate = new Date(date.getTime());
      newDate.setHours(hours);
      newDate.setMinutes(minutes);
      console.log(`Time changed to ${hours}:${minutes}, new date: ${newDate.toISOString()}`);
      setDate(newDate);
    }
  };

  // Handle date selection from calendar
  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Get current time values to preserve
      let hours = 0;
      let minutes = 0;
      
      // First priority: use existing date's time if available
      if (date) {
        hours = date.getHours();
        minutes = date.getMinutes();
        console.log(`Preserving time from existing date: ${hours}:${minutes}`);
      }
      // Second priority: use selected time if available
      else if (selectedTime) {
        const timeParts = selectedTime.split(':').map(Number);
        hours = timeParts[0] || 0;
        minutes = timeParts[1] || 0;
        console.log(`Using time from input: ${hours}:${minutes}`);
      }
      
      // Apply the time to the new date
      selectedDate.setHours(hours);
      selectedDate.setMinutes(minutes);
      
      console.log(`Setting date with time: ${selectedDate.toISOString()}`);
      setDate(selectedDate);
    } else {
      setDate(undefined);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP HH:mm") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
        />
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Input
              type="time"
              value={selectedTime}
              onChange={handleTimeChange}
              className="w-full"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}