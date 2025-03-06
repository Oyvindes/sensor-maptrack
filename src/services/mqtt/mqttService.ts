
import mqtt, { MqttClient, IClientOptions } from 'mqtt';
import { toast } from 'sonner';
import { SensorData } from '@/components/SensorCard';

// Default MQTT broker settings
const DEFAULT_BROKER = 'mqtt://broker.emqx.io:1883';
const DEFAULT_CLIENT_ID = `briks-sensor-app-${Math.random().toString(16).substring(2, 10)}`;

// MQTT connection state
let mqttClient: MqttClient | null = null;
let isConnected = false;

// Connection options
const getDefaultOptions = (): IClientOptions => ({
  clientId: DEFAULT_CLIENT_ID,
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
});

/**
 * Connect to an MQTT broker
 */
export const connectToBroker = (
  brokerUrl: string = DEFAULT_BROKER, 
  options: IClientOptions = getDefaultOptions()
): Promise<boolean> => {
  return new Promise((resolve) => {
    // If already connected to the same broker, resolve immediately
    if (mqttClient && isConnected && mqttClient.options.href === brokerUrl) {
      resolve(true);
      return;
    }
    
    // Disconnect from existing broker if connected
    if (mqttClient) {
      mqttClient.end(true);
      mqttClient = null;
      isConnected = false;
    }
    
    // Connect to new broker
    console.log(`Connecting to MQTT broker: ${brokerUrl}`);
    mqttClient = mqtt.connect(brokerUrl, options);
    
    mqttClient.on('connect', () => {
      console.log('Connected to MQTT broker successfully');
      isConnected = true;
      toast.success('Connected to MQTT broker');
      resolve(true);
    });
    
    mqttClient.on('error', (err) => {
      console.error('MQTT connection error:', err);
      isConnected = false;
      toast.error(`MQTT connection error: ${err.message}`);
      resolve(false);
    });
    
    mqttClient.on('message', (topic, message) => {
      try {
        const payload = JSON.parse(message.toString());
        console.log(`Received message on topic ${topic}:`, payload);
        
        // Custom event that components can listen for
        const event = new CustomEvent('mqtt-message', {
          detail: { topic, payload }
        });
        window.dispatchEvent(event);
      } catch (e) {
        console.warn(`Failed to parse message from ${topic}:`, e);
      }
    });
  });
};

/**
 * Disconnect from the MQTT broker
 */
export const disconnectFromBroker = (): Promise<void> => {
  return new Promise((resolve) => {
    if (mqttClient) {
      mqttClient.end(true, {}, () => {
        isConnected = false;
        mqttClient = null;
        console.log('Disconnected from MQTT broker');
        toast.info('Disconnected from MQTT broker');
        resolve();
      });
    } else {
      resolve();
    }
  });
};

/**
 * Check if connected to the MQTT broker
 */
export const isMqttConnected = (): boolean => {
  return isConnected && mqttClient !== null;
};

/**
 * Get the MQTT connection status
 */
export const getMqttConnectionStatus = (): { connected: boolean; broker?: string } => {
  return {
    connected: isConnected,
    broker: mqttClient?.options.href
  };
};

/**
 * Subscribe to a topic
 */
export const subscribeTopic = (topic: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!mqttClient || !isConnected) {
      toast.error('Not connected to MQTT broker');
      resolve(false);
      return;
    }
    
    mqttClient.subscribe(topic, (err) => {
      if (err) {
        console.error(`Failed to subscribe to ${topic}:`, err);
        toast.error(`Failed to subscribe to ${topic}`);
        resolve(false);
      } else {
        console.log(`Subscribed to ${topic}`);
        toast.success(`Subscribed to ${topic}`);
        resolve(true);
      }
    });
  });
};

/**
 * Unsubscribe from a topic
 */
export const unsubscribeTopic = (topic: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!mqttClient || !isConnected) {
      resolve(false);
      return;
    }
    
    mqttClient.unsubscribe(topic, (err) => {
      if (err) {
        console.error(`Failed to unsubscribe from ${topic}:`, err);
        resolve(false);
      } else {
        console.log(`Unsubscribed from ${topic}`);
        resolve(true);
      }
    });
  });
};

/**
 * Publish a message to a topic
 */
export const publishMessage = (
  topic: string, 
  message: string | object
): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!mqttClient || !isConnected) {
      toast.error('Not connected to MQTT broker');
      resolve(false);
      return;
    }
    
    const payload = typeof message === 'string' ? message : JSON.stringify(message);
    
    mqttClient.publish(topic, payload, (err) => {
      if (err) {
        console.error(`Failed to publish to ${topic}:`, err);
        toast.error(`Failed to publish message`);
        resolve(false);
      } else {
        console.log(`Published to ${topic}:`, payload);
        resolve(true);
      }
    });
  });
};

/**
 * Generate an MQTT topic for a specific sensor
 */
export const getSensorTopic = (sensor: SensorData, action: string = 'data'): string => {
  // Format: briks/sensors/[sensorId]/[action]
  return `briks/sensors/${sensor.id}/${action}`;
};

/**
 * Send a command to a sensor via MQTT
 */
export const sendMqttCommandToSensor = async (
  sensorId: string,
  command: string,
  params?: Record<string, any>
): Promise<{ success: boolean; message: string }> => {
  if (!mqttClient || !isConnected) {
    await connectToBroker();
    if (!isConnected) {
      return {
        success: false,
        message: 'Failed to connect to MQTT broker'
      };
    }
  }
  
  const topic = `briks/sensors/${sensorId}/command`;
  const payload = {
    command,
    timestamp: new Date().toISOString(),
    ...(params || {})
  };
  
  const success = await publishMessage(topic, payload);
  
  return {
    success,
    message: success 
      ? `Command "${command}" sent to sensor ${sensorId} successfully via MQTT` 
      : `Failed to send command "${command}" to sensor ${sensorId}`
  };
};

/**
 * Register for sensor updates via MQTT
 */
export const registerForSensorUpdates = (
  sensor: SensorData,
  callback: (topic: string, payload: any) => void
): () => void => {
  const topic = getSensorTopic(sensor);
  
  // Subscribe to the sensor topic
  subscribeTopic(topic);
  
  // Create event listener
  const handleMqttMessage = (event: Event) => {
    const mqttEvent = event as CustomEvent;
    if (mqttEvent.detail.topic === topic) {
      callback(topic, mqttEvent.detail.payload);
    }
  };
  
  // Add event listener
  window.addEventListener('mqtt-message', handleMqttMessage);
  
  // Return cleanup function
  return () => {
    unsubscribeTopic(topic);
    window.removeEventListener('mqtt-message', handleMqttMessage);
  };
};
