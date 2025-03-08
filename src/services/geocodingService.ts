/**
 * Geocoding service for Norwegian addresses
 * Uses OpenStreetMap's Nominatim service with Norway focus
 */

interface GeocodingResult {
  lat: number;
  lng: number;
  displayName?: string;
  success: boolean;
}
// Central coordinates for various Norwegian cities to be used as fallbacks
const NORWAY_COORDINATES = {
  DEFAULT: { lat: 61.497, lng: 8.468 }, // Central Norway
  OSLO: { lat: 59.9139, lng: 10.7522 },
  BERGEN: { lat: 60.3913, lng: 5.3221 },
  TRONDHEIM: { lat: 63.4305, lng: 10.3951 },
  STAVANGER: { lat: 58.9690, lng: 5.7331 },
  TROMSO: { lat: 69.6492, lng: 18.9553 }
};

// Use central Norway as default fallback
const NORWAY_DEFAULT = NORWAY_COORDINATES.DEFAULT;

/**
 * Get the best fallback coordinates for a Norwegian address
 * This tries to detect major cities in the address string and return appropriate coordinates
 */
const getBestFallbackCoordinates = (address: string): { lat: number; lng: number } => {
  const lowerAddress = address.toLowerCase();
  
  if (lowerAddress.includes('oslo')) {
    return NORWAY_COORDINATES.OSLO;
  } else if (lowerAddress.includes('bergen')) {
    return NORWAY_COORDINATES.BERGEN;
  } else if (lowerAddress.includes('trondheim')) {
    return NORWAY_COORDINATES.TRONDHEIM;
  } else if (lowerAddress.includes('stavanger')) {
    return NORWAY_COORDINATES.STAVANGER;
  } else if (lowerAddress.includes('tromsø') || lowerAddress.includes('tromso')) {
    return NORWAY_COORDINATES.TROMSO;
  }
  
  // Default to central Norway if no specific city is detected
  return NORWAY_DEFAULT;
};

/**
 * Geocode a Norwegian address to coordinates
 * @param address The address to geocode
 * @returns Promise with geocoding result containing coordinates
 */
export const geocodeAddress = async (address: string): Promise<GeocodingResult> => {
  if (!address) {
    return { ...NORWAY_DEFAULT, success: false };
  }
  
  // Add Norway as a suffix if not already included
  const searchAddress = address.toLowerCase().includes('norway')
    ? address
    : `${address}, Norway`;
  
  try {
    console.log(`Geocoding address: ${searchAddress}`);
    
    // Use OpenStreetMap's Nominatim service for geocoding
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchAddress)}&format=json&countrycodes=no&limit=1`, {
      headers: {
        'Accept-Language': 'no,en', // Prefer Norwegian results, fallback to English
        'User-Agent': 'SensorMapTrack/1.0' // Required by Nominatim ToS
      }
    });
    
    if (!response.ok) {
      console.error(`Geocoding error: ${response.statusText}`);
      const fallback = getBestFallbackCoordinates(address);
      return { ...fallback, success: false };
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      console.log(`Found geocoding result: ${result.display_name}`);
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        displayName: result.display_name,
        success: true
      };
    } else {
      console.warn(`No geocoding results found for address: ${address}`);
      const fallback = getBestFallbackCoordinates(address);
      return { ...fallback, success: false };
    }
  } catch (error) {
    console.error('Geocoding service error:', error);
    const fallback = getBestFallbackCoordinates(address);
    return { ...fallback, success: false };
  }
};

/**
 * Get coordinates for an address, with fallback to central Norway
 * Uses cached results when available
 */
const geocodingCache = new Map<string, GeocodingResult>();

export const getAddressCoordinates = async (address: string): Promise<{ lat: number; lng: number }> => {
  if (!address) {
    return NORWAY_DEFAULT;
  }
  
  // Check cache first
  if (geocodingCache.has(address)) {
    return geocodingCache.get(address) as GeocodingResult;
  }
  
  // Otherwise geocode the address
  const result = await geocodeAddress(address);
  
  // Cache the result
  geocodingCache.set(address, result);
  
  return { lat: result.lat, lng: result.lng };
};