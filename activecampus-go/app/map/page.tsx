'use client';

import { useState } from 'react';
import MapComponent from '../components/MapComponent';
import { useAuth } from '../components/AuthProvider';

export default function MapPage() {
  const { userProfile, refreshUserProfile } = useAuth();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleLocationUpdate = (lat: number, lng: number) => {
    setUserLocation({ lat, lng });
    console.log('User location updated:', { lat, lng });
  };

  const handleChallengeComplete = async () => {
    // Refresh user profile to get updated stats
    await refreshUserProfile();
    console.log('Challenge completed - profile refreshed');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🗺️ Campus Map</h1>
              <p className="text-sm text-gray-600">PUP Sta. Mesa - Track your location & complete quests</p>
            </div>
            
            <div className="text-right">
              {userProfile && (
                <div className="mb-2">
                  <p className="text-xs text-gray-500">Campus Energy</p>
                  <p className="text-lg font-bold text-blue-600">{userProfile.campusEnergy} CE</p>
                </div>
              )}
              {userLocation && (
                <div>
                  <p className="text-xs text-gray-500">Your Coordinates</p>
                  <p className="text-sm font-mono text-gray-700">
                    {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="h-[calc(100vh-80px)]">
        <MapComponent 
          onLocationUpdate={handleLocationUpdate} 
          onChallengeComplete={handleChallengeComplete}
        />
      </div>
    </div>
  );
}
