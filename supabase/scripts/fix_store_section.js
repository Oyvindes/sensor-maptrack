// Script to modify the StoreSection.tsx file to fix the name mismatch issue
// Run this script with Node.js: node supabase/scripts/fix_store_section.js

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the StoreSection.tsx file
const filePath = join(__dirname, '..', '..', 'src', 'components', 'dashboard', 'StoreSection.tsx');

try {
  // Read the file
  let content = readFileSync(filePath, 'utf8');

  // Find the filter condition for purchases
  const originalFilter = /purchases\.filter\(p => p\.purchasedBy === currentUser\?\.name\)/g;

  // Replace it with a more flexible condition that handles name mismatches
  // This will check if the purchasedBy field contains the user's name or vice versa
  const newFilter = `purchases.filter(p => {
                // Handle name mismatches by checking if either contains the other
                if (!currentUser?.name) return false;
                const purchasedBy = p.purchasedBy.toLowerCase();
                const userName = currentUser.name.toLowerCase();
                return purchasedBy.includes(userName) || userName.includes(purchasedBy);
              })`;

  // Replace all occurrences
  content = content.replace(originalFilter, newFilter);

  // Write the modified content back to the file
  writeFileSync(filePath, content);

  console.log('StoreSection.tsx has been updated to handle name mismatches.');
} catch (error) {
  console.error('Error updating StoreSection.tsx:', error);
}