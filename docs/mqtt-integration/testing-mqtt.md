
# Test with MQTT Explorer or Mosquitto

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

These tools provide a simple way to simulate sensor data without having to set up actual hardware.
