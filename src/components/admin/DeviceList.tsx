import React from "react";
import { TrackingObject } from "@/types/sensors";
import { Plus, Pencil, Trash, Folder, AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionContainer, SectionTitle } from "@/components/Layout";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DeviceListProps {
  devices: TrackingObject[];
  onDeviceSelect: (device: TrackingObject) => void;
  onAddNew: () => void;
  onDelete?: (deviceId: string) => Promise<boolean>;
}

const DeviceList: React.FC<DeviceListProps> = ({
  devices,
  onDeviceSelect,
  onAddNew,
  onDelete
}) => {
  const { t } = useTranslation();
  
  // Log the devices for debugging
  console.log('DeviceList - Received devices:', devices);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [deviceToDelete, setDeviceToDelete] = React.useState<{id: string, name: string} | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleDeleteClick = (deviceId: string, deviceName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering other click handlers
    setDeviceToDelete({ id: deviceId, name: deviceName });
    setError(null);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deviceToDelete || !onDelete) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      // Check if the device ID is in UUID format
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(deviceToDelete.id);
      
      if (!isUuid) {
        setError(`Cannot delete: "${deviceToDelete.name}" has an invalid ID format. This may be a mock device from sample data.`);
        return;
      }
      
      const success = await onDelete(deviceToDelete.id);
      
      if (!success) {
        setError(`Failed to delete "${deviceToDelete.name}". Please try again.`);
      }
    } catch (error) {
      console.error("Error during delete:", error);
      setError(`An unexpected error occurred: ${error.message}`);
    } finally {
      setIsDeleting(false);
      if (!error) {
        setDeleteConfirmOpen(false);
        setDeviceToDelete(null);
      }
    }
  };

  return (
    <>
      <SectionContainer>
        <SectionTitle className="mb-2">{t('admin.manageTrackingDevices')}</SectionTitle>
        <div className="flex justify-start gap-2 mb-6">
          <Button
            onClick={onAddNew}
            size="sm"
            className="h-12 px-4"
          >
            <span className="flex flex-col items-center gap-1">
              <Plus className="h-4 w-4" />
              <span className="text-[10px]">{t('buttons.new')}</span>
            </span>
          </Button>
        </div>
        
        {devices.length === 0 ? (
          <div className="p-4 sm:p-8 text-center border border-dashed rounded-lg">
            <p className="text-sm sm:text-base text-muted-foreground mb-2 sm:mb-4">{t('admin.noTrackingObjects')}</p>
            <Button onClick={onAddNew} variant="outline" className="h-12 px-4">
              <span className="flex flex-col items-center gap-1">
                <Plus className="h-4 w-4" />
                <span className="text-[10px]">{t('admin.start')}</span>
              </span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
            {devices.map(device => (
              <div
                key={device.id}
                onClick={() => onDeviceSelect(device)}
                className="glass-card p-3 sm:p-4 rounded-lg hover:shadow-md transition-all-ease cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <h3 className="font-medium text-sm sm:text-base truncate max-w-[70%]">{device.name}</h3>
                  <div className="flex space-x-0.5 sm:space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-12 px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeviceSelect(device);
                      }}
                    >
                      <span className="flex flex-col items-center gap-1">
                        <Pencil className="h-4 w-4" />
                        <span className="text-[10px]">{t('buttons.edit')}</span>
                      </span>
                    </Button>
                    
                    {onDelete && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-12 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => handleDeleteClick(device.id, device.name, e)}
                      >
                        <span className="flex flex-col items-center gap-1">
                          <Trash className="h-4 w-4" />
                          <span className="text-[10px]">{t('buttons.delete')}</span>
                        </span>
                      </Button>
                    )}
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {t('admin.position')}: {device.position.lat.toFixed(4)}, {device.position.lng.toFixed(4)}
                </div>
                <div className="flex flex-col xs:flex-row xs:justify-between mt-1 sm:mt-2 gap-1">
                  <div className="text-[10px] sm:text-xs text-muted-foreground">
                    {t('admin.speed')}: {device.speed} {t('admin.mph')} • {t('admin.battery')}: {device.batteryLevel}%
                  </div>
                  {device.folderId && (
                    <div className="text-[10px] sm:text-xs flex items-center gap-0.5 sm:gap-1">
                      <Folder className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      <span>{t('admin.inFolder')}</span>
                    </div>
                  )}
                </div>
                {!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(device.id) && (
                  <div className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-amber-500 flex items-center gap-0.5 sm:gap-1">
                    <AlertOctagon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    <span>{t('admin.mockData')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionContainer>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.confirmDeletion')}</DialogTitle>
            <DialogDescription>
              {t('admin.deleteConfirmation', { name: deviceToDelete?.name })}
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <Alert variant="destructive" className="my-2">
              <AlertDescription className="flex items-center gap-2">
                <AlertOctagon className="h-4 w-4" />
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} disabled={isDeleting}>
              <span className="flex flex-col items-center gap-1">
                <span className="text-[10px]">{t('buttons.cancel')}</span>
              </span>
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              <span className="flex flex-col items-center gap-1">
                <span className="text-[10px]">{isDeleting ? t('admin.deleting') : t('buttons.delete')}</span>
              </span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeviceList;
