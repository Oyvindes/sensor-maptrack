
# Sending Commands to Sensors

You can also send commands to sensors:

```typescript
import { sendMqttCommandToSensor } from '@/services/sensorService';

// Send a command to a sensor
await sendMqttCommandToSensor(
  "sensor-001",  // sensor ID 
  "set_interval", // command name
  { interval: 5000 } // optional parameters
);
```

Commands are published to a special command topic for each sensor (`briks/sensors/[sensorId]/command`). The sensor firmware should be configured to listen to this topic and respond to the commands.
