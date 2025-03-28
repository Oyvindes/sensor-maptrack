import express from 'express';
import { supabase } from '../supabaseClient.js';
import { authenticateToken } from '../middleware/auth.js';
import { handlePowerToggle } from './powerToggleHandler.js';

const router = express.Router();

/**
 * Toggle power state of a device
 * POST /api/device/toggle
 * Body: { deviceId: string, powerState: boolean, imei: string }
 */
router.post('/toggle', authenticateToken, async (req, res) => {
  try {
    const { deviceId, powerState, imei } = req.body;
    
    if (!deviceId || powerState === undefined || !imei) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required parameters: deviceId, powerState, or imei' 
      });
    }
    
    // Log the request
    console.log(`Power toggle request: Device ID ${deviceId}, IMEI ${imei}, State: ${powerState}`);
    
    // In a real implementation, this would send a command to the device
    // For this implementation, we'll just update the database
    
    // Update the device status in the database
    const { error } = await supabase
      .from('device_status')
      .update({
        power_state: powerState,
        last_toggled_at: new Date().toISOString(),
        last_toggled_by: req.user.id
      })
      .eq('device_id', deviceId);
    
    if (error) {
      console.error('Error updating device status:', error);
      return res.status(500).json({ 
        success: false, 
        message: `Database error: ${error.message}` 
      });
    }
    
    // Log the operation to the audit log
    const { error: auditError } = await supabase
      .from('device_audit_log')
      .insert({
        device_id: deviceId,
        operation_type: powerState ? 'power_on' : 'power_off',
        operation_details: { 
          imei,
          triggered_by: 'api',
          user_id: req.user.id
        },
        performed_by: req.user.id
      });
    
    if (auditError) {
      console.error('Error logging to audit log:', auditError);
      // Continue even if audit logging fails
    }
    
    return res.status(200).json({ 
      success: true, 
      message: `Device power ${powerState ? 'turned on' : 'turned off'} successfully` 
    });
  } catch (error) {
    console.error('Unexpected error in power toggle endpoint:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'An unexpected error occurred while toggling device power' 
    });
  }
});

/**
 * Toggle power state of a smart plug sensor
 * POST /api/device/power-toggle
 * Body: { sensorId: string, powerState: boolean, imei: string }
 */
router.post('/power-toggle', handlePowerToggle);

/**
 * Toggle power state of a smart plug sensor (with authentication)
 * POST /api/device/power-toggle-auth
 * Body: { sensorId: string, powerState: boolean, imei: string }
 */
router.post('/power-toggle-auth', authenticateToken, handlePowerToggle);

export default router;