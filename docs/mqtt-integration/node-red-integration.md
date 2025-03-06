
# Using Node-RED with MQTT to Send Sensor Data

You can use Node-RED as the MQTT client to send data to your sensors in this application. Here's how to set it up:

## Setting up a Node-RED Flow:

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

## Example Node-RED Flow:

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
