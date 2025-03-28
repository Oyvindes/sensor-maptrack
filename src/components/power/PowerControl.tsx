import React, { useState } from 'react';
import { Power, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { usePowerSensor } from '@/hooks/usePowerSensor';

interface PowerControlProps {
  deviceId: string;
  deviceName: string;
}

const PowerControl: React.FC<PowerControlProps> = ({
  deviceId,
  deviceName
}) => {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  const [actionType, setActionType] = useState<'on' | 'off'>('off');
  
  const {
    deviceStatus,
    loading,
    toggling,
    connectionStatus,
    togglePower
  } = usePowerSensor(deviceId, deviceName);

  // Handle toggle button click - show confirmation dialog
  const handleToggleClick = (action: 'on' | 'off') => {
    setActionType(action);
    setConfirmDialogOpen(true);
  };

  // Handle power toggle with confirmation
  const handleTogglePower = async () => {
    await togglePower();
    setConfirmDialogOpen(false);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Power Control</CardTitle>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <div className="animate-pulse">Loading device status...</div>
          </div>
        ) : (
          <>
            {connectionStatus === 'disconnected' && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Connection Lost</AlertTitle>
                <AlertDescription>
                  This device appears to be disconnected. Power control may not work.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`h-3 w-3 rounded-full ${deviceStatus?.power_state ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <Label>Device Power</Label>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">
                    {deviceStatus?.power_state ? 'ON' : 'OFF'}
                  </span>

                  <Switch
                    checked={deviceStatus?.power_state || false}
                    disabled={toggling || connectionStatus === 'unknown'}
                    onCheckedChange={() => {
                      const newState = !deviceStatus?.power_state;
                      handleToggleClick(newState ? 'on' : 'off');
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <Button
                  variant={deviceStatus?.power_state ? 'outline' : 'default'}
                  className={`${!deviceStatus?.power_state ? 'bg-green-500 hover:bg-green-600' : ''}`}
                  disabled={deviceStatus?.power_state || toggling || connectionStatus === 'unknown'}
                  onClick={() => handleToggleClick('on')}
                >
                  <Power className="mr-2 h-4 w-4" />
                  Turn On
                </Button>

                <Button
                  variant={!deviceStatus?.power_state ? 'outline' : 'default'}
                  className={`${deviceStatus?.power_state ? 'bg-red-500 hover:bg-red-600' : ''}`}
                  disabled={!deviceStatus?.power_state || toggling || connectionStatus === 'unknown'}
                  onClick={() => handleToggleClick('off')}
                >
                  <Power className="mr-2 h-4 w-4" />
                  Turn Off
                </Button>
              </div>

              <div className="text-xs text-muted-foreground mt-2">
                Last updated: {deviceStatus?.updated_at ? new Date(deviceStatus.updated_at).toLocaleString() : 'Unknown'}
              </div>
            </div>
          </>
        )}

        {/* Confirmation Dialog */}
        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Power {actionType === 'on' ? 'On' : 'Off'}</DialogTitle>
              <DialogDescription>
                Are you sure you want to turn {actionType === 'on' ? 'on' : 'off'} the power for {deviceName}?
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDialogOpen(false)} disabled={toggling}>
                Cancel
              </Button>
              <Button
                onClick={handleTogglePower}
                disabled={toggling}
                className={actionType === 'on' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}
              >
                {toggling ? 'Processing...' : `Turn ${actionType === 'on' ? 'On' : 'Off'}`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default PowerControl;