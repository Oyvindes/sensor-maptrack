
# Understanding the MQTT Service

The application provides a complete MQTT client service that handles:
- Connecting to an MQTT broker
- Subscribing to topics
- Publishing messages
- Receiving real-time updates from sensors
- Handling notifications (replacing traditional email functionality)

This service is implemented in the `src/services/mqtt/mqttService.ts` file and exposed through the `src/services/sensorService.ts` module.

The MQTT service is designed to work with IoT sensors and devices, allowing real-time data communication between your application and connected hardware. It also serves as the primary notification system, replacing traditional email-based notifications with real-time MQTT messages.

## Using with Node-RED

The application is configured to work seamlessly with Node-RED for MQTT message handling. You can use Node-RED to create flows that process and transform sensor data before sending it to the web application.

See the [Node-RED Integration](./node-red-integration.md) documentation for more details.
