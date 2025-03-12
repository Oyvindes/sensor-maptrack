# Company Management Implementation

This document outlines the implementation of company management features in the sensor-maptrack application.

## Database Schema

The application uses a Supabase database with the following tables for company management:

### Companies Table

```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  industry TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Tracking Objects Table

```sql
CREATE TABLE tracking_objects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  company_id UUID REFERENCES companies(id),
  location GEOGRAPHY(POINT),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## Error Handling

When attempting to create tracking objects with invalid company IDs, the system will encounter a foreign key constraint error:

```
Error updating tracking object: {
  code: '23503', 
  details: 'Key is not present in table "companies".',
  hint: null, 
  message: 'insert or update on table "tracking_objects" violates foreign key constraint "tracking_objects_company_id_fkey"'
}
```

## Solution

To resolve this issue, we've implemented a Supabase Admin MCP server that provides tools for managing database schema. The server includes an `alter_table` tool that can modify existing tables to ensure proper structure and relationships.

### Using the Supabase Admin MCP Server

1. The server is located at `C:/Users/ØyvindEspnes/Documents/Cline/MCP/supabase-admin/`
2. Start the server using `start.bat` (ensure Supabase credentials are properly configured)
3. Use the `alter_table` tool to add or modify columns as needed

### Example: Fixing Company ID Issues

To ensure the companies table exists with the proper structure:

```json
{
  "method": "call_tool", 
  "params": {
    "name": "execute_sql",
    "arguments": {
      "sql": "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'companies');"
    }
  }
}
```

If the companies table exists but is missing required columns:

```json
{
  "method": "call_tool", 
  "params": {
    "name": "alter_table",
    "arguments": {
      "tableName": "companies",
      "alterations": [
        {
          "operation": "add_column",
          "columnName": "id",
          "columnType": "uuid",
          "isNullable": false,
          "defaultValue": "uuid_generate_v4()"
        }
      ]
    }
  }
}
```

## Frontend Implementation

The company management features are implemented in the following components:

- `src/components/admin/CompanyEditor.tsx` - For creating and editing companies
- `src/components/admin/CompanyList.tsx` - For displaying and managing companies
- `src/components/dashboard/TrackingSection.tsx` - For associating tracking objects with companies

## API Integration

The application uses Supabase client to interact with the database:

```typescript
// Example: Creating a new company
const { data, error } = await supabase
  .from('companies')
  .insert([
    { name: companyName, industry: companyIndustry }
  ])
  .select();

// Example: Associating a tracking object with a company
const { data, error } = await supabase
  .from('tracking_objects')
  .update({ company_id: companyId })
  .eq('id', trackingObjectId)
  .select();
```

## Future Improvements

1. Add company validation before creating tracking objects
2. Implement company-based access control for users
3. Add company analytics dashboard
4. Enhance company profile with additional metadata