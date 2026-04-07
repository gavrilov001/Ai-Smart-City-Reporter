'use client';

import { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api';

interface LocationPickerProps {
  onSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

// North Macedonia center coordinates
const defaultCenter = {
  lat: 41.6086,
  lng: 21.7453,
};

export default function LocationPicker({
  onSelect,
  initialLat,
  initialLng,
  initialAddress,
}: LocationPickerProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [searchInput, setSearchInput] = useState(initialAddress || '');
  const [currentCenter, setCurrentCenter] = useState({
    lat: initialLat || defaultCenter.lat,
    lng: initialLng || defaultCenter.lng,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Google Maps API Key Missing</p>
          <p className="text-gray-600 text-sm">
            Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (initialLat && initialLng) {
      setCurrentCenter({ lat: initialLat, lng: initialLng });
    }
  }, [initialLat, initialLng]);

  const onMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      updateLocation(lat, lng);
    }
  };

  const updateLocation = async (lat: number, lng: number) => {
    setCurrentCenter({ lat, lng });

    if (marker) {
      marker.setPosition({ lat, lng });
    } else if (map) {
      const newMarker = new google.maps.Marker({
        position: { lat, lng },
        map: map,
        draggable: true,
      });

      newMarker.addListener('dragend', () => {
        const position = newMarker.getPosition();
        if (position) {
          updateLocation(position.lat(), position.lng());
        }
      });

      setMarker(newMarker);
    }

    // Get address from coordinates
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ location: { lat, lng } });

      if (result.results[0]) {
        const address = result.results[0].formatted_address;
        setSearchInput(address);
        onSelect(lat, lng, address);
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      onSelect(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateLocation(latitude, longitude);
          setLoading(false);
        },
        (err) => {
          setError('Unable to get your location. Please check permissions.');
          setLoading(false);
          console.error('Geolocation error:', err);
        }
      );
    } else {
      setError('Geolocation not supported in your browser.');
      setLoading(false);
    }
  };

  const onPlaceSelected = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const address = place.formatted_address || '';
        updateLocation(lat, lng);
        setSearchInput(address);
      }
    }
  };

  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={['places', 'geocoding']}
      language="en"
    >
      <div className="space-y-4">
        {/* Search Input */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Autocomplete
              onLoad={setAutocomplete}
              onPlaceChanged={onPlaceSelected}
              options={{
                componentRestrictions: { country: 'mk' },
              }}
            >
              <input
                type="text"
                placeholder="Search location..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </Autocomplete>
          </div>

          {/* Current Location Button */}
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 flex items-center gap-2"
            title="Get your current location"
          >
            {loading ? (
              <>
                <span className="animate-spin">⟳</span>
                Locating...
              </>
            ) : (
              <>
                My Location
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Map */}
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={currentCenter}
          zoom={13}
          onLoad={setMap}
          onClick={onMapClick}
          options={{
            mapTypeControl: true,
            fullscreenControl: true,
            zoomControl: true,
          }}
        >
          {currentCenter && (
            <Marker
              position={currentCenter}
              draggable
              onDragEnd={(e) => {
                if (e.latLng) {
                  updateLocation(e.latLng.lat(), e.latLng.lng());
                }
              }}
            />
          )}
        </GoogleMap>

        {/* Coordinates Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-100 rounded-lg">
            <p className="text-xs text-gray-600 uppercase tracking-wide">Latitude</p>
            <p className="text-lg font-semibold text-gray-900">
              {currentCenter.lat.toFixed(6)}
            </p>
          </div>
          <div className="p-3 bg-gray-100 rounded-lg">
            <p className="text-xs text-gray-600 uppercase tracking-wide">Longitude</p>
            <p className="text-lg font-semibold text-gray-900">
              {currentCenter.lng.toFixed(6)}
            </p>
          </div>
        </div>
      </div>
    </LoadScript>
  );
}
