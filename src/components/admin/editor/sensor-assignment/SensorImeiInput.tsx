import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScanBarcode, Plus, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  
  // Add state to track the visibility of the scanner with animation
  const [isVisible, setIsVisible] = useState(showScanner);
  
  // Use effect to handle the transition
  useEffect(() => {
    if (showScanner) {
      setIsVisible(true);
    } else {
      // Delay hiding to allow for animation
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showScanner]);
  
  return (
    <div className="mb-4">
      <div className="flex gap-2 mb-2">
        <Input
          placeholder={t('projectEditor.enterSensorOrPlugImei')}
          value={imeiInput}
          onChange={onImeiChange}
          className="flex-1"
        />
        <Button
          onClick={onScanQR}
          variant="outline"
          size="icon"
          disabled={scanning}
          aria-label={t('projectEditor.scanQrCode')}
          title={t('projectEditor.scanQrCode')}
        >
          {scanning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ScanBarcode className="h-4 w-4" />
          )}
        </Button>
        <Button onClick={onAddSensor} disabled={!imeiInput.trim()}>
          <Plus className="h-4 w-4 mr-1" /> {t('projectEditor.add')}
        </Button>
      </div>
      
      {/* Use CSS transitions for smooth appearance/disappearance */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isVisible ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-center">
          <div className="w-full aspect-video bg-gray-200 dark:bg-gray-700 mb-2 flex items-center justify-center">
            {scanning ? (
              <Loader2 className="h-8 w-8 opacity-70 animate-spin" />
            ) : (
              <ScanBarcode className="h-8 w-8 opacity-50" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {scanning
              ? t('projectEditor.accessingCamera')
              : t('projectEditor.pointCamera')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SensorImeiInput;
