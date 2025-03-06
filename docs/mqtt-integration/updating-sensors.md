
# Sending Data to Update Sensors

To update a sensor's data via MQTT, publish a message to the sensor's topic:

```typescript
import { publishMessage, getSensorTopic } from '@/services/sensorService';

// Get the topic for a specific sensor
const topic = `briks/sensors/${sensorId}/data`;

// Create a payload with sensor values
const payload = {
  timestamp: new Date().toISOString(),
  values: [
    {
      type: "temperature",
      value: 25.4,
      unit: "°C"
    },
    {
      type: "humidity",
      value: 68,
      unit: "%"
    }
  ]
};

// Publish the message
await publishMessage(topic, payload);
```

The application will automatically process these updates and refresh the UI to display the latest sensor data.
