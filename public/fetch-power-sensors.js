// Simple script to fetch power sensors directly from the database
// This bypasses all TypeScript code and React components

// Create a Supabase client
const createClient = () => {
  const supabaseUrl = 'https://pizujrwbfwcxdnjnuhws.supabase.co';
  // Note: This is a public anon key, not a secret
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpenVqcndiZndjeGRuam51aHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY4MjI0MDAsImV4cCI6MjAzMjM5ODQwMH0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
  return supabase.createClient(supabaseUrl, supabaseKey);
};

// Function to fetch power sensors
const fetchPowerSensors = async () => {
  const client = createClient();
  
  console.log('Attempting to fetch power sensors...');
  
  try {
    // First try using the get_all_power_sensors function
    console.log('Trying get_all_power_sensors function...');
    const { data: functionData, error: functionError } = await client.rpc('get_all_power_sensors');
    
    if (!functionError && functionData) {
      console.log('Successfully fetched power sensors using get_all_power_sensors function:');
      console.log(functionData);
      return functionData;
    } else {
      console.log('Error or no data from get_all_power_sensors function:', functionError);
      
      // Fall back to direct query
      console.log('Trying direct query to power_sensors table...');
      const { data: directData, error: directError } = await client
        .from('power_sensors')
        .select('*');
      
      if (!directError && directData) {
        console.log('Successfully fetched power sensors using direct query:');
        console.log(directData);
        return directData;
      } else {
        console.log('Error or no data from direct query:', directError);
        
        // Try querying the sensors table for sensors with sensorType = 'power'
        console.log('Trying query to sensors table for power sensors...');
        const { data: sensorsData, error: sensorsError } = await client
          .from('sensors')
          .select('*')
          .eq('sensor_type', 'power');
        
        if (!sensorsError && sensorsData) {
          console.log('Successfully fetched power sensors from sensors table:');
          console.log(sensorsData);
          return sensorsData;
        } else {
          console.log('Error or no data from sensors table query:', sensorsError);
          return null;
        }
      }
    }
  } catch (error) {
    console.error('Unexpected error in fetchPowerSensors:', error);
    return null;
  }
};

// Function to display power sensors in the DOM
const displayPowerSensors = (sensors) => {
  const container = document.getElementById('power-sensors-container');
  
  if (!sensors || sensors.length === 0) {
    container.innerHTML = `
      <div class="no-sensors">
        <p>No power sensors found in the database.</p>
      </div>
    `;
    return;
  }
  
  const sensorsList = sensors.map(sensor => `
    <div class="sensor-card">
      <h3>${sensor.name || 'Unnamed Sensor'}</h3>
      <div class="sensor-details">
        <p><strong>ID:</strong> ${sensor.id}</p>
        <p><strong>IMEI:</strong> ${sensor.imei || 'N/A'}</p>
        <p><strong>Status:</strong> ${sensor.status || 'Unknown'}</p>
        <p><strong>Company ID:</strong> ${sensor.company_id || 'N/A'}</p>
        <p><strong>Created:</strong> ${new Date(sensor.created_at).toLocaleString()}</p>
        <p><strong>Updated:</strong> ${new Date(sensor.updated_at).toLocaleString()}</p>
      </div>
    </div>
  `).join('');
  
  container.innerHTML = `
    <h2>Power Sensors (${sensors.length})</h2>
    <div class="sensors-grid">
      ${sensorsList}
    </div>
  `;
};

// Function to check database tables
const checkDatabaseTables = async () => {
  const client = createClient();
  const container = document.getElementById('database-info-container');
  
  try {
    // Check if power_sensors table exists
    const { data: powerSensorsExists, error: powerSensorsError } = await client.rpc('check_table_exists', { table_name: 'power_sensors' });
    
    // Check if sensors table exists
    const { data: sensorsExists, error: sensorsError } = await client.rpc('check_table_exists', { table_name: 'sensors' });
    
    // Get table counts
    const { data: powerSensorsCount, error: powerSensorsCountError } = await client.rpc('get_table_count', { table_name: 'power_sensors' });
    const { data: sensorsCount, error: sensorsCountError } = await client.rpc('get_table_count', { table_name: 'sensors' });
    
    container.innerHTML = `
      <h2>Database Information</h2>
      <div class="database-info">
        <p><strong>power_sensors table exists:</strong> ${powerSensorsExists ? 'Yes' : 'No'}</p>
        <p><strong>sensors table exists:</strong> ${sensorsExists ? 'Yes' : 'No'}</p>
        <p><strong>power_sensors count:</strong> ${powerSensorsCount || 'Error'}</p>
        <p><strong>sensors count:</strong> ${sensorsCount || 'Error'}</p>
      </div>
    `;
  } catch (error) {
    console.error('Error checking database tables:', error);
    container.innerHTML = `
      <h2>Database Information</h2>
      <div class="database-info">
        <p>Error checking database tables: ${error.message}</p>
      </div>
    `;
  }
};

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', async () => {
  // Create the RPC functions if they don't exist
  const client = createClient();
  
  try {
    // Create check_table_exists function
    await client.rpc('create_check_table_exists_function');
    
    // Create get_table_count function
    await client.rpc('create_get_table_count_function');
  } catch (error) {
    console.log('Error creating helper functions (they may already exist):', error);
  }
  
  // Fetch and display power sensors
  const sensors = await fetchPowerSensors();
  displayPowerSensors(sensors);
  
  // Check database tables
  await checkDatabaseTables();
  
  // Add event listener to refresh button
  document.getElementById('refresh-button').addEventListener('click', async () => {
    const sensors = await fetchPowerSensors();
    displayPowerSensors(sensors);
    await checkDatabaseTables();
  });
});