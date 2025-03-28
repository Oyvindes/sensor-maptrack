import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

/**
 * Debug endpoint to test connection to Node-RED
 * GET /api/debug/test-node-red
 * Query params: protocol (http or https), imei, state
 */
router.get('/test-node-red', async (req, res) => {
  try {
    const { protocol = 'http', imei = 'TEST-IMEI', state = '1' } = req.query;
    
    // Build the URL based on the protocol
    const nodeRedUrl = `${protocol}://142.93.92.115:1880/powerplug?imei=${imei}&state=${state}`;
    
    console.log(`Testing connection to Node-RED: ${nodeRedUrl}`);
    
    // Make the request to Node-RED with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      const response = await fetch(nodeRedUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      // Get the response text
      const responseText = await response.text();
      
      // Return the result
      return res.status(200).json({
        success: true,
        nodeRedUrl,
        statusCode: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        responseText,
        responseJson: responseText ? tryParseJson(responseText) : null
      });
    } catch (error) {
      console.error(`Error connecting to Node-RED: ${error.name}: ${error.message}`);
      
      return res.status(500).json({
        success: false,
        nodeRedUrl,
        error: {
          name: error.name,
          message: error.message,
          isTimeout: error.name === 'AbortError'
        }
      });
    }
  } catch (error) {
    console.error('Unexpected error in debug endpoint:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'An unexpected error occurred in the debug endpoint',
      error: error.message
    });
  }
});

/**
 * Helper function to try parsing JSON
 */
function tryParseJson(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

export default router;