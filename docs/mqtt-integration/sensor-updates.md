
# Registering for Sensor Updates

To receive real-time updates from sensors:

```typescript
import { registerForSensorUpdates } from '@/services/sensorService';

// Get a sensor object (with at least an id property)
const sensor = { id: "sensor-001", name: "My Sensor" };

// Register for updates
const cleanup = registerForSensorUpdates(sensor, (topic, payload) => {
  console.log(`Received data from ${sensor.name}:`, payload);
  // Update your UI with the new data
});

// Call the cleanup function when you no longer need updates
// cleanup();
```

This function returns a cleanup function that you should call when your component unmounts or when you no longer need to receive updates.
