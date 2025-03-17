import { supabase } from '@/integrations/supabase/client';

/**
 * This script fixes inconsistencies in the database that were identified
 * by the schema verification script.
 */
async function fixDatabaseInconsistencies() {
  console.log('🔧 DATABASE INCONSISTENCY FIXER');
  console.log('================================');
  
  try {
    // Issue 1: Sensors with invalid folder_id references
    console.log('\n📋 FIXING INVALID FOLDER REFERENCES:');
    
    // Get all sensors with folder_id
    const { data: sensorsWithFolders, error: sensorsError } = await supabase
      .from('sensors')
      .select('id, name, imei, folder_id')
      .not('folder_id', 'is', null);
    
    if (sensorsError) {
      console.error(`❌ Error fetching sensors: ${sensorsError.message}`);
    } else {
      console.log(`Found ${sensorsWithFolders.length} sensors with folder_id values`);
      
      // Check each sensor's folder_id against the sensor_folders table
      let invalidFolderRefs = 0;
      
      for (const sensor of sensorsWithFolders) {
        // Check if the folder exists
        const { data: folder, error: folderError } = await supabase
          .from('sensor_folders')
          .select('id, name')
          .eq('id', sensor.folder_id)
          .maybeSingle();
        
        if (folderError || !folder) {
          console.log(`❌ Sensor ${sensor.name} (${sensor.imei}) has invalid folder_id: ${sensor.folder_id}`);
          invalidFolderRefs++;
          
          // Fix: Set folder_id to null
          const { error: updateError } = await supabase
            .from('sensors')
            .update({ folder_id: null })
            .eq('id', sensor.id);
          
          if (updateError) {
            console.error(`  ❌ Failed to fix: ${updateError.message}`);
          } else {
            console.log(`  ✅ Fixed: Set folder_id to null`);
          }
        }
      }
      
      if (invalidFolderRefs === 0) {
        console.log('✅ No sensors with invalid folder references found');
      } else {
        console.log(`✅ Fixed ${invalidFolderRefs} sensors with invalid folder references`);
      }
    }
    
    // Issue 2: Missing folder_sensors junction records
    console.log('\n📋 FIXING MISSING FOLDER-SENSOR RELATIONSHIPS:');
    
    // Get all sensors with folder_id
    const { data: sensorsWithFoldersAfterFix, error: sensorsAfterFixError } = await supabase
      .from('sensors')
      .select('id, name, imei, folder_id')
      .not('folder_id', 'is', null);
    
    if (sensorsAfterFixError) {
      console.error(`❌ Error fetching sensors: ${sensorsAfterFixError.message}`);
    } else {
      console.log(`Found ${sensorsWithFoldersAfterFix.length} sensors with folder_id values after initial fixes`);
      
      // Check each sensor for a corresponding folder_sensors record
      let missingRelationships = 0;
      let relationshipsToCreate = [];
      
      for (const sensor of sensorsWithFoldersAfterFix) {
        // Check if a folder_sensors record exists
        const { data: folderSensor, error: folderSensorError } = await supabase
          .from('folder_sensors')
          .select('id')
          .eq('folder_id', sensor.folder_id)
          .eq('sensor_imei', sensor.imei)
          .maybeSingle();
        
        if (folderSensorError || !folderSensor) {
          console.log(`❌ Missing folder_sensors record for sensor ${sensor.name} (${sensor.imei}) and folder ${sensor.folder_id}`);
          missingRelationships++;
          
          // Add to the list of relationships to create
          relationshipsToCreate.push({
            folder_id: sensor.folder_id,
            sensor_imei: sensor.imei,
            created_at: new Date().toISOString()
          });
        }
      }
      
      // Create missing folder_sensors records
      if (relationshipsToCreate.length > 0) {
        const { data, error: insertError } = await supabase
          .from('folder_sensors')
          .insert(relationshipsToCreate)
          .select();
        
        if (insertError) {
          console.error(`❌ Failed to create missing relationships: ${insertError.message}`);
        } else {
          console.log(`✅ Created ${data.length} missing folder-sensor relationships`);
        }
      } else {
        console.log('✅ No missing folder-sensor relationships found');
      }
    }
    
    console.log('\n================================');
    console.log('🏁 DATABASE FIXES COMPLETED');
    
  } catch (error) {
    console.error(`❌ Unexpected error during database fixes: ${error.message}`);
  }
}

// Run the fixes
fixDatabaseInconsistencies();