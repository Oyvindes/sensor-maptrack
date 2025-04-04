import { SensorFolder } from '@/types/users';
import { format } from 'date-fns';
import { fetchSensors } from './sensor/supabaseSensorService';
import { htmlToBlob, saveReportRecord } from './report/reportService';
import { getCurrentUser } from './authService';
import { woodSensorToPercentage } from '@/utils/sensorUtils';

/**
 * Generate an HTML report for a project and open it in a new tab
 * @param project The project to generate a report for
 * @param dataTypes Array of data types to include in the report (temperature, humidity, battery, signal, adc1)
 * @param saveToHistory Whether to save the report to the project history
 * @returns Updated project with new report history if saveToHistory is true
 */
export async function generateHtmlReport(
  project: SensorFolder,
  dataTypes: string[] = ['humidity', 'adc1', 'temperature', 'battery', 'signal'],
  saveToHistory: boolean = true,
  selectedValueTypes?: Record<string, string[]> // Add parameter for selected value types
): Promise<SensorFolder> {
  try {
    // Fetch sensor data for the project
    const allSensors = await fetchSensors();
    const projectSensors = allSensors.filter(sensor =>
      project.assignedSensorImeis?.includes(sensor.imei)
    );

    // Value type configurations
    const valueConfigs = {
      humidity: { color: '#4444ff', label: 'Concrete', unit: '%' },
      adc1: { color: '#8B4513', label: 'Wood', unit: '%' },
      temperature: { color: '#ff4444', label: 'Temperature', unit: '°C' },
      battery: { color: '#44ff44', label: 'Battery', unit: '%' },
      signal: { color: '#ff44ff', label: 'Signal', unit: '%' }
    };

    // Get the current theme from the document element
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    
    // Add script to access selections in the new window
    const selectionScript = `
      <script>
        // Function to check if a sensor is selected
        function isSensorSelected(imei) {
          if (!window.REPORT_SELECTIONS) return true;
          return window.REPORT_SELECTIONS.selectedSensorImeis.includes(imei);
        }
        
        // Function to check if a value is selected for a sensor
        function isValueSelected(sensorImei, valueId) {
          if (!window.REPORT_SELECTIONS) return true;
          if (!window.REPORT_SELECTIONS.sensorValueSelections[sensorImei]) return true;
          return window.REPORT_SELECTIONS.sensorValueSelections[sensorImei].includes(valueId);
        }
      </script>
    `;
    
    // Start building the HTML content
    let htmlContent = `
      <!DOCTYPE html>
      <html lang="en" class="${currentTheme}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Project Report: ${project.name}</title>
        <style>
          :root {
            color-scheme: light dark;
          }
          
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: white;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          
          html.dark body {
            color: #e1e1e1;
            background-color: #1a1a1a;
          }
          h1, h2, h3 {
            color: #222;
          }
          
          html.dark h1, html.dark h2, html.dark h3 {
            color: #e1e1e1;
          }
          
          .project-info {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          
          html.dark .project-info {
            background-color: #2a2a2a;
          }
          
          .sensor-section {
            margin-bottom: 30px;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
          }
          
          html.dark .sensor-section {
            border-color: #444;
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
          .chart-section {
            break-inside: avoid;
            page-break-inside: avoid;
            margin-bottom: 30px;
          }
          .chart-title {
            margin-bottom: 10px;
          }
          .chart-container {
            height: 300px;
            background-color: #f9f9f9;
            border-radius: 5px;
            padding: 10px;
          }
          
          html.dark .chart-container {
            background-color: #2a2a2a;
          }
          
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 0.8em;
            color: #666;
          }
          
          html.dark .footer {
            color: #999;
          }
          @media print {
            body {
              padding: 20px;
              margin: 0;
              color: #333;
              background-color: white !important;
              font-family: Arial, sans-serif;
              line-height: 1.6;
            }
            
            html.dark body {
              color: #333 !important;
              background-color: white !important;
            }
            
            h1, h2, h3 {
              color: #222 !important;
            }
            .project-info {
              background-color: #f5f5f5 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              color-adjust: exact;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            .sensor-section {
              break-inside: avoid;
              page-break-inside: avoid;
              border: 1px solid #ddd !important;
              border-radius: 5px;
              padding: 15px;
              margin-bottom: 30px;
            }
            .sensor-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 15px;
            }
            .sensor-info {
              background-color: #f0f8ff !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              color-adjust: exact;
              padding: 8px;
              border-radius: 4px;
              margin-bottom: 15px;
              border-left: 4px solid #4444ff !important;
            }
            .values-container {
              display: flex !important;
              flex-wrap: wrap !important;
              gap: 20px !important;
              margin-bottom: 20px !important;
            }
            .values-column {
              flex: 1 !important;
              min-width: 300px !important;
              border: 1px solid #eee !important;
              padding: 10px !important;
              border-radius: 5px !important;
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
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              color-adjust: exact;
            }
            .chart-section {
              break-inside: avoid;
              page-break-inside: avoid;
              margin-bottom: 30px;
            }
            .chart-title {
              margin-bottom: 10px;
              break-after: avoid;
              page-break-after: avoid;
            }
            .chart-container {
              break-inside: avoid;
              page-break-inside: avoid;
              height: 300px;
              background-color: #f9f9f9 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              color-adjust: exact;
              border-radius: 5px;
              padding: 10px;
            }
            canvas {
              max-width: 100%;
              height: auto !important;
            }
          }
        </style>
        <!-- Include Chart.js for rendering charts -->
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        ${selectionScript}
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
      // Add a check in the HTML to skip sensors that aren't selected
      htmlContent += `
        <div class="sensor-section">
          <script>
            if (!isSensorSelected("${sensor.imei}")) {
              document.currentScript.parentNode.style.display = "none";
            }
          </script>
      `;

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
          <div class="sensor-header">
            <h2>${displayName}</h2>
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

      // Get start and end values for each selected data type
      if (processedValues.length > 0) {
        const firstValue = processedValues[0];
        const latestValue = processedValues[processedValues.length - 1];
        
        // Add CSS for the values container
        htmlContent += `
          <style>
            .sensor-info {
              background-color: #f0f8ff;
              padding: 8px;
              border-radius: 4px;
              margin-bottom: 15px;
              border-left: 4px solid #4444ff;
            }
            
            html.dark .sensor-info {
              background-color: #1a2a3a;
            }
            
            .values-container {
              display: flex;
              flex-wrap: wrap;
              gap: 20px;
              margin-bottom: 20px;
            }
            
            .values-column {
              flex: 1;
              min-width: 300px;
              border: 1px solid #eee;
              padding: 10px;
              border-radius: 5px;
            }
            
            html.dark .values-column {
              border-color: #444;
            }
          </style>
        `;
        
        htmlContent += `
          <!-- Sensor Info -->
          <div class="sensor-info">
            <strong>Placement:</strong> ${sensorLocation || 'Not specified'} |
            <strong>Zone:</strong> ${sensorZone ? `${sensorZone} zone` : 'Not specified'} |
            <strong>Material Type:</strong> ${sensorType || 'Not specified'}
          </div>
          
          <div class="values-container">
            <div class="values-column">
              <h3>Start Values (${format(new Date(firstValue.time), 'yyyy-MM-dd HH:mm')})</h3>
              <div class="sensor-values">
        `;
        
        // Add start values
        for (const dataType of dataTypes) {
          // Skip humidity or adc1 based on sensor type setting
          if ((dataType === 'humidity' && sensorType === 'wood') ||
              (dataType === 'adc1' && sensorType === 'concrete')) {
            continue;
          }

          if (dataType in valueConfigs) {
            const config = valueConfigs[dataType as keyof typeof valueConfigs];
            
            // Handle main value if selected
            const valueId = `${dataType}_value`;
            
            // Check if this value is selected for this sensor
            const isValueSelected = selectedValueTypes &&
                                   selectedValueTypes[sensor.imei] &&
                                   selectedValueTypes[sensor.imei].includes(valueId);
            
            if (isValueSelected) {
              htmlContent += `
                <div class="sensor-value" style="background-color: ${config.color}20 !important; border: 1px solid ${config.color} !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact;">
                  <div style="color: ${config.color} !important; font-weight: bold; -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact;">${config.label}</div>
                  <div style="font-size: 1.2em;">
            `;
            
            // Get the appropriate value based on data type
            let displayValue;
            let displayText;
            
            if (dataType === 'battery') {
              displayValue = firstValue.batteryPercentage;
              displayText = `${displayValue.toFixed(1)}${config.unit}`;
            } else if (dataType === 'signal') {
              displayValue = firstValue.signalPercentage;
              displayText = `${displayValue.toFixed(1)}${config.unit}`;
            } else if (dataType === 'adc1') {
              // Use the woodSensorToPercentage function for wood moisture
              displayValue = firstValue[dataType];
              displayText = woodSensorToPercentage(displayValue);
            } else {
              displayValue = firstValue[dataType];
              displayText = `${displayValue.toFixed(1)}${config.unit}`;
            }
            
            htmlContent += `${displayText}</div>
                </div>
              `;
            }
            
            // Handle min value if applicable and if selected
            if (['humidity', 'adc1', 'temperature'].includes(dataType)) {
              const minValueId = `${dataType}_min`;
              
              // Check if this min value is selected for this sensor
              const isMinSelected = selectedValueTypes &&
                                   selectedValueTypes[sensor.imei] &&
                                   selectedValueTypes[sensor.imei].includes(minValueId);
              
              if (isMinSelected) {
                htmlContent += `
                  <div class="sensor-value" style="background-color: ${config.color}10 !important; border: 1px solid ${config.color} !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact;">
                    <div style="color: ${config.color} !important; font-weight: bold; -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact;">${config.label} (Min)</div>
                    <div style="font-size: 1.2em;">
                `;
                
                // Get min value
                let minValue = Math.min(...processedValues.map(v => v[dataType]));
                let minDisplayText;
                
                if (dataType === 'adc1') {
                  // Use the woodSensorToPercentage function for wood moisture
                  minDisplayText = woodSensorToPercentage(minValue);
                } else {
                  minDisplayText = `${minValue.toFixed(1)}${config.unit}`;
                }
                
                htmlContent += `${minDisplayText}</div>
                  </div>
                `;
              }
            }
            
            // Handle max value if applicable and if selected
            if (['humidity', 'adc1', 'temperature'].includes(dataType)) {
              const maxValueId = `${dataType}_max`;
              
              // Check if this max value is selected for this sensor
              const isMaxSelected = selectedValueTypes &&
                                   selectedValueTypes[sensor.imei] &&
                                   selectedValueTypes[sensor.imei].includes(maxValueId);
              
              if (isMaxSelected) {
                htmlContent += `
                  <div class="sensor-value" style="background-color: ${config.color}10 !important; border: 1px solid ${config.color} !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact;">
                    <div style="color: ${config.color} !important; font-weight: bold; -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact;">${config.label} (Max)</div>
                    <div style="font-size: 1.2em;">
                `;
                
                // Get max value
                let maxValue = Math.max(...processedValues.map(v => v[dataType]));
                let maxDisplayText;
                
                if (dataType === 'adc1') {
                  // Use the woodSensorToPercentage function for wood moisture
                  maxDisplayText = woodSensorToPercentage(maxValue);
                } else {
                  maxDisplayText = `${maxValue.toFixed(1)}${config.unit}`;
                }
                
                htmlContent += `${maxDisplayText}</div>
                  </div>
                `;
              }
            }
          }
        }
        
        htmlContent += `
              </div>
            </div>
            <div class="values-column">
              <h3>Latest Values (${format(new Date(latestValue.time), 'yyyy-MM-dd HH:mm')})</h3>
              <div class="sensor-values">
        `;
        
        for (const dataType of dataTypes) {
          // Skip humidity or adc1 based on sensor type setting
          if ((dataType === 'humidity' && sensorType === 'wood') || 
              (dataType === 'adc1' && sensorType === 'concrete')) {
            continue;
          }

          if (dataType in valueConfigs) {
            const config = valueConfigs[dataType as keyof typeof valueConfigs];
            const valueId = `${dataType}_value`;
            
            // Check if this value is selected for this sensor
            const isValueSelected = selectedValueTypes &&
                                   selectedValueTypes[sensor.imei] &&
                                   selectedValueTypes[sensor.imei].includes(valueId);
            
            if (isValueSelected) {
              htmlContent += `
                <div class="sensor-value" style="background-color: ${config.color}20 !important; border: 1px solid ${config.color} !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact;">
                  <div style="color: ${config.color} !important; font-weight: bold; -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact;">${config.label}</div>
                  <div style="font-size: 1.2em;">
            `;
            
            // Get the appropriate value based on data type
            let displayValue;
            let displayText;
            
            if (dataType === 'battery') {
              displayValue = latestValue.batteryPercentage;
              displayText = `${displayValue.toFixed(1)}${config.unit}`;
            } else if (dataType === 'signal') {
              displayValue = latestValue.signalPercentage;
              displayText = `${displayValue.toFixed(1)}${config.unit}`;
            } else if (dataType === 'adc1') {
              // Use the woodSensorToPercentage function for wood moisture
              displayValue = latestValue[dataType];
              displayText = woodSensorToPercentage(displayValue);
            } else {
              displayValue = latestValue[dataType];
              displayText = `${displayValue.toFixed(1)}${config.unit}`;
            }
            
            htmlContent += `${displayText}</div>
                </div>
              `;
            }
            
            // Handle min value if applicable and if selected
            if (['humidity', 'adc1', 'temperature'].includes(dataType)) {
              const minValueId = `${dataType}_min`;
              
              // Check if this min value is selected for this sensor
              const isMinSelected = selectedValueTypes &&
                                   selectedValueTypes[sensor.imei] &&
                                   selectedValueTypes[sensor.imei].includes(minValueId);
              
              if (isMinSelected) {
                htmlContent += `
                  <div class="sensor-value" style="background-color: ${config.color}10 !important; border: 1px solid ${config.color} !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact;">
                    <div style="color: ${config.color} !important; font-weight: bold; -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact;">${config.label} (Min)</div>
                    <div style="font-size: 1.2em;">
                `;
                
                // Get min value
                let minValue = Math.min(...processedValues.map(v => v[dataType]));
                let minDisplayText;
                
                if (dataType === 'adc1') {
                  // Use the woodSensorToPercentage function for wood moisture
                  minDisplayText = woodSensorToPercentage(minValue);
                } else {
                  minDisplayText = `${minValue.toFixed(1)}${config.unit}`;
                }
                
                htmlContent += `${minDisplayText}</div>
                  </div>
                `;
              }
            }
            
            // Handle max value if applicable and if selected
            if (['humidity', 'adc1', 'temperature'].includes(dataType)) {
              const maxValueId = `${dataType}_max`;
              
              // Check if this max value is selected for this sensor
              const isMaxSelected = selectedValueTypes &&
                                   selectedValueTypes[sensor.imei] &&
                                   selectedValueTypes[sensor.imei].includes(maxValueId);
              
              if (isMaxSelected) {
                htmlContent += `
                  <div class="sensor-value" style="background-color: ${config.color}10 !important; border: 1px solid ${config.color} !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact;">
                    <div style="color: ${config.color} !important; font-weight: bold; -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact;">${config.label} (Max)</div>
                    <div style="font-size: 1.2em;">
                `;
                
                // Get max value
                let maxValue = Math.max(...processedValues.map(v => v[dataType]));
                let maxDisplayText;
                
                if (dataType === 'adc1') {
                  // Use the woodSensorToPercentage function for wood moisture
                  maxDisplayText = woodSensorToPercentage(maxValue);
                } else {
                  maxDisplayText = `${maxValue.toFixed(1)}${config.unit}`;
                }
                
                htmlContent += `${maxDisplayText}</div>
                  </div>
                `;
              }
            }
          }
        }
        
        htmlContent += `
              </div>
            </div>
          </div>
        `;

        // Add charts for each data type
        for (const dataType of dataTypes) {
          // Skip humidity or adc1 based on sensor type setting
          if ((dataType === 'humidity' && sensorType === 'wood') || 
              (dataType === 'adc1' && sensorType === 'concrete')) {
            continue;
          }

          if (dataType in valueConfigs && processedValues.length > 1) {
            const config = valueConfigs[dataType as keyof typeof valueConfigs];
            const valueId = `${dataType}_value`;
            
            // Check if this value is selected for this sensor
            const isValueSelected = selectedValueTypes &&
                                   selectedValueTypes[sensor.imei] &&
                                   selectedValueTypes[sensor.imei].includes(valueId);
            
            if (isValueSelected) {
              const chartId = `chart-${sensor.imei}-${dataType}`;
              
              htmlContent += `
                <div class="chart-section">
                  <h3 class="chart-title">${config.label} Chart</h3>
                  <div class="chart-container">
                    <canvas id="${chartId}"></canvas>
                  </div>
                </div>
              `;
            }
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
        
        const valueId = `${dataType}_value`;
        
        // Check if this value is selected for this sensor
        const isValueSelected = selectedValueTypes &&
                               selectedValueTypes[sensor.imei] &&
                               selectedValueTypes[sensor.imei].includes(valueId);
        
        // Only add chart initialization code if the value is selected
        if (isValueSelected && dataType in valueConfigs && processedValues.length > 1) {
          const config = valueConfigs[dataType as keyof typeof valueConfigs];
          const chartId = `chart-${sensor.imei}-${dataType}`;
          
          // Extract data for the chart
          const labels = processedValues.map(v => v.formattedTime);
          let data;
          
          if (dataType === 'battery') {
            data = processedValues.map(v => v.batteryPercentage);
          } else if (dataType === 'signal') {
            data = processedValues.map(v => v.signalPercentage);
          } else if (dataType === 'adc1') {
            // For wood moisture, convert the raw values to percentages
            data = processedValues.map(v => {
              // Calculate percentage: (reading / 3600) * 100
              return (v[dataType] / 3600) * 100;
            });
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
                    animation: {
                      duration: 0 // Disable animations for better print rendering
                    },
                    scales: {
                      y: {
                        beginAtZero: ${dataType === 'temperature' ? 'false' : 'true'},
                        title: {
                          display: true,
                          text: '${config.unit}'
                        },
                        grid: {
                          color: document.querySelector('html').classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                          color: document.querySelector('html').classList.contains('dark') ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Time'
                        },
                        grid: {
                          color: document.querySelector('html').classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                          color: document.querySelector('html').classList.contains('dark') ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        labels: {
                          color: document.querySelector('html').classList.contains('dark') ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'
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
            // Use a longer timeout to ensure charts are fully rendered
            setTimeout(function() {
              // Force a repaint before printing
              document.body.style.display = 'none';
              document.body.offsetHeight; // Force reflow
              document.body.style.display = '';
              
              // Print after a short delay to allow the repaint to complete
              setTimeout(function() {
                window.print();
              }, 100);
            }, 2000);
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

    // Save the HTML report to the project history if requested
    if (saveToHistory && project.id) {
      try {
        const currentUser = getCurrentUser();
        const timestamp = new Date().toISOString();
        const filename = `${project.name}_Report_${format(new Date(), 'yyyy-MM-dd_HH-mm')}`;
        
        // Convert HTML to blob
        const htmlBlob = htmlToBlob(htmlContent);
        
        // Save the report to the database
        const result = await saveReportRecord(project.id, {
          filename,
          createdAt: timestamp,
          creatorName: currentUser?.name,
          createdBy: currentUser?.id,
          blob: htmlBlob,
          type: 'html'
        });
        
        if (result.success && result.data) {
          // Update the project with the new report
          const updatedProject = { ...project };
          updatedProject.pdfHistory = [
            ...(updatedProject.pdfHistory || []),
            result.data
          ];
          
          return updatedProject;
        }
      } catch (saveError) {
        console.error('Error saving HTML report to history:', saveError);
        // Continue even if saving fails - the report is still opened in a new tab
      }
    }

    return project;
  } catch (error) {
    console.error('Error generating HTML report:', error);
    throw error;
  }
}
