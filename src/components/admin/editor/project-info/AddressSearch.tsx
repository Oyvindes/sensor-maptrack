
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SensorFolder } from "@/types/users";
import { MapPin, Search } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface AddressSearchProps {
  address: string | undefined;
  onChange: (field: keyof SensorFolder, value: string) => void;
}

interface AddressSuggestion {
  address: string;
  postcode: string;
  city: string;
  lat?: number;
  lng?: number;
}

const AddressSearch: React.FC<AddressSearchProps> = ({
  address,
  onChange
}) => {
  const { t } = useTranslation();
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
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon)
          };
        });
        
        setSuggestions(addressSuggestions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
        toast.warning(t('projectEditor.noAddressFound'));
      }
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
      toast.error(t('projectEditor.fetchError'));
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
    const fullAddress = `${suggestion.address}, ${suggestion.postcode} ${suggestion.city}, Norway`;
    onChange("address" as keyof SensorFolder, fullAddress);
    
    if (suggestion.lat && suggestion.lng) {
      const locationData = JSON.stringify({
        lat: suggestion.lat,
        lng: suggestion.lng
      });
      onChange("location" as keyof SensorFolder, locationData);
      
      toast.success(`${t('projectEditor.addressSet')} [${suggestion.lat}, ${suggestion.lng}]`);
    }
    
    setShowSuggestions(false);
    setAddressQuery("");
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="address">
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          <span>{t('projectEditor.projectAddress')}</span>
        </div>
      </Label>
      <div className="relative">
        <div className="flex gap-2">
          <Input
            id="addressSearch"
            value={addressQuery}
            onChange={(e) => setAddressQuery(e.target.value)}
            placeholder={t('projectEditor.searchAddress')}
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
                    {suggestion.postcode} {suggestion.city}, Norway
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t('projectEditor.coordinates')} [{suggestion.lat}, {suggestion.lng}]
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
        
        <Input
          id="address"
          value={address || ""}
          readOnly
          disabled
          placeholder={t('projectEditor.fullAddress')}
          className="mt-2 bg-muted cursor-not-allowed"
        />
      </div>
    </div>
  );
};

export default AddressSearch;
