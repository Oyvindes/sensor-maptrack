import React from 'react';
import { DatabaseStatus } from '@/components/admin/DatabaseStatus';
import AdminHeader from '@/components/admin/AdminHeader';

export default function DatabaseStatusPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <AdminHeader />
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Database Status</h1>
        <p className="text-muted-foreground">Check the connection status of your Supabase database</p>
      </div>
      
      <div className="mt-8">
        <DatabaseStatus />
      </div>
      
      <div className="mt-8 p-4 border rounded-lg bg-muted">
        <h3 className="text-lg font-medium mb-2">About Database Connection</h3>
        <p className="text-sm text-muted-foreground mb-4">
          This page allows you to check if your application is properly connected to the Supabase database.
          It verifies access to all tables and displays record counts for each table.
        </p>
        
        <h4 className="font-medium mb-1">Troubleshooting Tips:</h4>
        <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
          <li>Ensure your Supabase API key is correctly set in the .env file</li>
          <li>Check that the Supabase URL is correct</li>
          <li>Verify that your database is online in the Supabase dashboard</li>
          <li>Check for any network restrictions that might block API access</li>
        </ul>
      </div>
    </div>
  );
}