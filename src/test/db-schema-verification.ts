import { supabase } from '@/integrations/supabase/client';
import { SupabaseTable, SupabaseFunction } from '@/types/supabase';
import axios from 'axios';
import chalk from 'chalk';

/**
 * This script verifies that the Supabase database schema matches the application's requirements
 * and that the necessary relationships are set up correctly.
 */

interface TableInfo {
  name: string;
  requiredColumns: string[];
  description: string;
  relationships: {
    column: string;
    referencesTable: string;
    referencesColumn: string;
  }[];
}

// Define the expected database schema based on the application code
const expectedSchema: TableInfo[] = [
  {
    name: 'companies',
    description: 'Stores company information',
    requiredColumns: ['id', 'name', 'industry', 'status', 'created_at'],
    relationships: []
  },
  {
    name: 'users',
    description: 'Stores user information',
    requiredColumns: [
      'id', 'name', 'email', 'password_hash', 'role', 'company_id', 
      'last_login', 'status', 'is_company_admin', 'created_at', 'updated_at'
    ],
    relationships: [
      { column: 'company_id', referencesTable: 'companies', referencesColumn: 'id' }
    ]
  },
  {
    name: 'sensor_folders',
    description: 'Stores project/folder information',
    requiredColumns: [
      'id', 'name', 'description', 'company_id', 'project_number', 
      'address', 'location', 'status', 'created_at', 'updated_at'
    ],
    relationships: [
      { column: 'company_id', referencesTable: 'companies', referencesColumn: 'id' }
    ]
  },
  {
    name: 'sensors',
    description: 'Stores sensor information',
    requiredColumns: [
      'id', 'name', 'imei', 'status', 'folder_id', 'company_id', 'updated_at'
    ],
    relationships: [
      { column: 'company_id', referencesTable: 'companies', referencesColumn: 'id' },
      { column: 'folder_id', referencesTable: 'sensor_folders', referencesColumn: 'id' }
    ]
  },
  {
    name: 'sensor_values',
    description: 'Stores sensor readings',
    requiredColumns: ['id', 'sensor_imei', 'created_at', 'payload'],
    relationships: [
      { column: 'sensor_imei', referencesTable: 'sensors', referencesColumn: 'imei' }
    ]
  },
  {
    name: 'folder_sensors',
    description: 'Junction table for the many-to-many relationship between folders and sensors',
    requiredColumns: ['id', 'folder_id', 'sensor_imei', 'created_at'],
    relationships: [
      { column: 'folder_id', referencesTable: 'sensor_folders', referencesColumn: 'id' },
      { column: 'sensor_imei', referencesTable: 'sensors', referencesColumn: 'imei' }
    ]
  },
  {
    name: 'pdf_records',
    description: 'Stores PDF documents associated with folders',
    requiredColumns: [
      'id', 'folder_id', 'filename', 'created_at', 'created_by', 
      'creator_name', 'content_base64'
    ],
    relationships: [
      { column: 'folder_id', referencesTable: 'sensor_folders', referencesColumn: 'id' },
      { column: 'created_by', referencesTable: 'users', referencesColumn: 'id' }
    ]
  }
];

/**
 * Verify the database schema against the expected schema
 */
