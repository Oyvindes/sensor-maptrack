import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Search } from "lucide-react";
import { toast } from "sonner";

interface ShippingAddressSearchProps {
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  onChange: (field: string, value: string) => void;
}

interface AddressSuggestion {
  address: string;
  postcode: string;
  city: string;
  country: string;
  lat?: number;
  lng?: number;
}

const ShippingAddressSearch: React.FC<ShippingAddressSearchProps> = ({
  shippingAddress,
  shippingCity,
  shippingPostalCode,
  shippingCountry,
  onChange
}) => {
  const [addressQuery, setAddressQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchNorwegianAddresses = async (query: string) => {
    if (!query || query.length < 3) return;
    
    try {
      setIsSearching(true);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)},Norway&addressdetails=1&limit=5`,
        {
          headers: {
            "Accept-Language": "en-US,en;q=0.9,nb;q=0.8",
            "User-Agent": "SensorTrackingAppDemo/1.0"
          }
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch address data");
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const addressSuggestions: AddressSuggestion[] = data.map((item: any) => {
          const road = item.address.road || "";
          const houseNumber = item.address.house_number || "";
          const postcode = item.address.postcode || "";
          const city = item.address.city || item.address.town || item.address.village || "Trondheim";
          
          return {
            address: `${road} ${houseNumber}`.trim(),
            postcode: postcode,
            city: city,
            country: "Norway",
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon)
          };
        });
        
        setSuggestions(addressSuggestions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
        toast.warning("No matching addresses found. Please try a different search term.");
      }
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
      toast.error("Failed to fetch address data. Please check your connection and try again.");
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddressSearch = () => {
    searchNorwegianAddresses(addressQuery);
  };

  const handleSelectAddress = (suggestion: AddressSuggestion) => {
    // Update all shipping address fields
    onChange("shippingAddress", suggestion.address);
    onChange("shippingCity", suggestion.city);
    onChange("shippingPostalCode", suggestion.postcode);
    onChange("shippingCountry", suggestion.country);
    
    toast.success(`Address set to ${suggestion.address}, ${suggestion.postcode} ${suggestion.city}, ${suggestion.country}`);
    
    setShowSuggestions(false);
    setAddressQuery("");
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="addressSearch">
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          <span>Search for Norwegian address</span>
        </div>
      </Label>
      <div className="relative">
        <div className="flex gap-2">
          <Input
            id="addressSearch"
            value={addressQuery}
            onChange={(e) => setAddressQuery(e.target.value)}
            placeholder="Search for Norwegian address..."
            className="flex-1"
          />
          <Button 
            type="button" 
            onClick={handleAddressSearch} 
            disabled={isSearching || addressQuery.length < 3}
            size="icon"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
        
        {showSuggestions && suggestions.length > 0 && (
          <Card className="absolute z-10 mt-1 w-full max-h-64 overflow-auto bg-white dark:bg-[#1f1e24]">
            <div className="p-2">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-2 hover:bg-muted cursor-pointer rounded-sm"
                  onClick={() => handleSelectAddress(suggestion)}
                >
                  <div className="font-medium">{suggestion.address}</div>
                  <div className="text-sm text-muted-foreground">
                    {suggestion.postcode} {suggestion.city}, {suggestion.country}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Coordinates: [{suggestion.lat}, {suggestion.lng}]
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ShippingAddressSearch;