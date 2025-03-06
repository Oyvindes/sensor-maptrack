
# Connecting to the MQTT Broker

By default, the application uses a public MQTT broker at `mqtt://broker.emqx.io:1883`. You can connect to it programmatically:

```typescript
import { connectToBroker, disconnectFromBroker } from '@/services/sensorService';

// Connect to the default broker
await connectToBroker();

// Or connect to a custom broker with options
await connectToBroker('mqtt://your-broker-url:port', {
  username: 'your-username',
  password: 'your-password',
  clientId: 'custom-client-id'
});

// Disconnect when done
await disconnectFromBroker();
```

The connection status is automatically managed by the service, and toast notifications will inform users about connection events.
