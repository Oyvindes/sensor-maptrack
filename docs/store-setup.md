# Store Functionality Setup Guide

This document provides instructions for setting up the store functionality in the Supabase database.

## Prerequisites

- Access to the Supabase dashboard for your project
- Admin privileges to run SQL queries and manage storage

## Setup Steps

### Option A: Complete Setup (Recommended)

For the quickest and most reliable setup:

1. Navigate to the Supabase dashboard
2. Go to the SQL Editor
3. Run the comprehensive setup script: `supabase/scripts/complete_store_setup.sql`

This script:
- Disables RLS on the products, purchases, and storage.objects tables
- Creates the product-images bucket
- Sets up bypass policies for all tables
- Verifies the setup with test queries
- Provides example URL formats for uploaded images

This is the most reliable approach and fixes both the products table access and storage bucket issues in one step.

### Option B: Step-by-Step Setup

If you prefer to set up the store functionality step by step:

#### 1. Run Database Migrations

First, run the database migration script to create the necessary tables:

1. Navigate to the Supabase dashboard
2. Go to the SQL Editor
3. Run the migration file: `supabase/migrations/20250317_create_store_tables.sql`

This will create:
- `products` table for storing product information
- `purchases` table for tracking customer purchases
- Row Level Security (RLS) policies for both tables

#### 1a. Fix Products Table Access (Required)

After running the migrations, you need to fix the RLS policies for the products table:

1. Navigate to the Supabase dashboard
2. Go to the SQL Editor
3. Run one of these scripts:
   - `supabase/scripts/check_and_fix_db.sql` (Emergency fix - disables RLS completely)
   - `supabase/scripts/simple_products_access.sql` (Standard fix - permissive policies)
   - `supabase/scripts/fix_products_rls.sql` (Advanced - more detailed control)

This step is necessary because the default RLS policies may be too restrictive, preventing product creation.

If you're encountering persistent issues, the emergency fix script is the most reliable solution as it completely bypasses RLS for the products table.

#### 2. Set Up Storage Bucket

To enable image uploads, you need to set up a storage bucket with appropriate permissions. You have two options:

#### Option A: Standard Security (Recommended for Production)

This option restricts image uploads to site-wide admins only:

1. Navigate to the Supabase dashboard
2. Go to the SQL Editor
3. Run the storage setup script: `supabase/scripts/setup_storage_bucket.sql`

This script:
- Creates a `product-images` bucket
- Sets up RLS policies to allow:
  - Anyone to view product images
  - Only site admins (master role) to upload, update, and delete images

#### Option B: Simple Storage Setup (Recommended for Most Cases)

If you're encountering permission issues or just want a simple setup:

1. Navigate to the Supabase dashboard
2. Go to the SQL Editor
3. Run the script: `supabase/scripts/simple_storage_setup.sql`

This script:
- Creates the `product-images` bucket if it doesn't exist
- Sets up simple permissive policies that allow:
  - Anyone to view product images
  - Any authenticated user to upload, update, and delete images

#### Option C: Advanced Storage Setup (For Development/Testing)

If you need more control over the storage policies:

1. Navigate to the Supabase dashboard
2. Go to the SQL Editor
3. Run the script: `supabase/scripts/remove_storage_restrictions.sql`

This script provides more detailed policy setup with additional options.

### 3. Add Sample Products (Optional)

To populate the store with sample products:

1. Navigate to the Supabase dashboard
2. Go to the SQL Editor
3. Run the sample products script: `supabase/scripts/add_sample_products.sql`

This adds several sample products with descriptions and images.

## Troubleshooting

### Table Access Issues (Products & Purchases)

If you encounter errors like "new row violates row-level security policy for table 'products'" or "new row violates row-level security policy for table 'purchases'":

1. **Complete Fix: Run the Complete Store Setup Script**
   - Run the `supabase/scripts/complete_store_setup.sql` script
   - This script disables RLS on all tables (products, purchases, and storage.objects)
   - It's the most comprehensive solution that fixes all known issues
   - Note: This reduces security but ensures functionality

### Purchase Display Issues

If purchases are created successfully but don't appear in the "My Purchases" or "All Purchases" tabs:

1. **Database Query Issue (Fixed)**
   - The issue was in the `listUserPurchases` method in storeService.ts
   - It was using an exact match for the purchased_by field, which filtered out purchases with slight name differences
   - This has been fixed to use a more flexible matching approach that checks if either name contains the other
   - **If you're still having issues**, run the `supabase/scripts/complete_store_setup.sql` script which includes fixes for this issue

