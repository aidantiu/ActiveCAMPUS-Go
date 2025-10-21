 'use client';

import { useEffect, useRef, useState } from 'react';
import {
  DEFAULT_CHALLENGES,
  buildChallengeIcons,
  challengeInfoWindowTemplate,
  createChallengeMarkers,
  Challenge,
} from '../../lib/campusChallenges';
import { useAuth } from './AuthProvider';
import { completeChallenge, updateUserSteps } from '@/lib/firestore';
import {
  StepTracker,
  loadStepTracker,
  saveStepTracker,
  updateStepCount,
  getStepStats,
} from '@/lib/stepTracking';

interface MapComponentProps {
  onLocationUpdate?: (lat: number, lng: number) => void;
  onChallengeComplete?: () => void;
}

// PUP Sta. Mesa Main Campus coordinates
const PUP_CAMPUS = {
  lat: 14.5995,
  lng: 121.0107,
  name: 'PUP Sta. Mesa Campus'
};

// Enable this to always use demo location (useful for testing without GPS)
const FORCE_DEMO_MODE = false;

// LocalStorage helpers for claimed challenges
const saveClaimedChallengesToLocal = (uid: string, claimed: Record<string, boolean>) => {
  try {
    localStorage.setItem(`ac_claimed_${uid}`, JSON.stringify(claimed));
  } catch (e) {
    console.warn('Failed to save claimed challenges to localStorage', e);
  }
};

