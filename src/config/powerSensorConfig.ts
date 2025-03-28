/**
 * Power Sensor Configuration
 * This file contains all configuration values related to power sensors
 */

// API endpoints
export const API_ENDPOINTS = {
  POWER_TOGGLE: '/api/device/power-toggle',
  POWER_TOGGLE_AUTH: '/api/device/power-toggle-auth',
};

// Refresh intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  POWER_STATUS: 10000, // 10 seconds
  POWER_CONSUMPTION_1H: 5000, // 5 seconds
  POWER_CONSUMPTION_24H: 30000, // 30 seconds
};

// Local storage keys
export const STORAGE_KEYS = {
  POWER_SENSORS: 'power_sensors_data',
};

// Time constants (in milliseconds)
export const TIME_CONSTANTS = {
  ONE_HOUR: 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
  SEVEN_DAYS: 7 * 24 * 60 * 60 * 1000,
  THIRTY_DAYS: 30 * 24 * 60 * 60 * 1000,
  CONNECTION_TIMEOUT: 5 * 60 * 1000, // 5 minutes
};

// Node-RED configuration
export const NODE_RED_CONFIG = {
  BASE_URL: 'http://142.93.92.115:1880',
  ENDPOINTS: {
    POWER_PLUG: '/powerplug',
  },
  TIMEOUT: 5000, // 5 seconds
};

// Default values
export const DEFAULTS = {
  POWER_STATE: false,
  STATUS: 'offline' as const,
};