async function verifyDatabaseSchema() {
  console.log(chalk.blue.bold('🔍 DATABASE SCHEMA VERIFICATION'));
  console.log(chalk.blue('===================================='));
  
  try {
    // Get the Supabase URL from the environment variable or hardcoded value in client.ts
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pjzujrwbfwcxdnjnuhws.supabase.co';
    
    console.log(chalk.cyan('📋 CONNECTION INFO:'));
    console.log(`Supabase URL: ${supabaseUrl}`);
    console.log(`API Key present: ${!!import.meta.env.VITE_SUPABASE_KEY}`);
    
    // Test 1: Verify all expected tables exist
    console.log(chalk.cyan('\n📋 TABLE EXISTENCE TEST:'));
    
    const validTables = expectedSchema.map(tableInfo => tableInfo.name);
    
    const tableResults = await Promise.all(
      validTables.map(async (tableName) => {
        try {
          const { data, error, count } = await supabase
            .from(tableName as SupabaseTable)
            .select('*', { count: 'exact' })
            .limit(1);
          
          if (error) {
            return { 
              table: tableName, 
              exists: false, 
              error: error.message, 
              columns: [], 
              missingColumns: expectedSchema.find(t => t.name === tableName)?.requiredColumns || [] 
            };
          }
          
          // Get column information
          const { data: columnData, error: columnError } = await supabase.rpc(
            'get_table_columns' as any,
            { table_name: tableName }
          );
          
          let columns: string[] = [];
          let missingColumns: string[] = [];
          
          if (columnError || !columnData) {
            console.log(chalk.yellow(`⚠️ Could not fetch column information for ${tableName}: ${columnError?.message || 'No data returned'}`));
          } else {
            columns = Array.isArray(columnData) ? columnData.map((col: any) => col.column_name) : [];
            missingColumns = expectedSchema.find(t => t.name === tableName)?.requiredColumns.filter(col => !columns.includes(col)) || [];
          }
          
          return { 
            table: tableName, 
            exists: true, 
            count, 
            columns,
            missingColumns
          };
        } catch (err: any) {
          return { 
            table: tableName, 
            exists: false, 
            error: err.message,
            columns: [],
            missingColumns: expectedSchema.find(t => t.name === tableName)?.requiredColumns || []
          };
        }
      })
    );
    
    // Display table existence results
    let allTablesExist = true;
    let allColumnsExist = true;
    
    tableResults.forEach(result => {
      if (result.exists) {
        if (result.missingColumns.length === 0) {
          console.log(chalk.green(`✅ Table '${result.table}': Exists with all required columns (${result.count} records)`));
        } else {
          console.log(chalk.yellow(`⚠️ Table '${result.table}': Exists but missing columns: ${result.missingColumns.join(', ')}`));
          allColumnsExist = false;
        }
      } else {
        console.log(chalk.red(`❌ Table '${result.table}': Does not exist - ${result.error}`));
        allTablesExist = false;
      }
    });
    
    if (allTablesExist && allColumnsExist) {
      console.log(chalk.green('\n✅ SUCCESS: All required tables and columns exist!'));
    } else if (allTablesExist) {
      console.log(chalk.yellow('\n⚠️ WARNING: All tables exist but some required columns are missing.'));
    } else {
      console.log(chalk.red('\n❌ ERROR: Some required tables do not exist.'));
    }
    
    // Check table columns
    console.log('\n📋 TABLE COLUMNS CHECK:');
    
    try {
      for (const tableName of validTables as SupabaseTable[]) {
        const { data, error } = await supabase
          .from(tableName as SupabaseTable)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(chalk.red(`❌ Error fetching table columns for ${tableName}: ${error.message}`));
        } else {
          console.log(chalk.green(`✅ Table '${tableName}': Found ${data.length} rows`));
        }
      }
      
      // Check if the get_table_columns function exists
      try {
        const { data: funcData, error: funcError } = await supabase
          .rpc('get_table_columns' as any, { table_name: 'companies' });
        
        if (funcError) {
          console.log('❌ Function get_table_columns is not available');
        } else if (funcData) {
          // Fix the type handling for funcData
          const columnData = Array.isArray(funcData) ? funcData : [];
          console.log(`✅ Function get_table_columns works: Found ${columnData.length} columns for companies table`);
          
          if (columnData.length > 0) {
            console.log('Sample column data:', columnData[0]);
          }
        }
      } catch (funcErr) {
        console.error('Error checking function:', funcErr);
      }
    } catch (schemaError) {
      console.error('Error during schema check:', schemaError);
    }
    
    // Test 2: Verify foreign key relationships
    console.log(chalk.cyan('\n📋 RELATIONSHIP TEST:'));
    
    // For each table with relationships, check if the relationships work
    for (const tableInfo of expectedSchema.filter(t => t.relationships.length > 0)) {
      console.log(chalk.white(`\nChecking relationships for ${tableInfo.name}:`));
      
      for (const relationship of tableInfo.relationships) {
        try {
          // Get a sample record from the table
          const { data: sampleData, error: sampleError } = await supabase
            .from(tableInfo.name as SupabaseTable)
            .select(`${relationship.column}`)
            .not(relationship.column, 'is', null)
            .limit(1)
            .single();
          
          if (sampleError || !sampleData) {
            console.log(chalk.yellow(`⚠️ Could not find a sample record with non-null ${relationship.column} in ${tableInfo.name}`));
            continue;
          }
          
          const foreignKeyValue = sampleData[relationship.column];
          
          // Type handling for the checking of relationships using as cast
          const tblName = relationship.referencesTable as SupabaseTable;
          const { data: referencedData, error: referencedError } = await supabase
            .from(tblName)
            .select('*')
            .eq(relationship.referencesColumn, foreignKeyValue)
            .single();
          
          if (referencedError || !referencedData) {
            console.log(chalk.red(`❌ Relationship broken: ${tableInfo.name}.${relationship.column} -> ${relationship.referencesTable}.${relationship.referencesColumn}`));
            console.log(chalk.red(`   Foreign key value ${foreignKeyValue} not found in referenced table`));
          } else {
            console.log(chalk.green(`✅ Relationship verified: ${tableInfo.name}.${relationship.column} -> ${relationship.referencesTable}.${relationship.referencesColumn}`));
          }
        } catch (err: any) {
          console.log(chalk.red(`❌ Error checking relationship ${tableInfo.name}.${relationship.column}: ${err.message}`));
        }
      }
    }
    
    // Test 3: Verify data consistency
    console.log(chalk.cyan('\n📋 DATA CONSISTENCY TEST:'));
    
    // Check if all sensors with folder_id have corresponding entries in folder_sensors
    try {
      const { data: sensorsWithFolders, error: sensorsError } = await supabase
        .from('sensors')
        .select('id, imei, folder_id')
        .not('folder_id', 'is', null)
        .limit(10);
      
      if (sensorsError) {
        console.log(chalk.red(`❌ Error fetching sensors with folders: ${sensorsError.message}`));
      } else if (sensorsWithFolders.length === 0) {
        console.log(chalk.yellow('⚠️ No sensors with assigned folders found to check consistency'));
      } else {
        let consistencyIssues = 0;
        
        for (const sensor of sensorsWithFolders) {
          const { data: folderSensor, error: folderSensorError } = await supabase
            .from('folder_sensors')
            .select('*')
            .eq('folder_id', sensor.folder_id)
            .eq('sensor_imei', sensor.imei)
            .maybeSingle();
          
          if (folderSensorError || !folderSensor) {
            console.log(chalk.red(`❌ Consistency issue: Sensor ${sensor.imei} has folder_id ${sensor.folder_id} but no matching entry in folder_sensors`));
            consistencyIssues++;
          }
        }
        
        if (consistencyIssues === 0) {
          console.log(chalk.green('✅ All sensors with folder_id have corresponding entries in folder_sensors'));
        } else {
          console.log(chalk.yellow(`⚠️ Found ${consistencyIssues} sensors with inconsistent folder relationships`));
        }
      }
    } catch (err: any) {
      console.log(chalk.red(`❌ Error checking sensor-folder consistency: ${err.message}`));
    }
    
    // Check if all users have valid company_id
    try {
      const { data: usersWithCompanies, error: usersError } = await supabase
        .from('users')
        .select('id, name, company_id')
        .not('company_id', 'is', null)
        .limit(10);
      
      if (usersError) {
        console.log(chalk.red(`❌ Error fetching users with companies: ${usersError.message}`));
      } else if (usersWithCompanies.length === 0) {
        console.log(chalk.yellow('⚠️ No users with assigned companies found to check consistency'));
      } else {
        let consistencyIssues = 0;
        
        for (const user of usersWithCompanies) {
          const { data: company, error: companyError } = await supabase
            .from('companies')
            .select('id, name')
            .eq('id', user.company_id)
            .maybeSingle();
          
          if (companyError || !company) {
            console.log(chalk.red(`❌ Consistency issue: User ${user.name} has company_id ${user.company_id} but no matching company exists`));
            consistencyIssues++;
          }
        }
        
        if (consistencyIssues === 0) {
          console.log(chalk.green('✅ All users have valid company references'));
        } else {
          console.log(chalk.yellow(`⚠️ Found ${consistencyIssues} users with invalid company references`));
        }
      }
    } catch (err: any) {
      console.log(chalk.red(`❌ Error checking user-company consistency: ${err.message}`));
    }
    
    console.log(chalk.blue('\n===================================='));
    console.log(chalk.blue.bold('🏁 DATABASE SCHEMA VERIFICATION COMPLETED'));
    
  } catch (error: any) {
    console.error(chalk.red(`❌ Unexpected error during database verification: ${error.message}`));
  }
}

// Add a function to create the stored procedure for getting table columns if it doesn't exist
async function setupDatabaseHelpers() {
  try {
    // Create a stored procedure to get table columns
    const createProcedure = `
      CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
      RETURNS TABLE(column_name text, data_type text) AS $$
      BEGIN
        RETURN QUERY
        SELECT c.column_name::text, c.data_type::text
        FROM information_schema.columns c
        WHERE c.table_schema = 'public'
        AND c.table_name = table_name;
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    const { error } = await supabase.rpc('get_table_columns' as any, { table_name: 'companies' });
    
    if (error && error.message.includes('does not exist')) {
      // Function doesn't exist, create it
      console.log(chalk.yellow('Creating database helper function...'));
      
      // We need to use raw SQL to create the function
      // This would typically be done through a migration or admin panel
      console.log(chalk.yellow('Note: You may need to create the helper function manually in the Supabase SQL editor:'));
      console.log(chalk.gray(createProcedure));
    }
  } catch (error) {
    console.error('Error setting up database helpers:', error);
  }
}

// Run the verification
async function run() {
  await setupDatabaseHelpers();
  await verifyDatabaseSchema();
}

run();