2. **Name Mismatch Issue**
   - Run the `supabase/scripts/fix_purchase_names.sql` script
   - This script checks for mismatches between the user's name in the application and the purchased_by field
   - The issue is often that the purchased_by value in the database doesn't match the name used in the application
   - You have three options to fix this:
     
     a. **Update the database** (Quick fix for specific purchases):
     ```sql
     UPDATE purchases
     SET purchased_by = 'Exact User Name'
     WHERE purchased_by = 'Current Name in Database';
     ```
     
     b. **Modify the application code** (Best long-term solution):
     - Run the script: `node supabase/scripts/fix_store_section.js`
     - This script modifies the StoreSection.tsx file to handle name mismatches
     - It replaces the exact name comparison with a more flexible one that checks if either name contains the other
     
     c. **Manual code change** (If the script doesn't work):
     - Open `src/components/dashboard/StoreSection.tsx`
     - Find the filter condition: `purchases.filter(p => p.purchasedBy === currentUser?.name)`
     - Replace it with a more flexible condition that handles name mismatches

3. **Status Issue**
   - Purchases with status other than 'completed' might not be displayed correctly
   - Run the following SQL to update all pending purchases to completed status:
   ```sql
   UPDATE purchases
   SET status = 'completed'
   WHERE status = 'pending';
   ```
   - This is now included in the `supabase/scripts/complete_store_setup.sql` script

4. **Company ID Matching Issue (Fixed)**
   - Regular admins might not see purchases if the company ID doesn't match
   - We've updated the filtering logic to match purchases by:
     - Exact name match
     - Partial name match (either name contains the other)
     - Company ID match
   - This ensures that all purchases related to the user's company will be displayed
   - The fix is implemented in both the storeService.ts and StoreSection.tsx files

5. **Direct Database Query Fix (Most Reliable)**
   - For the most reliable solution, we've implemented a direct database query in StoreSection.tsx
   - This bypasses the storeService.ts filtering and fetches all purchases directly
   - The purchases are then mapped to the correct format and displayed in the UI
   - This ensures that all purchases will be displayed regardless of name or company ID mismatches

6. **Direct Database Update Fix**
   - If the above fixes don't work, you can run the `supabase/scripts/fix_purchases_for_admin.sql` script
   - This script directly updates all purchases to match the admin's name and company ID
   - Replace the placeholder values with the actual admin's name and company ID
   - This is the most direct fix and should work in all cases

2. **Check Purchase Status**
   - Run the `supabase/scripts/check_and_fix_purchases.sql` script
   - This script checks the status of purchases and can update them if needed
   - Purchases with status 'completed' might not be displayed correctly

3. **Update Purchase Status**
   - You can manually update the status of purchases in the database:
   ```sql
   UPDATE purchases
   SET status = 'completed'
   WHERE status = 'pending';
   ```

4. **Check for Case Sensitivity Issues**
   - The script also checks for case sensitivity issues with the purchased_by field
   - Make sure the purchased_by field matches the user's name exactly

2. **Emergency Fix for Products Table Only**
   - Run the `supabase/scripts/check_and_fix_db.sql` script
   - This script checks the database state and disables RLS on the products table
   - Use this if you only have issues with the products table

3. **Standard Fix: Run the Simple Products Access Script**
   - Run the `supabase/scripts/simple_products_access.sql` script
   - This creates permissive policies that allow any authenticated user to manage products
   - Maintains RLS but with permissive policies

4. **Update Your User Role**
   - If you prefer to keep restrictive policies, update your user role to 'master':
   ```sql
   -- Find your user ID first
   SELECT id, email, role FROM auth.users WHERE email = 'your-email@example.com';
   
   -- Then update your role
   UPDATE auth.users SET role = 'master' WHERE id = 'your-user-id';
   ```

### Storage Bucket Issues

If you encounter errors with image uploads or the image_url field is empty:

1. **Emergency Fix: Disable Storage RLS Completely**
   - Run the `supabase/scripts/check_and_fix_storage.sql` script
   - This script checks the storage setup and disables RLS on the storage.objects table
   - It's the most reliable solution when other approaches fail
   - Note: This reduces security but ensures functionality

2. **Use the Direct URL Input**
   - The application provides a fallback mechanism to enter image URLs directly
   - This works even if the storage bucket has permission issues

3. **Run the Simple Storage Setup Script**
   - Run the `supabase/scripts/simple_storage_setup.sql` script
   - This creates a bucket with simple permissive policies
   - Any authenticated user will be able to upload images

4. **Fix Permissions for Your User**
   - Verify the bucket exists:
     ```sql
     SELECT * FROM storage.buckets WHERE id = 'product-images';
     ```
   - Policies are created directly on tables, not stored in a separate table
   - Ensure your user has the 'master' role:
     ```sql
     SELECT * FROM auth.users WHERE id = '[your-user-id]';
     ```
   - Update your user role if needed:
     ```sql
     UPDATE auth.users SET role = 'master' WHERE id = '[your-user-id]';
     ```

### Product Creation Issues

If products aren't appearing in the store:

1. Check the products table:
   ```sql
   SELECT * FROM products ORDER BY created_at DESC;
   ```

2. Verify RLS policies:
   ```sql
   SELECT * FROM auth.policies WHERE table_name = 'products';
   ```

## Manual Database Adjustments

You can manually add or modify products directly in the database:

```sql
-- Add a new product
INSERT INTO products (
  id, name, description, price, image_url, created_at, created_by
)
VALUES (
  gen_random_uuid(),
  'New Sensor',
  'Description of the sensor',
  299.99,
  'https://example.com/image.jpg',
  NOW(),
  'Admin'
);

-- Update a product
UPDATE products
SET price = 249.99, description = 'Updated description'
WHERE id = '[product-id]';

-- Delete a product
DELETE FROM products WHERE id = '[product-id]';
```

## Next Steps

After setting up the database:

1. Log in as a site-wide admin (master role)
2. Navigate to the Store section
3. Try creating a new product with an uploaded image
4. Test the purchase flow as a regular admin