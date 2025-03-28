import React from 'react';
import { Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePowerSensor } from '@/hooks/usePowerSensor';

interface PowerDashboardButtonProps {
  deviceId: string;
  deviceName: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  showLabel?: boolean;
}

const PowerDashboardButton: React.FC<PowerDashboardButtonProps> = ({
  deviceId,
  deviceName,
  size = 'md',
  variant = 'default',
  showLabel = true
}) => {
  const {
    deviceStatus,
    loading,
    toggling,
    togglePower
  } = usePowerSensor(deviceId, deviceName);

  // Determine button size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-8 px-3';
      case 'lg':
        return 'h-12 px-6';
      case 'md':
      default:
        return 'h-10 px-4';
    }
  };

  // Determine icon size
  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-3.5 w-3.5';
      case 'lg':
        return 'h-5 w-5';
      case 'md':
      default:
        return 'h-4 w-4';
    }
  };

  // Determine button variant and color based on power state
  const getButtonStyle = () => {
    const isPoweredOn = deviceStatus?.power_state || false;
    
    if (variant !== 'default') {
      return variant;
    }
    
    return isPoweredOn ? 'default' : 'outline';
  };

  return (
    <Button
      variant={getButtonStyle()}
      className={`${getSizeClasses()} ${deviceStatus?.power_state ? 'bg-green-500 hover:bg-green-600' : ''}`}
      disabled={loading || toggling}
      onClick={togglePower}
      aria-label={`Toggle power ${deviceStatus?.power_state ? 'off' : 'on'}`}
    >
      <Power className={`${getIconSize()} ${deviceStatus?.power_state ? 'text-white' : 'text-muted-foreground'} ${showLabel ? 'mr-2' : ''}`} />
      {showLabel && (
        <span>
          {loading ? 'Loading...' : toggling ? 'Toggling...' : deviceStatus?.power_state ? 'On' : 'Off'}
        </span>
      )}
    </Button>
  );
};

export default PowerDashboardButton;