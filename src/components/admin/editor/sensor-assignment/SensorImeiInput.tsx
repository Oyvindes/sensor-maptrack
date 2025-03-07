
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Camera, Plus, Loader2 } from "lucide-react";

interface SensorImeiInputProps {
  imeiInput: string;
  showScanner: boolean;
  scanning?: boolean;
  onImeiChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onScanQR: () => void;
  onAddSensor: () => void;
}

const SensorImeiInput: React.FC<SensorImeiInputProps> = ({
  imeiInput,
  showScanner,
  scanning = false,
  onImeiChange,
  onScanQR,
  onAddSensor
}) => {
  return (
    <div className="mb-4">
      <div className="flex gap-2 mb-2">
        <Input 
          placeholder="Enter sensor IMEI number" 
          value={imeiInput}
          onChange={onImeiChange}
          className="flex-1"
        />
        <Button 
          onClick={onScanQR} 
          variant="outline" 
          size="icon"
          disabled={scanning}
        >
          {scanning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </Button>
        <Button onClick={onAddSensor} disabled={!imeiInput.trim()}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>
      
      {showScanner && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-center">
          <div className="w-full aspect-video bg-gray-200 dark:bg-gray-700 mb-2 flex items-center justify-center">
            {scanning ? (
              <Loader2 className="h-8 w-8 opacity-70 animate-spin" />
            ) : (
              <Camera className="h-8 w-8 opacity-50" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {scanning 
              ? "Accessing camera... Please allow permissions if prompted" 
              : "Point camera at QR code"}
          </p>
        </div>
      )}
    </div>
  );
};

export default SensorImeiInput;
