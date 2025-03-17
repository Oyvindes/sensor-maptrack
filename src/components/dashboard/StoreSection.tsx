import React, { useState, useEffect } from 'react';
import { storeService } from '@/services/store';
import { Purchase } from '@/types/store';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Add type assertions for the purchases data
const StoreSection: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoadingPurchases, setIsLoadingPurchases] = useState(true);
  
  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        setIsLoadingPurchases(true);
        const purchases = await storeService.listUserPurchases();
        // Add type assertion here to fix the type error
        setPurchases(purchases as Purchase[]);
      } catch (error) {
        console.error('Error fetching purchases:', error);
        toast.error('Failed to load your orders');
      } finally {
        setIsLoadingPurchases(false);
      }
    };

    fetchPurchases();
  }, []);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your Orders</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {isLoadingPurchases ? (
          <p>Loading orders...</p>
        ) : purchases.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Order Ref</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">{purchase.orderReference}</TableCell>
                    <TableCell>{purchase.productName}</TableCell>
                    <TableCell>{purchase.quantity}</TableCell>
                    <TableCell>${purchase.totalPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{purchase.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(purchase.purchasedAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p>No orders found.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default StoreSection;
