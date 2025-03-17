# Tracking Numbers for Purchases

This document describes the tracking number feature for purchases in the sensor store.

## Overview

The tracking number feature allows site-wide admins to add tracking information to purchases, including:

- Tracking number
- Carrier
- Shipped date

This information is displayed to regular admins in the "My Purchases" tab, allowing them to track their orders.

## Database Schema

The tracking information is stored in the following columns in the `purchases` table:

- `tracking_number`: The tracking number provided by the carrier
- `carrier`: The carrier used for shipping (e.g., DHL, FedEx, UPS)
- `shipped_date`: The date the order was shipped

## User Interface

### For Site-Wide Admins

Site-wide admins can add tracking information to purchases in the "All Purchases" tab:

1. Navigate to the "All Purchases" tab
2. Find the purchase you want to update
3. Enter the tracking number in the "Tracking Number" field
4. Select the carrier from the dropdown
5. Click the "Update Tracking Info" button to save the changes
6. The shipped date is automatically set when the status is changed to "sent"

When updating the purchase status, the tracking information is preserved. This ensures that tracking information is not lost when changing the status of a purchase.

### For Regular Admins

Regular admins can view tracking information for their purchases in the "My Purchases" tab:

1. Navigate to the "My Purchases" tab
2. Find the purchase you want to track
3. The tracking information is displayed in the "Tracking Information" section
4. Click on the tracking number to search for the package on Google

## Implementation Details

### Database Migration

The tracking number feature required adding three new columns to the `purchases` table:

```sql
ALTER TABLE purchases
ADD COLUMN tracking_number TEXT;

ALTER TABLE purchases
ADD COLUMN carrier TEXT;

ALTER TABLE purchases
ADD COLUMN shipped_date TIMESTAMP WITH TIME ZONE;
```

### API Updates

The `updatePurchaseStatus` method in `storeService.ts` was updated to handle tracking information:

```typescript
async updatePurchaseStatus(id: string, data: UpdatePurchaseStatusDto): Promise<Purchase | null> {
  // ...
  const updateData: any = { status: data.status };
  
  // Add tracking information if provided
  if (data.trackingNumber) updateData.tracking_number = data.trackingNumber;
  if (data.carrier) updateData.carrier = data.carrier;
  if (data.shippedDate) updateData.shipped_date = data.shippedDate;
  
  // If status is 'sent' and no shipped_date is provided, set it to now
  if (data.status === 'sent' && !data.shippedDate) {
    updateData.shipped_date = new Date().toISOString();
  }
  // ...
}
```

### UI Updates

The UI was updated to display tracking information in both the "My Purchases" and "All Purchases" tabs:

- In the "My Purchases" tab, tracking information is displayed as read-only
- In the "All Purchases" tab, tracking information can be edited by site-wide admins

## Testing

To test the tracking number feature:

1. Log in as a site-wide admin
2. Create a new product
3. Log in as a regular admin
4. Purchase the product
5. Log in as a site-wide admin again
6. Navigate to the "All Purchases" tab
7. Update the status to "sent"
8. Add a tracking number and select a carrier
9. Log in as a regular admin again
10. Navigate to the "My Purchases" tab
11. Verify that the tracking information is displayed correctly