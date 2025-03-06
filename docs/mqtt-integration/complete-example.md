
# Example: Complete MQTT Workflow

Here's a complete example of how to use the MQTT service in your application:

```typescript
import { 
  connectToBroker, 
  disconnectFromBroker, 
  registerForSensorUpdates,
  sendMqttCommandToSensor
} from '@/services/sensorService';
import { useState, useEffect } from 'react';

function SensorMonitor() {
  const [isConnected, setIsConnected] = useState(false);
  const [sensorData, setSensorData] = useState(null);
  
  useEffect(() => {
    // Connect to MQTT broker when component mounts
    const setup = async () => {
      const connected = await connectToBroker();
      setIsConnected(connected);
      
      if (connected) {
        const sensor = { id: "sensor-001", name: "Sensor 1" };
        // Register for updates
        const cleanup = registerForSensorUpdates(sensor, (topic, data) => {
          setSensorData(data);
        });
        
        // Return cleanup function
        return cleanup;
      }
    };
    
    const cleanupFn = setup();
    
    // Disconnect when component unmounts
    return () => {
      if (cleanupFn) cleanupFn();
      disconnectFromBroker();
    };
  }, []);
  
  return (
    <div>
      <div>Connection status: {isConnected ? 'Connected' : 'Disconnected'}</div>
      {sensorData && <div>Latest data: {JSON.stringify(sensorData)}</div>}
      <button onClick={() => sendMqttCommandToSensor('sensor-001', 'refresh')}>
        Refresh Sensor
      </button>
    </div>
  );
}
```

This example shows a React component that:

1. Connects to the MQTT broker when mounted
2. Registers for updates from a specific sensor
3. Updates the UI when new data is received
4. Provides a button to send a command to the sensor
5. Properly cleans up connections when unmounting
