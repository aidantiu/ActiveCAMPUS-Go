'use client';

import { useEffect, useRef, useState } from 'react';

interface MapComponentProps {
  onLocationUpdate?: (lat: number, lng: number) => void;
}

// PUP Sta. Mesa Main Campus coordinates
const PUP_CAMPUS = {
  lat: 14.5995,
  lng: 121.0107,
  name: 'PUP Sta. Mesa Campus'
};

export default function MapComponent({ onLocationUpdate }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userMarker, setUserMarker] = useState<google.maps.Marker | null>(null);
  const [accuracyCircle, setAccuracyCircle] = useState<google.maps.Circle | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = () => {
      try {
        // Check if API key is set
        if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
          setMapError('Google Maps API key not found. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env file.');
          return;
        }

        // Check if Google Maps is already fully loaded
        if (typeof google !== 'undefined' && google.maps && google.maps.Map) {
          createMap();
          return;
        }

        // Check if script is already being loaded
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
          // Script already exists, wait for it to load
          existingScript.addEventListener('load', () => {
            // Wait a bit for Google Maps to fully initialize
            setTimeout(() => {
              if (typeof google !== 'undefined' && google.maps && google.maps.Map) {
                createMap();
              }
            }, 500);
          });
          return;
        }

        // Load Google Maps script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          // Wait for Google Maps to fully initialize
          setTimeout(() => {
            if (typeof google !== 'undefined' && google.maps && google.maps.Map) {
              createMap();
            } else {
              setMapError('Google Maps failed to initialize properly. Please refresh the page.');
            }
          }, 500);
        };

        script.onerror = (e) => {
          console.error('Google Maps script load error:', e);
          setMapError('Failed to load Google Maps. Please check your API key and internet connection.');
        };

        document.head.appendChild(script);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setMapError('Failed to initialize Google Maps. Please check your configuration.');
      }
    };

    const createMap = () => {
      if (mapRef.current && typeof google !== 'undefined' && google.maps && google.maps.Map) {
        // Create map centered on PUP Campus
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: PUP_CAMPUS,
          zoom: 16,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        });

        // Add PUP Campus marker
        new google.maps.Marker({
          position: PUP_CAMPUS,
          map: mapInstance,
          title: PUP_CAMPUS.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#8B0000',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          },
          label: {
            text: 'PUP',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold',
          }
        });

        // Add campus boundary circle
        new google.maps.Circle({
          strokeColor: '#8B0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#8B0000',
          fillOpacity: 0.1,
          map: mapInstance,
          center: PUP_CAMPUS,
          radius: 500, // 500 meters radius
        });

        setMap(mapInstance);

        // Add click listener to add custom markers
        mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            const marker = new google.maps.Marker({
              position: e.latLng,
              map: mapInstance,
              title: 'Custom Location',
            });

            const infoWindow = new google.maps.InfoWindow({
              content: `<div>
                <h3 style="font-weight: bold; margin-bottom: 4px;">Custom Location</h3>
                <p>Lat: ${e.latLng.lat().toFixed(6)}</p>
                <p>Lng: ${e.latLng.lng().toFixed(6)}</p>
              </div>`,
            });

            marker.addListener('click', () => {
              infoWindow.open(mapInstance, marker);
            });
          }
        });
      }
    };

    initMap();
  }, []);

  // Track user location
  useEffect(() => {
    if (!map) {
      return;
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported. Using PUP campus as default location.');
      // Use PUP campus as default location
      setUserLocation(PUP_CAMPUS);
      return;
    }

    let retryCount = 0;
    const maxRetries = 2; // Reduced retries

    const startTracking = (useHighAccuracy: boolean = true) => {
      setIsTracking(true);
      
      // Clear previous error when starting
      if (retryCount === 0) {
        setError(null);
      }

      const id = navigator.geolocation.watchPosition(
        (position) => {
          // Reset retry count on success
          retryCount = 0;
          
          const userLatLng = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          setUserLocation(userLatLng);

          // Update or create user marker
          if (userMarker) {
            userMarker.setPosition(userLatLng);
          } else {
            const marker = new google.maps.Marker({
              position: userLatLng,
              map: map,
              title: 'Your Location',
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 3,
              },
            });

            const infoWindow = new google.maps.InfoWindow({
              content: `<div>
                <h3 style="font-weight: bold; margin-bottom: 4px;">Your Location</h3>
                <p>Lat: ${userLatLng.lat.toFixed(6)}</p>
                <p>Lng: ${userLatLng.lng.toFixed(6)}</p>
                <p>Accuracy: ${position.coords.accuracy.toFixed(0)}m</p>
              </div>`,
            });

            marker.addListener('click', () => {
              infoWindow.open(map, marker);
            });

            setUserMarker(marker);
          }

          // Update or create accuracy circle
          if (accuracyCircle) {
            accuracyCircle.setCenter(userLatLng);
            accuracyCircle.setRadius(position.coords.accuracy);
          } else {
            const circle = new google.maps.Circle({
              strokeColor: '#4285F4',
              strokeOpacity: 0.3,
              strokeWeight: 1,
              fillColor: '#4285F4',
              fillOpacity: 0.1,
              map: map,
              center: userLatLng,
              radius: position.coords.accuracy,
            });
            setAccuracyCircle(circle);
          }

          // Call the callback if provided
          if (onLocationUpdate) {
            onLocationUpdate(userLatLng.lat, userLatLng.lng);
          }

          // Center map on user location (only on first position)
          if (!watchId) {
            map.panTo(userLatLng);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          
          // Handle different error types
          if (error.code === 1) {
            // PERMISSION_DENIED
            setError('Location permission denied. Click "Use Demo Location" to simulate campus location.');
            setIsTracking(false);
          } else if (error.code === 2) {
            // POSITION_UNAVAILABLE
            setError('Location unavailable. GPS may not be available. Try "Use Demo Location" button.');
            setIsTracking(false);
          } else if (error.code === 3) {
            // TIMEOUT
            retryCount++;
            if (retryCount < maxRetries) {
              // Retry with less accuracy requirement
              setError(`Getting location... (attempt ${retryCount + 1}/${maxRetries + 1})`);
              if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
              }
              // Retry with lower accuracy to get faster results
              setTimeout(() => startTracking(false), 2000);
            } else {
              setError('Cannot get GPS location. Click "Use Demo Location" to test the map with simulated location near PUP.');
              setIsTracking(false);
            }
          } else {
            setError(`Location error: ${error.message}. Try "Use Demo Location" button.`);
            setIsTracking(false);
          }
        },
        {
          enableHighAccuracy: useHighAccuracy,
          timeout: useHighAccuracy ? 15000 : 20000, // Even longer timeout
          maximumAge: 60000, // Use cached position up to 60 seconds old
        }
      );

      setWatchId(id);
    };

    startTracking();

    // Cleanup
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [map, onLocationUpdate]);

  const centerOnUser = () => {
    if (map && userLocation) {
      map.panTo(userLocation);
      map.setZoom(18);
    }
  };

  const centerOnPUP = () => {
    if (map) {
      map.panTo(PUP_CAMPUS);
      map.setZoom(16);
    }
  };

  const retryLocation = () => {
    if (!navigator.geolocation || !map) return;
    
    setError('Trying to get your location...');
    setIsTracking(true);
    
    // Try to get current position immediately (not watching)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLatLng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setUserLocation(userLatLng);
        setError(null);
        setIsTracking(true);

        // Create or update marker
        if (userMarker) {
          userMarker.setPosition(userLatLng);
        } else {
          const marker = new google.maps.Marker({
            position: userLatLng,
            map: map,
            title: 'Your Location',
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 3,
            },
          });
          setUserMarker(marker);
        }

        // Center map on user
        map.panTo(userLatLng);
        map.setZoom(18);
      },
      (error) => {
        console.error('Manual location retry failed:', error);
        setError('Could not get location. Please check your device settings and try again.');
        setIsTracking(false);
      },
      {
        enableHighAccuracy: false, // Use network-based location for faster results
        timeout: 15000,
        maximumAge: 60000, // Accept cached location up to 1 minute old
      }
    );
  };

  const useDemoLocation = () => {
    if (!map) return;
    
    // Simulate location near PUP (slightly offset from campus center)
    const demoLocation = {
      lat: 14.5995 + (Math.random() - 0.5) * 0.002, // Random position within ~100m
      lng: 121.0107 + (Math.random() - 0.5) * 0.002,
    };

    setUserLocation(demoLocation);
    setError('Using demo location near PUP campus for testing');
    setIsTracking(true);

    // Create or update marker
    if (userMarker) {
      userMarker.setPosition(demoLocation);
    } else {
      const marker = new google.maps.Marker({
        position: demoLocation,
        map: map,
        title: 'Demo Location (Simulated)',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#FFA500', // Orange color for demo
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 3,
        },
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `<div>
          <h3 style="font-weight: bold; margin-bottom: 4px; color: #FFA500;">Demo Location</h3>
          <p style="font-size: 12px;">Simulated position for testing</p>
          <p style="font-size: 11px;">Lat: ${demoLocation.lat.toFixed(6)}</p>
          <p style="font-size: 11px;">Lng: ${demoLocation.lng.toFixed(6)}</p>
        </div>`,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      setUserMarker(marker);
    }

    // Create demo accuracy circle
    if (accuracyCircle) {
      accuracyCircle.setCenter(demoLocation);
      accuracyCircle.setRadius(20); // Small radius for demo
    } else {
      const circle = new google.maps.Circle({
        strokeColor: '#FFA500',
        strokeOpacity: 0.3,
        strokeWeight: 1,
        fillColor: '#FFA500',
        fillOpacity: 0.1,
        map: map,
        center: demoLocation,
        radius: 20,
      });
      setAccuracyCircle(circle);
    }

    // Call the callback if provided
    if (onLocationUpdate) {
      onLocationUpdate(demoLocation.lat, demoLocation.lng);
    }

    // Center map on demo location
    map.panTo(demoLocation);
    map.setZoom(18);
  };

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Map Error Display */}
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 p-8">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🗺️</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Google Maps Setup Required
                </h3>
                <p className="text-sm text-red-600 mb-4">
                  {mapError}
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Quick Fix:</p>
                  <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                    <li>Go to <a href="https://console.cloud.google.com/apis/library/maps-backend.googleapis.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">Google Cloud Console</a></li>
                    <li>Enable <strong>Maps JavaScript API</strong></li>
                    <li>Create an API key or use existing one</li>
                    <li>Add to your <code className="bg-blue-100 px-1 rounded">.env</code> file:
                      <pre className="bg-blue-100 p-2 rounded mt-2 text-xs overflow-x-auto">
                        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
                      </pre>
                    </li>
                    <li>Restart the development server</li>
                  </ol>
                </div>
                <div className="flex gap-2">
                  <a
                    href="https://console.cloud.google.com/apis/library/maps-backend.googleapis.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-gray-900 rounded-lg hover:bg-blue-700 font-medium text-sm"
                  >
                    Enable Maps API
                  </a>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-sm"
                  >
                    Reload Page
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  📖 See <code>GOOGLE_MAPS_SETUP.md</code> for detailed instructions
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={centerOnUser}
          disabled={!userLocation}
          className="px-4 py-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
        >
          📍 My Location
        </button>
        <button
          onClick={centerOnPUP}
          className="px-4 py-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 text-gray-900 font-medium text-sm"
        >
          🏫 PUP Campus
        </button>
        
        {/* Always show Demo Location button for easy testing */}
        <button
          onClick={useDemoLocation}
          className="px-4 py-2 bg-orange-500 text-gray-900 rounded-lg shadow-lg hover:bg-orange-600 font-medium text-sm"
          title="Use a simulated location near PUP campus for testing"
        >
          🎮 Demo Location
        </button>
        
        {/* Show retry button only when there's an error */}
        {error && !isTracking && (
          <button
            onClick={retryLocation}
            className="px-4 py-2 bg-blue-500 text-gray-900 rounded-lg shadow-lg hover:bg-blue-600 font-medium text-sm"
          >
            🔄 Retry GPS
          </button>
        )}
      </div>

      {/* Status Display */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="font-medium  text-gray-900 text-sm">
            {isTracking ? 'Location Tracking Active' : 'Location Tracking Inactive'}
          </span>
        </div>
        
        {error && (
          <p className="text-red-600 text-xs mt-2">{error}</p>
        )}

        {userLocation && (
          <div className="text-xs text-gray-600 mt-2 space-y-1">
            <p>Latitude: {userLocation.lat.toFixed(6)}</p>
            <p>Longitude: {userLocation.lng.toFixed(6)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
