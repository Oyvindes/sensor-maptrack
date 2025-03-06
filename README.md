
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/e1b6c016-6bcd-4a1c-bcd9-226e72862ca1

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/e1b6c016-6bcd-4a1c-bcd9-226e72862ca1) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How to connect and send data from sensors

This application includes a built-in MQTT service that allows you to connect to and receive data from IoT sensors in real-time. Below is a step-by-step guide on how to use this functionality.

### 1. Understanding the MQTT Service

The application provides a complete MQTT client service that handles:
- Connecting to an MQTT broker
- Subscribing to topics
- Publishing messages
- Receiving real-time updates from sensors

### 2. Connecting to the MQTT Broker

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

### 3. Using Node-RED with MQTT to Send Sensor Data

You can use Node-RED as the MQTT client to send data to your sensors in this application. Here's how to set it up:

#### Setting up a Node-RED Flow:

1. **Install Node-RED** if you haven't already: [Node-RED Installation Guide](https://nodered.org/docs/getting-started/installation)

2. **Add MQTT nodes** to your Node-RED instance:
   - In Node-RED, go to the menu (top right) > Manage palette
   - Go to the "Install" tab
   - Search for "node-red-contrib-mqtt-broker" and install it

3. **Configure an MQTT node:**
   - Drag an MQTT output node onto your workflow
   - Double-click to configure it
   - Set the broker to `broker.emqx.io` with port `1883` (or your custom broker)
   - Set the topic to match the sensor format: `briks/sensors/[sensorId]/data`

4. **Create a payload with the expected format:**
   - Add a function node before the MQTT node
   - Configure it to output a properly formatted JSON payload:

```javascript
// Example Node-RED function node code
msg.payload = {
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
return msg;
```

5. **Deploy your Node-RED flow** and trigger it to send data to your sensors

#### Example Node-RED Flow:

```json
[
  {
    "id": "trigger-node",
    "type": "inject",
    "name": "Trigger every 5s",
    "topic": "",
    "payload": "",
    "repeat": "5",
    "crontab": "",
    "once": false
  },
  {
    "id": "prepare-sensor-data",
    "type": "function",
    "name": "Format Sensor Data",
    "func": "msg.payload = {\n    timestamp: new Date().toISOString(),\n    values: [\n        {\n            type: \"temperature\",\n            value: 20 + Math.random() * 10,\n            unit: \"°C\"\n        },\n        {\n            type: \"humidity\",\n            value: Math.round(60 + Math.random() * 20),\n            unit: \"%\"\n        }\n    ]\n};\nreturn msg;",
    "outputs": 1
  },
  {
    "id": "mqtt-out",
    "type": "mqtt out",
    "name": "Send to Sensor",
    "topic": "briks/sensors/sensor-001/data",
    "broker": "broker"
  },
  {
    "id": "broker",
    "type": "mqtt-broker",
    "name": "Public Broker",
    "broker": "broker.emqx.io",
    "port": "1883"
  },
  {
    "id": "connections",
    "wires": [
      ["trigger-node", "prepare-sensor-data"],
      ["prepare-sensor-data", "mqtt-out"]
    ]
  }
]
```

### 4. Sending Data to Update Sensors

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

### 5. Sending Commands to Sensors

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

### 6. Registering for Sensor Updates

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

### 7. Test with MQTT Explorer or Mosquitto

You can use tools like MQTT Explorer or Mosquitto clients to test sending data to your application:

1. Connect to the same broker (e.g., `mqtt://broker.emqx.io:1883`)
2. Publish a message to a sensor topic (e.g., `briks/sensors/sensor-001/data`)
3. Use JSON format for the message payload:

```json
{
  "timestamp": "2023-08-15T12:34:56Z",
  "values": [
    {
      "type": "temperature",
      "value": 22.5,
      "unit": "°C"
    }
  ]
}
```

### 8. Example: Complete MQTT Workflow

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

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/e1b6c016-6bcd-4a1c-bcd9-226e72862ca1) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
