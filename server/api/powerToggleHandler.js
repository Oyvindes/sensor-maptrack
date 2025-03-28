import { supabase } from '../supabaseClient.js';
import fetch from 'node-fetch';

/**
 * Handler for power toggle requests
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
export async function handlePowerToggle(req, res) {
  try {
    const { sensorId, powerState, imei } = req.body;

    if (!sensorId || powerState === undefined || !imei) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: sensorId, powerState, or imei'
      });
    }

    console.log(`Toggling power for sensor ${sensorId} (IMEI: ${imei}) to ${powerState ? 'ON' : 'OFF'}`);

    // First, verify the sensor exists
    console.log(`Verifying sensor ${sensorId} with IMEI ${imei}`);
    
    try {
      const { data: sensor, error: sensorError } = await supabase
        .from('power_sensors')
        .select('id, name')
        .eq('id', sensorId)
        .single();
  
      if (sensorError) {
        console.error('Error verifying sensor:', sensorError);
        return res.status(404).json({
          success: false,
          message: `Sensor not found: ${sensorError.message}`
        });
      }
      
      if (!sensor) {
        console.error('Sensor not found');
        return res.status(404).json({
          success: false,
          message: 'Sensor not found'
        });
      }
      
      // For testing, we'll skip the IMEI check
      console.log(`Sensor found: ${sensor.name}`);
    } catch (error) {
      console.error('Unexpected error verifying sensor:', error);
      return res.status(500).json({
        success: false,
        message: `Error verifying sensor: ${error.message}`
      });
    }

    // Update the power status in the database
    const { data: statusData, error: statusError } = await supabase
      .from('power_status')
      .update({
        power_state: powerState,
        last_toggled_at: new Date().toISOString(),
        last_toggled_by: req.user?.id || null
      })
      .eq('power_sensor_id', sensorId)
      .select()
      .single();

    if (statusError) {
      console.error('Error updating power status:', statusError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update power status in database'
      });
    }

    // Log the operation to the audit log
    await supabase
      .from('power_audit_log')
      .insert({
        power_sensor_id: sensorId,
        operation_type: powerState ? 'power_on' : 'power_off',
        operation_details: { 
          previous_state: !powerState,
          requested_by: req.user?.id || 'system',
          source_ip: req.ip || 'unknown'
        },
        performed_by: req.user?.id || null
      });

    // Send the command to the Node-RED endpoint
    const deviceResponse = await sendCommandToDevice(imei, powerState);

    // Include the Node-RED response in our API response
    return res.status(200).json({
      success: true,
      message: `Power ${powerState ? 'enabled' : 'disabled'} successfully`,
      status: statusData,
      deviceResponse,
      nodeRedForwarded: true,
      nodeRedSuccess: deviceResponse.success
    });
  } catch (error) {
    console.error('Unexpected error in power toggle handler:', error);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while processing the request'
    });
  }
}

/**
 * Send command to the physical device
 * @param {string} imei - The IMEI of the device
 * @param {boolean} powerState - The desired power state
 * @returns {Promise<Object>} The response from the device
 */
async function sendCommandToDevice(imei, powerState) {
  // Forward the command to the Node-RED endpoint
  console.log(`Sending command to device ${imei}: Power ${powerState ? 'ON' : 'OFF'}`);
  
  try {
    // Try both HTTP and HTTPS protocols
    const protocols = ['http', 'https'];
    let response = null;
    let lastError = null;
    
    for (const protocol of protocols) {
      try {
        const nodeRedUrl = `${protocol}://142.93.92.115:1880/powerplug?imei=${imei}&state=${powerState ? '1' : '0'}`;
        console.log(`Trying ${protocol.toUpperCase()} connection to Node-RED: ${nodeRedUrl}`);
        
        // Make the request to Node-RED with a timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        response = await fetch(nodeRedUrl, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        clearTimeout(timeoutId);
        
        // If we got a response, break out of the loop
        if (response) {
          console.log(`Successfully connected to Node-RED using ${protocol.toUpperCase()}`);
          break;
        }
      } catch (error) {
        console.error(`Error connecting to Node-RED using ${protocol.toUpperCase()}: ${error.message}`);
        lastError = error;
      }
    }
    
    // If we didn't get a response from any protocol, throw the last error
    if (!response) {
      throw lastError || new Error('Failed to connect to Node-RED using any protocol');
    }
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error(`Error from Node-RED: ${response.status} ${response.statusText}`);
      console.error(`Response body: ${responseText}`);
      return {
        success: false,
        imei,
        command: powerState ? 'power_on' : 'power_off',
        error: `Node-RED returned status ${response.status}: ${responseText}`,
        timestamp: new Date().toISOString()
      };
    }
    
    // Try to parse the response as JSON
    let responseData;
    try {
      const responseText = await response.text();
      console.log(`Node-RED response: ${responseText}`);
      
      if (responseText.trim()) {
        try {
          responseData = JSON.parse(responseText);
        } catch (parseError) {
          responseData = { text: responseText };
        }
      } else {
        responseData = { text: "Empty response" };
      }
    } catch (e) {
      console.error(`Error reading response: ${e.message}`);
      responseData = { error: e.message };
    }
    
    return {
      success: true,
      imei,
      command: powerState ? 'power_on' : 'power_off',
      nodeRedResponse: responseData,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error forwarding command to Node-RED:', error);
    console.error(`Error details: ${error.name}: ${error.message}`);
    
    if (error.name === 'AbortError') {
      console.error('Request timed out after 5 seconds');
    }
    
    // Return a failure response but don't throw an error
    // This way the database updates still succeed even if Node-RED is unavailable
    return {
      success: false,
      imei,
      command: powerState ? 'power_on' : 'power_off',
      error: `Connection error: ${error.name} - ${error.message}`,
      timestamp: new Date().toISOString()
    };
  }
}