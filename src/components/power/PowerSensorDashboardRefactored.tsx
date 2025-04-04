/**
 * Power Sensor Dashboard (Refactored)
 * Refactored version using the base component pattern
 */

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
import { BaseComponent, BaseProps, BaseState } from '@/components/common/BaseComponent';

// Props interface
interface PowerSensorDashboardProps extends BaseProps {
  // Add any specific props here
}

// State interface
interface PowerSensorDashboardState extends BaseState {
  activeTab: string;
  deleteDialogOpen: boolean;
  sensorToDelete: SensorData | null;
}

/**
 * Power Sensor Dashboard Component
 * Displays a dashboard for managing power sensors
 */
class PowerSensorDashboardRefactored extends BaseComponent<PowerSensorDashboardProps, PowerSensorDashboardState> {
  // Power sensors hook data
  private sensors: ReturnType<typeof usePowerSensors>;

  constructor(props: PowerSensorDashboardProps) {
    super(props);
    
    // Initialize the state
    this.state = {
      ...BaseComponent.defaultState,
      activeTab: 'list',
      deleteDialogOpen: false,
      sensorToDelete: null
    };
    
    // Initialize the sensors hook
    this.sensors = usePowerSensors();
    
    // Bind methods
    this.handleDelete = this.handleDelete.bind(this);
    this.handleConfirmDelete = this.handleConfirmDelete.bind(this);
    this.handleCancelDelete = this.handleCancelDelete.bind(this);
    this.handleSelectSensor = this.handleSelectSensor.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);
  }
  
  /**
   * Handle deleting a sensor
   * @param sensor Sensor to delete
   */
  handleDelete(sensor: SensorData): void {
    this.setState({
      sensorToDelete: sensor,
      deleteDialogOpen: true
    });
  }
  
  /**
   * Handle confirming deletion
   */
  async handleConfirmDelete(): Promise<void> {
    const { sensorToDelete } = this.state;
    
    if (!sensorToDelete) return;
    
    this.setLoading(true);
    
    try {
      // Convert to PowerSensor if needed
      const powerSensor = sensorDataToPowerSensor(sensorToDelete);
      
      // Delete the sensor
      await this.sensors.removeSensor(powerSensor);
      
      // Close the dialog
      this.setState({
        deleteDialogOpen: false,
        sensorToDelete: null
      });
    } catch (error) {
      this.handleError(error, 'handleConfirmDelete');
    } finally {
      this.setLoading(false);
    }
  }
  
  /**
   * Handle canceling deletion
   */
  handleCancelDelete(): void {
    this.setState({
      deleteDialogOpen: false,
      sensorToDelete: null
    });
  }
  
  /**
   * Handle selecting a sensor
   * @param sensor Sensor to select
   */
  handleSelectSensor(sensor: SensorData): void {
    // Convert to PowerSensor if needed
    const powerSensor = sensorDataToPowerSensor(sensor);
    
    // Select the sensor
    this.sensors.selectSensor(powerSensor);
    
    // Switch to consumption tab
    if (this.state.activeTab !== 'consumption') {
      this.setState({ activeTab: 'consumption' });
    }
  }
  
  /**
   * Handle tab change
   * @param tab Tab to change to
   */
  handleTabChange(tab: string): void {
    this.setState({ activeTab: tab });
  }
  
  /**
   * Render the component content
   * @returns Component content
   */
  protected renderContent(): React.ReactNode {
    const { activeTab, deleteDialogOpen, sensorToDelete } = this.state;
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
      saveSensor
    } = this.sensors;
    
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
          <Tabs defaultValue="list" value={activeTab} onValueChange={this.handleTabChange}>
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
                    onDelete={this.handleDelete}
                    onSelect={this.handleSelectSensor}
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
        <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => this.setState({ deleteDialogOpen: open })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the device
                <strong> {sensorToDelete?.name}</strong> and remove it from the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={this.handleCancelDelete}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={this.handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }
}

export default PowerSensorDashboardRefactored;