const loadClaimedChallengesFromLocal = (uid: string): Record<string, boolean> => {
  try {
    const stored = localStorage.getItem(`ac_claimed_${uid}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load claimed challenges from localStorage', e);
  }
  return {};
};

export default function MapComponent({ onLocationUpdate, onChallengeComplete }: MapComponentProps) {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userMarker, setUserMarker] = useState<google.maps.Marker | null>(null);
  const [accuracyCircle, setAccuracyCircle] = useState<google.maps.Circle | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  // Refs to hold latest instances for callbacks (avoid stale closures)
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const accuracyCircleRef = useRef<google.maps.Circle | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const challengeIconRef = useRef<Record<string, google.maps.Icon> | null>(null);
  const firstPositionHandledRef = useRef(false);
  const [logs, setLogs] = useState<string[]>([]);

  const pushLog = (msg: string) => {
    const ts = new Date().toISOString();
    const line = `${ts} | ${msg}`;
    setLogs((s) => [line, ...s].slice(0, 100));
    console.debug(line);
  };
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isClaimingReward, setIsClaimingReward] = useState(false);

  // Step tracking state
  const [stepTracker, setStepTracker] = useState<StepTracker | null>(null);
  const stepTrackerRef = useRef<StepTracker | null>(null);
  const [currentSteps, setCurrentSteps] = useState({
    total: 0,
    daily: 0,
    distance: 0
  });

  // Challenge state - initialize from user profile
  const [claimedChallenges, setClaimedChallenges] = useState<Record<string, boolean>>({});
  const claimedChallengesRef = useRef<Record<string, boolean>>({});
  const challengeMarkersRef = useRef<Record<string, google.maps.Marker>>({});
  const userLocationRef = useRef<{ lat: number; lng: number } | null>(null);
  const [campusEnergy, setCampusEnergy] = useState<number>(0);

  // Keep refs up-to-date for access inside Google Maps event listeners
  useEffect(() => {
    claimedChallengesRef.current = claimedChallenges;
  }, [claimedChallenges]);

  useEffect(() => {
    userLocationRef.current = userLocation;
  }, [userLocation]);

  // Save claimed challenges to localStorage when they change
  useEffect(() => {
    if (user && user.uid) {
      saveClaimedChallengesToLocal(user.uid, claimedChallenges);
    }
  }, [claimedChallenges, user]);

  // Sync claimed challenges and campusEnergy from authenticated user's profile
  useEffect(() => {
    if (userProfile && user) {
      const completed = userProfile.completedChallenges || [];
      const backendMap: Record<string, boolean> = {};
      completed.forEach((id) => (backendMap[id] = true));
      
      // Load local claims and merge (union) with backend
      const localMap = loadClaimedChallengesFromLocal(user.uid);
      const mergedMap = { ...localMap, ...backendMap };
      
      setClaimedChallenges(mergedMap);
      claimedChallengesRef.current = mergedMap;
      setCampusEnergy(userProfile.campusEnergy || 0);
      
      // Initialize step tracker
      const tracker = loadStepTracker(user.uid);
      // Sync with backend if backend has more steps
      if (userProfile.totalSteps > tracker.totalSteps) {
        tracker.totalSteps = userProfile.totalSteps;
      }
      if (userProfile.dailySteps > tracker.dailySteps) {
        tracker.dailySteps = userProfile.dailySteps;
      }
      setStepTracker(tracker);
      stepTrackerRef.current = tracker;
      setCurrentSteps({
        total: tracker.totalSteps,
        daily: tracker.dailySteps,
        distance: tracker.totalDistance
      });
      
      // One-time CE migration: Add CE for existing steps with new formula
      const expectedCEFromSteps = Math.floor(userProfile.totalSteps / 20) * 10;
      const migrationKey = `ce_migrated_v2_${user.uid}`;
      const hasMigrated = localStorage.getItem(migrationKey);
      
      if (!hasMigrated && userProfile.totalSteps >= 20 && expectedCEFromSteps > 0) {
        pushLog(`🔧 CE Migration: Adding ${expectedCEFromSteps} CE for ${userProfile.totalSteps} existing steps`);
        
        // Add the step CE to current CE (preserves quest rewards)
        const newCE = userProfile.campusEnergy + expectedCEFromSteps;
        
        // Update CE in backend
        import('@/lib/firebase').then(({ db }) => {
          import('firebase/firestore').then(({ doc, updateDoc }) => {
            const userRef = doc(db, 'users', user.uid);
            updateDoc(userRef, {
              campusEnergy: newCE
            }).then(() => {
              pushLog(`✅ CE migrated! Old: ${userProfile.campusEnergy} → New: ${newCE} (+${expectedCEFromSteps} CE)`);
              localStorage.setItem(migrationKey, 'true');
              refreshUserProfile();
            });
          });
        });
      }
      
      pushLog(`Loaded ${completed.length} challenges from backend, merged with local data`);
      pushLog(`Step tracker initialized: ${tracker.totalSteps} total steps, ${tracker.dailySteps} today`);
    }
  }, [userProfile, user]);

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
  // Include geometry library for distance calculations
  script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=geometry`;
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

        // --- Campus Challenges ---
        // Build icons and create markers using helpers in lib/campusChallenges
        challengeIconRef.current = buildChallengeIcons(google);
        console.log('ELTON DEBUGGING=== ', challengeIconRef.current);
        const markers = createChallengeMarkers(google, mapInstance, DEFAULT_CHALLENGES, challengeIconRef.current);

        // Wire up per-marker click handling that uses runtime userLocation and claimedChallenges state
        // Use a single shared InfoWindow to avoid multiple overlapping windows causing display issues
        const sharedInfoWindow = new google.maps.InfoWindow();
        Object.keys(markers).forEach((id) => {
          const marker = markers[id];
          const ch = DEFAULT_CHALLENGES.find((c) => c.id === id) as Challenge | undefined;
          if (!marker || !ch) return;

          marker.addListener('click', () => {
            pushLog(`Marker clicked: ${ch.id}`);
            const userPos = userLocationRef.current || PUP_CAMPUS;
            let dist = 0;
            try {
              dist = google.maps.geometry.spherical.computeDistanceBetween(
                new google.maps.LatLng(userPos.lat, userPos.lng),
                new google.maps.LatLng(ch.lat, ch.lng)
              );
            } catch (e) {
              // geometry library might be missing; keep dist=0 to avoid blocking interaction
            }

            const within = dist <= 50;
            sharedInfoWindow.setContent(challengeInfoWindowTemplate(ch, within, !!claimedChallengesRef.current[id]));
            sharedInfoWindow.open(mapInstance, marker);

            setTimeout(() => {
              const btn = document.getElementById(`claim-${ch.id}`);
              if (!btn) return;
              btn.onclick = async () => {
                if (!within) {
                  pushLog(`Attempted to claim ${ch.id} but not within proximity (${Math.round(dist)}m)`);
                  alert('You must be within 50 meters of the location to claim this reward.');
                  return;
                }
                if (claimedChallengesRef.current[ch.id]) {
                  pushLog(`Challenge ${ch.id} already claimed`);
                  return;
                }
                if (!user) {
                  alert('You must be logged in to claim rewards.');
                  return;
                }
                if (isClaimingReward) {
                  return; // Prevent multiple simultaneous claims
                }

                // Claim reward in Firebase
                setIsClaimingReward(true);
                pushLog(`Claiming challenge ${ch.id}...`);
                
                try {
                  const result = await completeChallenge(ch.id, user.uid);
                  
                  if (result.success) {
                    // Update local state
                    setClaimedChallenges((s) => ({ ...s, [ch.id]: true }));
                    claimedChallengesRef.current = { ...claimedChallengesRef.current, [ch.id]: true };
                    
                    // Show success message
                    setSuccessMessage(`🎉 Quest completed! +${ch.reward} CE earned!`);
                    setTimeout(() => setSuccessMessage(null), 3000);
                    
                    pushLog(`Successfully claimed challenge ${ch.id} +${ch.reward} CE`);

                    // Refresh user profile to get updated CE
                    await refreshUserProfile();
                    
                    // Notify parent component
                    if (onChallengeComplete) {
                      onChallengeComplete();
                    }

                    // Update info window content to show claimed and change marker icon
                    sharedInfoWindow.setContent(challengeInfoWindowTemplate(ch, true, true));
                    marker.setIcon(challengeIconRef.current?.claimed || undefined);
                  } else {
                    pushLog(`Failed to claim challenge ${ch.id}: ${result.reward === 0 ? 'Already completed' : 'Unknown error'}`);
                    alert('Failed to claim reward. You may have already claimed it.');
                  }
                } catch (error) {
                  console.error('Error claiming challenge:', error);
                  pushLog(`Error claiming challenge ${ch.id}: ${error}`);
                  alert('An error occurred while claiming the reward. Please try again.');
                } finally {
                  setIsClaimingReward(false);
                }
              };
            }, 50);
          });

          // Initialize icon based on claimed state
          if (claimedChallengesRef.current[id]) {
            marker.setIcon(challengeIconRef.current?.claimed || undefined);
          }

          challengeMarkersRef.current[id] = marker;
        });

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
    if (!map) return;

    // If forced demo mode is enabled, randomize a demo location on the campus and skip real geolocation
    if (FORCE_DEMO_MODE) {
      pushLog('FORCE_DEMO_MODE enabled — using randomized demo location');
      setIsTracking(true);

      const demoLocation = {
        lat: PUP_CAMPUS.lat + (Math.random() - 0.5) * 0.002,
        lng: PUP_CAMPUS.lng + (Math.random() - 0.5) * 0.002,
      };

      setUserLocation(demoLocation);

    // Create or update marker
    if (userMarkerRef.current) {
      userMarkerRef.current.setPosition(demoLocation);
      // Get user's avatar to determine which head icon to use
      const avatarBase = userProfile?.avatar?.base || 'boy';
      const headIconPath = avatarBase === 'girl' 
        ? '/icons/head_icons/base female.png' 
        : '/icons/head_icons/base male.png';
      
      userMarkerRef.current.setIcon({
        url: headIconPath,
        scaledSize: new google.maps.Size(40, 40),
        anchor: new google.maps.Point(20, 20),
      });
    } else {
      // Get user's avatar to determine which head icon to use
      const avatarBase = userProfile?.avatar?.base || 'boy';
      const headIconPath = avatarBase === 'girl' 
        ? '/icons/head_icons/base female.png' 
        : '/icons/head_icons/base male.png';
      
      const marker = new google.maps.Marker({
        position: demoLocation,
        map: map,
        title: 'Demo Location (Simulated)',
        icon: {
          url: headIconPath,
          scaledSize: new google.maps.Size(40, 40),
          anchor: new google.maps.Point(20, 20),
        },
      });

        const infoWindow = new google.maps.InfoWindow({
          content: `<div>
            <h3 style=\"font-weight: bold; margin-bottom: 4px; color: #FFA500;\">Demo Location</h3>
            <p style=\"font-size: 12px;\">Simulated position for testing</p>
            <p style=\"font-size: 11px;\">Lat: ${demoLocation.lat.toFixed(6)}</p>
            <p style=\"font-size: 11px;\">Lng: ${demoLocation.lng.toFixed(6)}</p>
          </div>`,
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        userMarkerRef.current = marker;
        setUserMarker(marker);
      }

      // Create or update accuracy circle
      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.setCenter(demoLocation);
        accuracyCircleRef.current.setRadius(20);
        accuracyCircleRef.current.setOptions({ strokeColor: '#FFA500', fillColor: '#FFA500' });
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
        accuracyCircleRef.current = circle;
        setAccuracyCircle(circle);
      }

      if (onLocationUpdate) onLocationUpdate(demoLocation.lat, demoLocation.lng);
      map.panTo(demoLocation);
      map.setZoom(18);

      return () => {
        if (userMarkerRef.current) {
          userMarkerRef.current.setMap(null);
          userMarkerRef.current = null;
        }
        if (accuracyCircleRef.current) {
          accuracyCircleRef.current.setMap(null);
          accuracyCircleRef.current = null;
        }
        pushLog('FORCE_DEMO_MODE cleanup complete');
      };
    }

    let isMounted = true;
    const stoppedRef = { current: false };

    const clearExistingWatch = () => {
      if (watchIdRef.current !== null) {
        try {
          navigator.geolocation.clearWatch(watchIdRef.current);
          pushLog(`clearWatch id=${watchIdRef.current}`);
        } catch (e) {
          console.debug('clearWatch failed', e);
        }
        watchIdRef.current = null;
        setWatchId(null);
      }
    };

    const applyPosition = (position: GeolocationPosition) => {
      if (!isMounted || stoppedRef.current) return;

      const userLatLng = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      pushLog(`applyPosition received coords: lat=${userLatLng.lat} lng=${userLatLng.lng} acc=${position.coords.accuracy}`);

      setUserLocation(userLatLng);

      // Update or create user marker using refs
      if (userMarkerRef.current) {
        userMarkerRef.current.setPosition(userLatLng);
      } else {
        // Get user's avatar to determine which head icon to use
        const avatarBase = userProfile?.avatar?.base || 'boy';
        const headIconPath = avatarBase === 'girl' 
          ? '/icons/head_icons/base female.png' 
          : '/icons/head_icons/base male.png';
        
        const marker = new google.maps.Marker({
          position: userLatLng,
          map: map,
          title: 'Your Location',
          icon: {
            url: headIconPath,
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 20),
          },
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `<div>
            <h3 style="font-weight: bold; margin-bottom: 4px;">Your Location</h3>
            <p>Lat: ${userLatLng.lat.toFixed(6)}</p>
            <p>Lng: ${userLatLng.lng.toFixed(6)}</p>
            <p>Accuracy: ${position.coords.accuracy?.toFixed(0) || 'N/A'}m</p>
          </div>`,
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        userMarkerRef.current = marker;
        setUserMarker(marker);
      }

      // Update or create accuracy circle using refs
      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.setCenter(userLatLng);
        if (position.coords.accuracy) accuracyCircleRef.current.setRadius(position.coords.accuracy);
      } else {
        const circle = new google.maps.Circle({
          strokeColor: '#4285F4',
          strokeOpacity: 0.3,
          strokeWeight: 1,
          fillColor: '#4285F4',
          fillOpacity: 0.1,
          map: map,
          center: userLatLng,
          radius: position.coords.accuracy || 30,
        });
        accuracyCircleRef.current = circle;
        setAccuracyCircle(circle);
      }

  if (onLocationUpdate) onLocationUpdate(userLatLng.lat, userLatLng.lng);

      if (!firstPositionHandledRef.current) {
        map.panTo(userLatLng);
        firstPositionHandledRef.current = true;
      }
      
      if (error) setError(null);
      pushLog(`Position updated: lat=${userLatLng.lat.toFixed(6)} lng=${userLatLng.lng.toFixed(6)} acc=${position.coords.accuracy?.toFixed(0)}m`);

      // Update step tracking
      pushLog(`🔍 Step tracking check: user=${!!user}, stepTrackerRef=${!!stepTrackerRef.current}`);
      
      if (user) {
        // Initialize step tracker if not already done
        if (!stepTrackerRef.current) {
          const tracker = loadStepTracker(user.uid);
          stepTrackerRef.current = tracker;
          setStepTracker(tracker);
          pushLog(`✨ Step tracker auto-initialized: ${tracker.totalSteps} total steps, ${tracker.dailySteps} today`);
        }
        
        pushLog(`🔍 Before updateStepCount: lastLoc=${stepTrackerRef.current.lastLocation ? 'exists' : 'null'}, totalSteps=${stepTrackerRef.current.totalSteps}`);
        const result = updateStepCount(stepTrackerRef.current, userLatLng);
        
        // Log result even if no steps (for debugging)
        pushLog(`📊 Step tracking result: distance=${result.distance.toFixed(2)}m, newSteps=${result.newSteps}, totalSteps=${result.tracker.totalSteps}`);
        
        // Always update local state (even if no new steps, to track lastLocation)
        stepTrackerRef.current = result.tracker;
        setStepTracker(result.tracker);
        setCurrentSteps({
          total: result.tracker.totalSteps,
          daily: result.tracker.dailySteps,
          distance: result.tracker.totalDistance
        });
        
        // Debug log for state update
        if (result.newSteps > 0) {
          pushLog(`📊 State updated: Total=${result.tracker.totalSteps}, Daily=${result.tracker.dailySteps}, Distance=${result.tracker.totalDistance.toFixed(1)}m`);
        }
        
        // Save to localStorage
        saveStepTracker(user.uid, result.tracker);
        
        if (result.newSteps > 0) {
          // Sync to backend immediately for instant updates
          updateUserSteps(
            user.uid,
            result.newSteps,
            result.tracker.totalSteps,
            result.tracker.dailySteps
          ).then((response) => {
            if (response) {
              pushLog(`✅ Steps synced: +${result.newSteps} steps, earned +${response.earnedCE} CE, Total CE: ${response.newCampusEnergy}`);
              // Always refresh user profile to update dashboard stats
              refreshUserProfile();
            }
          }).catch((err) => {
            console.error('Error updating steps:', err);
            pushLog(`❌ Sync error: ${err.message}`);
          });
          
          pushLog(`🚶 Steps: +${result.newSteps} (${result.distance.toFixed(1)}m) | Total: ${result.tracker.totalSteps} | Today: ${result.tracker.dailySteps}`);
        } else if (result.distance > 0) {
          pushLog(`⚠️ Movement detected but filtered: ${result.distance.toFixed(2)}m (min required: 0.5m)`);
        }
      } else {
        pushLog(`❌ Step tracking skipped: user=${!!user}, tracker=${!!stepTrackerRef.current}`);
      }

      // Update challenge proximity visuals
      try {
        const markers = challengeMarkersRef.current;
        Object.keys(markers).forEach((id) => {
          const m = markers[id];
          if (!m) return;
          const markerPos = m.getPosition();
          if (!markerPos) return;
          const dist = google.maps.geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(userLatLng.lat, userLatLng.lng),
            markerPos
          );

          const within = dist <= 50;
          // If within and not claimed, highlight marker using programmatic symbol
          if (within && !claimedChallenges[id]) {
            m.setIcon(challengeIconRef.current?.nearby || undefined);
          } else if (claimedChallenges[id]) {
            m.setIcon(challengeIconRef.current?.claimed || undefined);
          } else {
            m.setIcon(challengeIconRef.current?.default || undefined);
          }
        });
      } catch (e) {
        // geometry library may not be loaded; ignore
      }
    };

    const startTracking = () => {
      if (!isMounted || stoppedRef.current) return;
      
      // Clear any existing watch before starting fresh
      clearExistingWatch();
      
      setIsTracking(true);
      setError(null);

      pushLog('Starting location tracking...');
      
      const opts: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0,
      };

      const id = navigator.geolocation.watchPosition(
        (position) => {
          if (!isMounted || stoppedRef.current) return;
          applyPosition(position);
        },
        (err) => {
          if (!isMounted || stoppedRef.current) return;
          
          console.debug('Geolocation watch error', err);
          pushLog(`Watch error: code=${err?.code} msg=${err?.message}`);
          
          if (err?.code === 1) {
            // Permission denied
            setError('Location permission denied. Click "Use Demo Location" to simulate campus location.');
            setIsTracking(false);
            stoppedRef.current = true;
            clearExistingWatch();
          }
        },
        opts
      );

      watchIdRef.current = id;
      setWatchId(id);
      pushLog(`watchPosition started: id=${id}`);
    };

    // Start tracking immediately
    startTracking();

    // Cleanup
    return () => {
      isMounted = false;
      stoppedRef.current = true;
      
      clearExistingWatch();
      
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
        userMarkerRef.current = null;
      }
      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.setMap(null);
        accuracyCircleRef.current = null;
      }
      firstPositionHandledRef.current = false;
      pushLog('Tracking cleanup complete');
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
        pushLog('Manual getCurrentPosition succeeded');
        const userLatLng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setUserLocation(userLatLng);
        setError(null);
        setIsTracking(true);

        // Create or update marker
        if (userMarkerRef.current) {
          userMarkerRef.current.setPosition(userLatLng);
        } else {
          // Get user's avatar to determine which head icon to use
          const avatarBase = userProfile?.avatar?.base || 'boy';
          const headIconPath = avatarBase === 'girl' 
            ? '/icons/head_icons/base female.png' 
            : '/icons/head_icons/base male.png';
          
          const marker = new google.maps.Marker({
            position: userLatLng,
            map: map,
            title: 'Your Location',
            icon: {
              url: headIconPath,
              scaledSize: new google.maps.Size(40, 40),
              anchor: new google.maps.Point(20, 20),
            },
          });
          userMarkerRef.current = marker;
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
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const useDemoLocation = () => {
    if (!map) return;
    
    // Initialize step tracker if not already done
    if (!stepTrackerRef.current && user) {
      const tracker = loadStepTracker(user.uid);
      setStepTracker(tracker);
      stepTrackerRef.current = tracker;
      pushLog(`Step tracker initialized in demo mode: ${tracker.totalSteps} total steps`);
    }
    
    // Simulate location near PUP (slightly offset from campus center)
    const demoLocation = {
      lat: 14.5995 + (Math.random() - 0.5) * 0.002, // Random position within ~100m
      lng: 121.0107 + (Math.random() - 0.5) * 0.002,
    };

  pushLog('Using demo location (simulated)');
  setUserLocation(demoLocation);
    setIsTracking(true);
    
    // Trigger step tracking for demo location
    if (user && stepTrackerRef.current) {
      const result = updateStepCount(stepTrackerRef.current, demoLocation);
      pushLog(`📊 Demo step tracking: distance=${result.distance.toFixed(2)}m, newSteps=${result.newSteps}`);
      
      if (result.newSteps > 0 || result.distance > 0) {
        stepTrackerRef.current = result.tracker;
        setStepTracker(result.tracker);
        setCurrentSteps({
          total: result.tracker.totalSteps,
          daily: result.tracker.dailySteps,
          distance: result.tracker.totalDistance
        });
        saveStepTracker(user.uid, result.tracker);
        pushLog(`🚶 Demo steps updated: Total=${result.tracker.totalSteps}, Daily=${result.tracker.dailySteps}`);
      }
    }

    // Create or update marker
    if (userMarkerRef.current) {
      userMarkerRef.current.setPosition(demoLocation);
      // Get user's avatar to determine which head icon to use
      const avatarBase = userProfile?.avatar?.base || 'boy';
      const headIconPath = avatarBase === 'girl' 
        ? '/icons/head_icons/base female.png' 
        : '/icons/head_icons/base male.png';
      
      userMarkerRef.current.setIcon({
        url: headIconPath,
        scaledSize: new google.maps.Size(40, 40),
        anchor: new google.maps.Point(20, 20),
      });
    } else {
      // Get user's avatar to determine which head icon to use
      const avatarBase = userProfile?.avatar?.base || 'boy';
      const headIconPath = avatarBase === 'girl' 
        ? '/icons/head_icons/base female.png' 
        : '/icons/head_icons/base male.png';
      
      const marker = new google.maps.Marker({
        position: demoLocation,
        map: map,
        title: 'Demo Location (Simulated)',
        icon: {
          url: headIconPath,
          scaledSize: new google.maps.Size(40, 40),
          anchor: new google.maps.Point(20, 20),
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

      userMarkerRef.current = marker;
      setUserMarker(marker);
    }

    // Create demo accuracy circle
    if (accuracyCircleRef.current) {
      accuracyCircleRef.current.setCenter(demoLocation);
      accuracyCircleRef.current.setRadius(20); // Small radius for demo
      accuracyCircleRef.current.setOptions({
        strokeColor: '#FFA500',
        fillColor: '#FFA500',
      });
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
      accuracyCircleRef.current = circle;
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
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
          onClick={centerOnPUP}
          className="px-4 py-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 text-gray-900 font-medium text-sm"
        >
          🏫 PUP Campus
        </button>
        
        {/* Always show Demo Location button for easy testing */}
        <button
          onClick={useDemoLocation}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg shadow-lg hover:bg-orange-600 font-medium text-sm"
          title="Use a simulated location near PUP campus for testing"
        >
          🎮 Demo Location
        </button>
        
        {/* Sync Steps Button */}
        {user && stepTrackerRef.current && stepTrackerRef.current.totalSteps > 0 && (
          <button
            onClick={() => {
              if (stepTrackerRef.current) {
                pushLog(`🔄 Manual sync initiated...`);
                updateUserSteps(
                  user.uid,
                  0, // No new steps, just syncing current state
                  stepTrackerRef.current.totalSteps,
                  stepTrackerRef.current.dailySteps
                ).then((response) => {
                  if (response) {
                    pushLog(`✅ Manual sync complete: Total=${response.totalSteps}, Daily=${response.dailySteps}, Earned CE=${response.earnedCE}, Total CE=${response.newCampusEnergy}`);
                    refreshUserProfile();
                  }
                }).catch((err) => {
                  console.error('Error syncing steps:', err);
                  pushLog(`❌ Sync failed: ${err.message}`);
                });
              }
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 font-medium text-sm"
            title="Sync steps to backend and update dashboard"
          >
            🔄 Sync Steps
          </button>
        )}
        
        {/* Show retry button only when there's an error */}
        {error && !isTracking && (
          <button
            onClick={retryLocation}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 font-medium text-sm"
          >
            🔄 Retry GPS
          </button>
        )}
      </div>

      {/* Bottom Info Containers */}
      <div className="absolute bottom-4 left-4 flex gap-4">
        {/* Status Display */}
        <div className="bg-white rounded-lg shadow-lg p-4 max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="font-medium text-gray-900 text-sm">
              {isTracking ? 'Location Tracking Active' : 'Location Tracking Inactive'}
            </span>
          </div>
          
          {/* Quests Completed Display */}
          {userProfile && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Quests Completed:</span>
                <span className="text-sm font-semibold text-green-600">{userProfile.completedChallenges?.length || 0}</span>
              </div>
            </div>
          )}
          
          {/* Step Count Display */}
          {currentSteps.total > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Distance:</span>
                  <span className="text-xs font-medium text-gray-700">{(currentSteps.distance / 1000).toFixed(2)} km</span>
                </div>
              </div>
            </div>
          )}
          
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
        
      {/* Success Message Notification */}
      {successMessage && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-bounce">
          <p className="font-semibold text-sm">{successMessage}</p>
        </div>
      )}
    </div>
  );
}