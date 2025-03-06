
# Understanding the MQTT Service

The application provides a complete MQTT client service that handles:
- Connecting to an MQTT broker
- Subscribing to topics
- Publishing messages
- Receiving real-time updates from sensors

This service is implemented in the `src/services/mqtt/mqttService.ts` file and exposed through the `src/services/sensorService.ts` module.

The MQTT service is designed to work with IoT sensors and devices, allowing real-time data communication between your application and connected hardware.
