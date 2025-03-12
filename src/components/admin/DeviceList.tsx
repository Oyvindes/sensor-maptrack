
import React from "react";
import { TrackingObject } from "@/types/sensors";
import { Plus, Pencil, Trash, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionContainer, SectionTitle } from "@/components/Layout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [deviceToDelete, setDeviceToDelete] = React.useState<{id: string, name: string} | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDeleteClick = (deviceId: string, deviceName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering other click handlers
    setDeviceToDelete({ id: deviceId, name: deviceName });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deviceToDelete || !onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(deviceToDelete.id);
    } catch (error) {
      console.error("Error during delete:", error);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
      setDeviceToDelete(null);
    }
  };

  return (
    <>
      <SectionContainer>
        <div className="flex justify-between items-center mb-4">
          <SectionTitle>Manage Tracking Devices</SectionTitle>
          <Button 
            onClick={onAddNew} 
            size="sm" 
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Device</span>
          </Button>
        </div>
        
        {devices.length === 0 ? (
          <div className="p-8 text-center border border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">No tracking objects found in the database.</p>
            <Button onClick={onAddNew} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              <span>Add your first device</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map(device => (
              <div 
                key={device.id}
                onClick={() => onDeviceSelect(device)}
                className="glass-card p-4 rounded-lg hover:shadow-md transition-all-ease cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{device.name}</h3>
                  <div className="flex space-x-1">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeviceSelect(device);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    
                    {onDelete && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => handleDeleteClick(device.id, device.name, e)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Position: {device.position.lat.toFixed(4)}, {device.position.lng.toFixed(4)}
                </div>
                <div className="flex justify-between mt-2">
                  <div className="text-xs text-muted-foreground">
                    Speed: {device.speed} mph • Battery: {device.batteryLevel}%
                  </div>
                  {(device as any).folderId && (
                    <div className="text-xs flex items-center gap-1">
                      <Folder className="h-3 w-3" />
                      <span>In folder</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionContainer>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deviceToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeviceList;
