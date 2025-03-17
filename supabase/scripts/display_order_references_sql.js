// Script to display the SQL content for adding order references
// This script simply reads and displays the SQL file content for easy copying

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the SQL file path
const sqlFilePath = path.join(__dirname, '../migrations/add_order_references_simple.sql');

try {
  // Read the SQL file content
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
  
  console.log('----------------------------------------');
  console.log('SQL SCRIPT FOR ADDING ORDER REFERENCES');
  console.log('----------------------------------------');
  console.log('Copy everything between the lines and paste into Supabase SQL Editor');
  console.log('----------------------------------------');
  console.log(sqlContent);
  console.log('----------------------------------------');
  
  console.log('\nInstructions:');
  console.log('1. Copy the entire SQL script above');
  console.log('2. Open the Supabase dashboard');
  console.log('3. Go to the SQL Editor');
  console.log('4. Paste the SQL content');
  console.log('5. Run the SQL commands');
  
} catch (error) {
  console.error('Error reading SQL file:', error.message);
  process.exit(1);
}