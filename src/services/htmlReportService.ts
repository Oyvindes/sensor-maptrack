import { SensorFolder } from '@/types/users';
import { format } from 'date-fns';
import { fetchSensors } from './sensor/supabaseSensorService';

/**
 * Generate an HTML report for a project and open it in a new tab
 * @param project The project to generate a report for
 * @param dataTypes Array of data types to include in the report (temperature, humidity, battery, signal, adc1)
 */
export async function generateHtmlReport(
  project: SensorFolder,
  dataTypes: string[] = ['temperature', 'humidity', 'battery', 'signal', 'adc1']
): Promise<void> {
  try {
    // Fetch sensor data for the project
    const allSensors = await fetchSensors();
    const projectSensors = allSensors.filter(sensor =>
      project.assignedSensorImeis?.includes(sensor.imei)
    );

    // Value type configurations
    const valueConfigs = {
      temperature: { color: '#ff4444', label: 'Temperature', unit: '°C' },
      humidity: { color: '#4444ff', label: 'Concrete', unit: '%' },
      battery: { color: '#44ff44', label: 'Battery', unit: '%' },
      signal: { color: '#ff44ff', label: 'Signal', unit: '%' },
      adc1: { color: '#8B4513', label: 'Wood', unit: '%' }
    };

    // Start building the HTML content
    let htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Project Report: ${project.name}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          h1, h2, h3 {
            color: #222;
          }
          .project-info {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .sensor-section {
            margin-bottom: 30px;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
          }
          .sensor-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
          }
          .sensor-values {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-bottom: 20px;
          }
          .sensor-value {
            padding: 10px;
            border-radius: 5px;
            min-width: 120px;
          }
          .chart-container {
            height: 300px;
            margin-bottom: 30px;
            background-color: #f9f9f9;
            border-radius: 5px;
            padding: 10px;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 0.8em;
            color: #666;
          }
          @media print {
            body {
              padding: 0;
              margin: 0;
            }
            .chart-container {
              break-inside: avoid;
              page-break-inside: avoid;
            }
            .sensor-section {
              break-inside: avoid;
              page-break-inside: avoid;
            }
          }
        </style>
        <!-- Include Chart.js for rendering charts -->
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      </head>
      <body>
        <h1>Project Report: ${project.name}</h1>
        
        <div class="project-info">
          <h2>Project Details</h2>
          <p><strong>Project Number:</strong> ${project.projectNumber || 'N/A'}</p>
          <p><strong>Address:</strong> ${project.address || 'N/A'}</p>
          <p><strong>Created By:</strong> ${project.creatorName || 'Unknown'}</p>
          <p><strong>Created On:</strong> ${format(new Date(project.createdAt), 'yyyy-MM-dd')}</p>
          ${project.startedAt ? `<p><strong>Started:</strong> ${format(new Date(project.startedAt), 'yyyy-MM-dd HH:mm')}</p>` : ''}
          ${project.stoppedAt ? `<p><strong>Stopped:</strong> ${format(new Date(project.stoppedAt), 'yyyy-MM-dd HH:mm')}</p>` : ''}
        </div>
    `;

    // Add sensor data sections
    for (const sensor of projectSensors) {
      // Get sensor location, zone, and type if available
      const sensorLocation = project.sensorLocations?.[sensor.imei] || '';
      const sensorZone = project.sensorZones?.[sensor.imei] || '';
      const sensorType = project.sensorTypes?.[sensor.imei] || '';
      
      // Create a display name that includes location, zone, and type if available
      let displayName = sensor.name;
      let locationInfo = '';
      
      if (sensorLocation) {
        locationInfo += sensorLocation;
        if (sensorZone) {
          locationInfo += `, ${sensorZone} zone`;
        }
        if (sensorType) {
          locationInfo += `, ${sensorType}`;
        }
      } else if (sensorZone) {
        locationInfo += `${sensorZone} zone`;
        if (sensorType) {
          locationInfo += `, ${sensorType}`;
        }
      } else if (sensorType) {
        locationInfo += sensorType;
      }

      htmlContent += `
        <div class="sensor-section">
          <div class="sensor-header">
            <h2>${displayName}</h2>
            <div>${locationInfo ? `(${locationInfo})` : ''}</div>
          </div>
      `;

      // Check if sensor has values
      if (!sensor.values || sensor.values.length === 0) {
        htmlContent += `<p>No data available for this sensor</p>`;
        htmlContent += `</div>`;
        continue;
      }

      // Process sensor values
      let processedValues = [];
      for (const value of sensor.values) {
        try {
          const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
          
          // Format the values appropriately
          const formattedValue = {
            ...parsedValue,
            time: new Date(parsedValue.time).toISOString(),
            formattedTime: format(new Date(parsedValue.time), 'MM/dd HH:mm'),
            // Apply the same transformations as in the UI
            batteryPercentage: ((parsedValue.battery - 2.5) / 1.1) * 100,
            signalPercentage: parsedValue.signal * 3.33
          };
          
          processedValues.push(formattedValue);
        } catch (e) {
          console.error('Error parsing sensor value:', e);
        }
      }

      // Sort by time
      processedValues.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

      // Get latest values for each selected data type
      if (processedValues.length > 0) {
        const latestValue = processedValues[processedValues.length - 1];
        
        htmlContent += `<h3>Latest Values</h3><div class="sensor-values">`;
        
        for (const dataType of dataTypes) {
          // Skip humidity or adc1 based on sensor type setting
          if ((dataType === 'humidity' && sensorType === 'wood') || 
              (dataType === 'adc1' && sensorType === 'concrete')) {
            continue;
          }

          if (dataType in valueConfigs) {
            const config = valueConfigs[dataType as keyof typeof valueConfigs];
            let displayValue;
            
            // Get the appropriate value based on data type
            if (dataType === 'battery') {
              displayValue = latestValue.batteryPercentage;
            } else if (dataType === 'signal') {
              displayValue = latestValue.signalPercentage;
            } else {
              displayValue = latestValue[dataType];
            }
            
            htmlContent += `
              <div class="sensor-value" style="background-color: ${config.color}20; border: 1px solid ${config.color}">
                <div style="color: ${config.color}; font-weight: bold;">${config.label}</div>
                <div style="font-size: 1.2em;">${displayValue.toFixed(1)}${config.unit}</div>
              </div>
            `;
          }
        }
        
        htmlContent += `</div>`;

        // Add charts for each data type
        for (const dataType of dataTypes) {
          // Skip humidity or adc1 based on sensor type setting
          if ((dataType === 'humidity' && sensorType === 'wood') || 
              (dataType === 'adc1' && sensorType === 'concrete')) {
            continue;
          }

          if (dataType in valueConfigs && processedValues.length > 1) {
            const config = valueConfigs[dataType as keyof typeof valueConfigs];
            const chartId = `chart-${sensor.imei}-${dataType}`;
            
            htmlContent += `
              <h3>${config.label} Chart</h3>
              <div class="chart-container">
                <canvas id="${chartId}"></canvas>
              </div>
            `;
          }
        }
      }

      htmlContent += `</div>`;
    }

    // Add footer and close HTML tags
    htmlContent += `
        <div class="footer">
          <p>Report generated on ${format(new Date(), 'yyyy-MM-dd HH:mm')}</p>
        </div>
        
        <script>
          // Initialize charts after page loads
          window.onload = function() {
            // Set up charts
    `;

    // Add chart initialization code
    for (const sensor of projectSensors) {
      if (!sensor.values || sensor.values.length === 0) continue;
      
      // Get sensor type if available
      const sensorType = project.sensorTypes?.[sensor.imei] || '';

      // Process sensor values
      let processedValues = [];
      for (const value of sensor.values) {
        try {
          const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
          
          // Format the values appropriately
          const formattedValue = {
            ...parsedValue,
            time: new Date(parsedValue.time).toISOString(),
            formattedTime: format(new Date(parsedValue.time), 'MM/dd HH:mm'),
            // Apply the same transformations as in the UI
            batteryPercentage: ((parsedValue.battery - 2.5) / 1.1) * 100,
            signalPercentage: parsedValue.signal * 3.33
          };
          
          processedValues.push(formattedValue);
        } catch (e) {
          console.error('Error parsing sensor value:', e);
        }
      }

      // Sort by time
      processedValues.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

      for (const dataType of dataTypes) {
        // Skip humidity or adc1 based on sensor type setting
        if ((dataType === 'humidity' && sensorType === 'wood') || 
            (dataType === 'adc1' && sensorType === 'concrete')) {
          continue;
        }

        if (dataType in valueConfigs && processedValues.length > 1) {
          const config = valueConfigs[dataType as keyof typeof valueConfigs];
          const chartId = `chart-${sensor.imei}-${dataType}`;
          
          // Extract data for the chart
          const labels = processedValues.map(v => v.formattedTime);
          let data;
          
          if (dataType === 'battery') {
            data = processedValues.map(v => v.batteryPercentage);
          } else if (dataType === 'signal') {
            data = processedValues.map(v => v.signalPercentage);
          } else {
            data = processedValues.map(v => v[dataType]);
          }
          
          htmlContent += `
            // Initialize ${config.label} chart for sensor ${sensor.imei}
            (function() {
              const ctx = document.getElementById('${chartId}');
              if (ctx) {
                new Chart(ctx, {
                  type: 'line',
                  data: {
                    labels: ${JSON.stringify(labels)},
                    datasets: [{
                      label: '${config.label}',
                      data: ${JSON.stringify(data)},
                      borderColor: '${config.color}',
                      backgroundColor: '${config.color}20',
                      borderWidth: 2,
                      tension: 0.1,
                      fill: true
                    }]
                  },
                  options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: ${dataType === 'temperature' ? 'false' : 'true'},
                        title: {
                          display: true,
                          text: '${config.unit}'
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Time'
                        }
                      }
                    }
                  }
                });
              }
            })();
          `;
        }
      }
    }

    // Add auto-print functionality and close script/body/html tags
    htmlContent += `
            // Auto-trigger print dialog after charts are rendered
            setTimeout(function() {
              window.print();
            }, 1000);
          };
        </script>
      </body>
      </html>
    `;

    // Open the HTML report in a new tab
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    } else {
      console.error('Failed to open new window. Pop-up blocker might be enabled.');
      throw new Error('Failed to open new window. Pop-up blocker might be enabled.');
    }

    return;
  } catch (error) {
    console.error('Error generating HTML report:', error);
    throw error;
  }
}