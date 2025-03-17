
import { supabase } from '@/integrations/supabase/client';
import axios from 'axios';
import { Database } from '@/integrations/supabase/types';
import { SupabaseTable } from '@/types/supabase';

/**
 * This script tests the connection to the Supabase database
 * and verifies all tables in the schema are accessible.
 */
async function testDatabaseConnection() {
  console.log('🔍 SUPABASE DATABASE CONNECTION TEST');
  console.log('====================================');
  
  try {
    // Configuration info - only log if environment variables are present
    console.log('📋 CONNECTION TEST:');
    
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_KEY) {
      throw new Error('Missing required environment variables. Please check your .env file.');
    }
    
    console.log('✅ Environment variables configured');
    
    // Test 1: Simple auth check (doesn't require database access)
    console.log('\n📋 AUTH API TEST:');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.error('❌ Auth API test failed:', authError);
    } else {
      console.log('✅ Auth API accessible');
    }
    
    // Test 2: Check all tables in the schema
    console.log('\n📋 DATABASE TABLES TEST:');
    
    // Define tables based on the Database type
    const tables = [
      'companies',
      'folder_sensors',
      'pdf_records',
      'sensor_folders',
      'sensors',
      'sensor_values',
      'users'
    ] as SupabaseTable[];
    
    console.log(`Testing ${tables.length} tables: ${tables.join(', ')}`);
    
    // Test each table
    const tableResults = await Promise.all(
      tables.map(async (table) => {
        try {
          const { data, error, count } = await supabase
            .from(table)
            .select('*', { count: 'exact' })
            .limit(1);
          
          if (error) {
            return { table, success: false, error: error.message, count: 0 };
          }
          
          return { table, success: true, count };
        } catch (err: any) {
          return { table, success: false, error: err.message, count: 0 };
        }
      })
    );
    
    // Display results
    let allTablesAccessible = true;
    
    tableResults.forEach(result => {
      if (result.success) {
        console.log(`✅ Table '${result.table}': Accessible (${result.count} records)`);
      } else {
        console.log(`❌ Table '${result.table}': Error - ${result.error}`);
        allTablesAccessible = false;
      }
    });
    
    if (allTablesAccessible) {
      console.log('\n✅ SUCCESS: All database tables are accessible!');
    } else {
      console.log('\n⚠️ WARNING: Some database tables could not be accessed.');
    }
    
    // Test 3: Check relationships with manual joins
    console.log('\n📋 RELATIONSHIPS TEST:');
    try {
      // Get a sample folder
      const { data: folders, error: folderError } = await supabase
        .from('sensor_folders')
        .select('id, name, company_id')
        .limit(1);
      
      if (folderError) {
        console.error('❌ Folder query failed:', folderError.message);
      } else if (folders && folders.length > 0) {
        const folder = folders[0];
        console.log(`Found folder: ${folder.name} (${folder.id})`);
        
        // Get related company
        if (folder.company_id) {
          const { data: company, error: companyError } = await supabase
            .from('companies')
            .select('name')
            .eq('id', folder.company_id)
            .single();
          
          if (companyError) {
            console.error('❌ Company relationship failed:', companyError.message);
          } else {
            console.log(`✅ Company relationship works: Folder belongs to "${company.name}"`);
          }
        }
        
        // Get related sensors
        const { data: sensors, error: sensorsError } = await supabase
          .from('sensors')
          .select('name, imei')
          .eq('folder_id', folder.id);
        
        if (sensorsError) {
          console.error('❌ Sensors relationship failed:', sensorsError.message);
        } else {
          console.log(`✅ Sensors relationship works: Found ${sensors.length} sensors in this folder`);
          if (sensors.length > 0) {
            console.log('Sample sensor:', sensors[0]);
          }
        }
      } else {
        console.log('⚠️ No folders found to test relationships');
      }
    } catch (relError: any) {
      console.error('❌ Relationship test error:', relError.message);
    }
    
    console.log('\n====================================');
    console.log('🏁 DATABASE CONNECTION TEST COMPLETED');
  } catch (error: any) {
    console.error('❌ Unexpected error during database test:', error.message);
  }
}

// Run the test
testDatabaseConnection();
