import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import PowerSensorList from './PowerSensorList';
import PowerConsumptionChart from './PowerConsumptionChart';
import PowerSensorEditorWrapper from '@/components/sensor-editor/PowerSensorEditorWrapper';
import PowerDashboardButton from './PowerDashboardButton';
import { usePowerSensors } from '@/hooks/usePowerSensors';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { sensorDataToPowerSensor } from '@/services/sensor/powerSensorAdapter';
import { SensorData } from '@/components/SensorCard';

const PowerSensorDashboard: React.FC = () => {
  const {
    sensors,
    loading,
    selectedSensor,
    editingSensor,
    isAddingNew,
    loadSensors,
    startAddNew,
    startEdit,
    cancelEdit,
    saveSensor,
    removeSensor,
    selectSensor
  } = usePowerSensors();

  const [activeTab, setActiveTab] = React.useState<string>('list');
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState<boolean>(false);
  const [sensorToDelete, setSensorToDelete] = React.useState<SensorData | null>(null);

  // Handle deleting a sensor
  const handleDelete = (sensor: SensorData) => {
    setSensorToDelete(sensor);
    setDeleteDialogOpen(true);
  };

  // Handle confirming deletion
  const handleConfirmDelete = async () => {
    if (!sensorToDelete) return;
    
    // Convert to PowerSensor if needed
    const powerSensor = sensorDataToPowerSensor(sensorToDelete);
    
    // Delete the sensor
    await removeSensor(powerSensor);
    
    // Close the dialog
    setDeleteDialogOpen(false);
    setSensorToDelete(null);
  };

  // Handle canceling deletion
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setSensorToDelete(null);
  };

  // Handle selecting a sensor
  const handleSelectSensor = (sensor: SensorData) => {
    // Convert to PowerSensor if needed
    const powerSensor = sensorDataToPowerSensor(sensor);
    
    // Select the sensor
    selectSensor(powerSensor);
    
    // Switch to consumption tab
    if (activeTab !== 'consumption') {
      setActiveTab('consumption');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Smart Plug Dashboard</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadSensors}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={startAddNew}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Smart Plug
          </Button>
        </div>
      </div>

      {editingSensor ? (
        <PowerSensorEditorWrapper
          sensor={{
            ...editingSensor,
            values: [], // Add required SensorData properties
            sensorType: 'power'
          }}
          companies={[]} // You'll need to pass actual companies here
          onSave={(updatedSensor) => {
            // Convert to PowerSensor
            const powerSensor = sensorDataToPowerSensor(updatedSensor);
            saveSensor(powerSensor);
          }}
          onCancel={cancelEdit}
        />
      ) : (
        <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="list">Smart Plugs</TabsTrigger>
            <TabsTrigger value="consumption">Power Consumption</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Smart Plugs ({sensors.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <PowerSensorList
                  sensors={sensors.map(sensor => ({
                    ...sensor,
                    values: [], // Add required SensorData properties
                    sensorType: 'power'
                  }))}
                  loading={loading}
                  onEdit={(sensor) => startEdit(sensorDataToPowerSensor(sensor))}
                  onDelete={handleDelete}
                  onSelect={handleSelectSensor}
                  selectedSensor={selectedSensor ? {
                    ...selectedSensor,
                    values: [], // Add required SensorData properties
                    sensorType: 'power'
                  } : null}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="consumption" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Power Consumption</CardTitle>
                {selectedSensor && (
                  <PowerDashboardButton
                    deviceId={selectedSensor.id}
                    deviceName={selectedSensor.name}
                    size="sm"
                  />
                )}
              </CardHeader>
              <CardContent>
                {selectedSensor ? (
                  <PowerConsumptionChart deviceId={selectedSensor.id} deviceName={selectedSensor.name} />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No power sensors available to display consumption data
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the device
              <strong> {sensorToDelete?.name}</strong> and remove it from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PowerSensorDashboard;