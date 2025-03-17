
import { supabase } from '@/integrations/supabase/client';
import { SupabaseTable, SupabaseFunction, rawQuery } from '@/types/supabase';
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
          const { data, error } = await supabase
            .from(tableName as SupabaseTable)
            .select('*')
            .limit(1);
          
          // Get count with a separate query
          const countResult = await supabase
            .from(tableName as SupabaseTable)
            .select('*', { count: 'exact', head: true });
          
          const count = countResult.count;
          
          if (error) {
            return { 
              table: tableName, 
              exists: false, 
              error: error.message, 
              columns: [], 
              missingColumns: expectedSchema.find(t => t.name === tableName)?.requiredColumns || [] 
            };
          }
          
          // Get column information using alternative approach
          let columns: string[] = [];
          let missingColumns: string[] = [];
          
          try {
            // Using SQL query to get columns instead of _columns_info
            const { data: columnData, error: columnError } = await supabase
              .rpc('get_table_columns', { table_name: tableName });
            
            if (columnError) {
              console.log(chalk.yellow(`⚠️ Could not fetch column information for ${tableName}: ${columnError.message}`));
              
              // If columns can't be fetched, we'll infer them from the first row of data
              if (data && data.length > 0) {
                columns = Object.keys(data[0]);
              }
            } else if (columnData && Array.isArray(columnData)) {
              // Ensure columnData is properly typed and handled
              columns = columnData.map(col => typeof col === 'object' && col !== null && 'column_name' in col ? 
                col.column_name as string : 
                typeof col === 'string' ? col : '');
            }
            
            // Calculate missing columns
            const expectedColumns = expectedSchema.find(t => t.name === tableName)?.requiredColumns || [];
            missingColumns = expectedColumns.filter(col => !columns.includes(col));
          } catch (columnError) {
            console.log(chalk.yellow(`⚠️ Could not fetch column information for ${tableName}: ${columnError}`));
            
            // If columns can't be fetched via any method, we'll infer them from the data
            if (data && data.length > 0) {
              columns = Object.keys(data[0]);
              const expectedColumns = expectedSchema.find(t => t.name === tableName)?.requiredColumns || [];
              missingColumns = expectedColumns.filter(col => !columns.includes(col));
            }
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
      for (const tableName of validTables) {
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
      
      // Check for information schema access
      try {
        const { data, error } = await supabase
          .rpc('get_table_columns', { table_name: 'companies' });
          
        if (error) {
          console.log('❌ Cannot access column information: ', error.message);
        } else if (data && Array.isArray(data) && data.length > 0) {
          console.log(`✅ Column information accessible: Found ${data.length} columns for companies table`);
          
          if (data.length > 0) {
            console.log('Sample column data:', data[0]);
          }
        } else {
          console.log('⚠️ No column information available');
        }
      } catch (infoErr) {
        console.error('Error checking column information:', infoErr);
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
            .limit(1);
          
          if (sampleError || !sampleData || sampleData.length === 0) {
            console.log(chalk.yellow(`⚠️ Could not find a sample record with non-null ${relationship.column} in ${tableInfo.name}`));
            continue;
          }
          
          // We know we have one record
          const sampleRecord = sampleData[0];
          
          // Check for property existence before using it
          if (sampleRecord && relationship.column in sampleRecord) {
            const foreignKeyValue = sampleRecord[relationship.column];
            
            // Use a simpler approach to query the referenced table
            const { data: referencedData, error: referencedError } = await supabase
              .from(relationship.referencesTable as SupabaseTable)
              .select('*')
              .eq(relationship.referencesColumn, foreignKeyValue)
              .limit(1);
            
            if (referencedError || !referencedData || referencedData.length === 0) {
              console.log(chalk.red(`❌ Relationship broken: ${tableInfo.name}.${relationship.column} -> ${relationship.referencesTable}.${relationship.referencesColumn}`));
              console.log(chalk.red(`   Foreign key value ${foreignKeyValue} not found in referenced table`));
            } else {
              console.log(chalk.green(`✅ Relationship verified: ${tableInfo.name}.${relationship.column} -> ${relationship.referencesTable}.${relationship.referencesColumn}`));
            }
          } else {
            console.log(chalk.yellow(`⚠️ Property ${relationship.column} not found in sample record from ${tableInfo.name}`));
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
        .from('sensors' as SupabaseTable)
        .select('id, imei, folder_id')
        .not('folder_id', 'is', null)
        .limit(10);
      
      if (sensorsError) {
        console.log(chalk.red(`❌ Error fetching sensors with folders: ${sensorsError.message}`));
      } else if (!sensorsWithFolders || sensorsWithFolders.length === 0) {
        console.log(chalk.yellow('⚠️ No sensors with assigned folders found to check consistency'));
      } else {
        let consistencyIssues = 0;
        
        for (const sensor of sensorsWithFolders) {
          // Check if properties exist before using them
          if (sensor && 'folder_id' in sensor && 'imei' in sensor) {
            const { data: folderSensor, error: folderSensorError } = await supabase
              .from('folder_sensors' as SupabaseTable)
              .select('*')
              .eq('folder_id', sensor.folder_id)
              .eq('sensor_imei', sensor.imei)
              .limit(1);
            
            if (folderSensorError || !folderSensor || folderSensor.length === 0) {
              console.log(chalk.red(`❌ Consistency issue: Sensor ${sensor.imei} has folder_id ${sensor.folder_id} but no matching entry in folder_sensors`));
              consistencyIssues++;
            }
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
        .from('users' as SupabaseTable)
        .select('id, name, company_id')
        .not('company_id', 'is', null)
        .limit(10);
      
      if (usersError) {
        console.log(chalk.red(`❌ Error fetching users with companies: ${usersError.message}`));
      } else if (!usersWithCompanies || usersWithCompanies.length === 0) {
        console.log(chalk.yellow('⚠️ No users with assigned companies found to check consistency'));
      } else {
        let consistencyIssues = 0;
        
        for (const user of usersWithCompanies) {
          // Check if properties exist before using them
          if (user && 'company_id' in user && 'name' in user) {
            const { data: company, error: companyError } = await supabase
              .from('companies' as SupabaseTable)
              .select('id, name')
              .eq('id', user.company_id as string)
              .limit(1);
            
            if (companyError || !company || company.length === 0) {
              console.log(chalk.red(`❌ Consistency issue: User ${user.name} has company_id ${user.company_id} but no matching company exists`));
              consistencyIssues++;
            }
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
    // Check if we can run the get_table_columns function
    const { data: testFunctionData, error: testFunctionError } = await supabase
      .rpc('get_table_columns', { table_name: 'companies' });
      
    if (testFunctionError) {
      console.log(chalk.yellow('Note: The get_table_columns function is not available.'));
      console.log(chalk.yellow('You may need to create a function for column information with:'));
      console.log(chalk.gray(`
        -- Create a function to get table columns
        CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
        RETURNS TABLE(column_name text, data_type text)
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          RETURN QUERY
          SELECT 
            columns.column_name::text,
            columns.data_type::text
          FROM 
            information_schema.columns
          WHERE 
            columns.table_schema = 'public' 
            AND columns.table_name = table_name;
        END;
        $$;
        
        -- Grant access to the function
        GRANT EXECUTE ON FUNCTION get_table_columns TO anon, authenticated;
      `));
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
