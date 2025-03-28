import * as React from "react";
import { Button } from "@/components/ui/button";

export type DateRange = {
  from: Date;
  to: Date;
};

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  // Simple implementation without calendar component
  const handleQuickSelect = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    onChange({ from, to });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => handleQuickSelect(7)}
      >
        Last 7 Days
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => handleQuickSelect(30)}
      >
        Last 30 Days
      </Button>
      <div className="text-xs text-muted-foreground mt-1">
        {value.from.toLocaleDateString()} - {value.to.toLocaleDateString()}
      </div>
    </div>
  );
}