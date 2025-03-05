
import { TrackingObject } from "@/types/sensors";

export const updateTrackingObject = async (
  objectId: string,
  data: Partial<TrackingObject>
): Promise<{ success: boolean; message: string }> => {
  console.log(`Updating tracking object ${objectId}`, data);
  
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `Tracking object ${objectId} updated successfully`,
      });
    }, 800);
  });
};
