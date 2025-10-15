// Step tracking utility using GPS distance-based calculation
// Converts GPS movement into step count with error filtering

export interface StepTracker {
  totalSteps: number;
  totalDistance: number; // in meters
  dailySteps: number;
  lastLocation: { lat: number; lng: number } | null;
  lastUpdateTime: number;
  lastResetDate: string; // ISO date string for daily reset
}

// Constants for step calculation
const METERS_PER_STEP = 0.6; // Average step length (~2 feet) - adjusted for more generous counting
const WALKING_SPEED_MPS = 1.4; // Average walking speed in meters per second
const MIN_DISTANCE = 0.5; // Minimum distance to count (filters GPS noise) - lowered for more sensitivity
const MAX_DISTANCE = 100; // Maximum distance per update (filters GPS jumps) - increased for running
const MAX_SPEED_MPS = 6.0; // Maximum speed ~21.6 km/h (fast running/jogging)

/**
 * Create a new step tracker instance
 */
export function createStepTracker(): StepTracker {
  return {
    totalSteps: 0,
    totalDistance: 0,
    dailySteps: 0,
    lastLocation: null,
    lastUpdateTime: Date.now(),
    lastResetDate: new Date().toISOString().split('T')[0]
  };
}

/**
 * Load step tracker from localStorage
 */
export function loadStepTracker(userId: string): StepTracker {
  try {
    const stored = localStorage.getItem(`step_tracker_${userId}`);
    if (stored) {
      const tracker = JSON.parse(stored) as StepTracker;
      // Check if we need to reset daily steps
      const today = new Date().toISOString().split('T')[0];
      if (tracker.lastResetDate !== today) {
        tracker.dailySteps = 0;
        tracker.lastResetDate = today;
      }
      return tracker;
    }
  } catch (e) {
    console.warn('Failed to load step tracker from localStorage', e);
  }
  return createStepTracker();
}

/**
 * Save step tracker to localStorage
 */
export function saveStepTracker(userId: string, tracker: StepTracker): void {
  try {
    localStorage.setItem(`step_tracker_${userId}`, JSON.stringify(tracker));
  } catch (e) {
    console.warn('Failed to save step tracker to localStorage', e);
  }
}

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Convert distance in meters to step count
 */
export function distanceToSteps(distanceInMeters: number): number {
  return Math.floor(distanceInMeters / METERS_PER_STEP);
}

/**
 * Validate if distance change is realistic (filters GPS errors)
 */
export function isValidDistance(
  distance: number,
  timeElapsedSeconds: number
): boolean {
  // Must be minimum distance to count
  if (distance < MIN_DISTANCE) return false;

  // Must not exceed maximum distance per update
  if (distance > MAX_DISTANCE) return false;

  // Calculate speed
  if (timeElapsedSeconds > 0) {
    const speed = distance / timeElapsedSeconds;
    // Must not exceed maximum human speed
    if (speed > MAX_SPEED_MPS) return false;
  }

  return true;
}

/**
 * Update step count based on new GPS location
 * Returns the number of new steps added
 */
export function updateStepCount(
  tracker: StepTracker,
  newLocation: { lat: number; lng: number }
): { newSteps: number; distance: number; tracker: StepTracker } {
  const now = Date.now();
  let newSteps = 0;
  let distance = 0;

  // Check if we need to reset daily steps
  const today = new Date().toISOString().split('T')[0];
  if (tracker.lastResetDate !== today) {
    tracker.dailySteps = 0;
    tracker.lastResetDate = today;
  }

  if (tracker.lastLocation) {
    // Calculate distance moved
    distance = calculateDistance(
      tracker.lastLocation.lat,
      tracker.lastLocation.lng,
      newLocation.lat,
      newLocation.lng
    );

    // Calculate time elapsed in seconds
    const timeElapsed = (now - tracker.lastUpdateTime) / 1000;

    // Validate distance (filter out GPS errors)
    if (isValidDistance(distance, timeElapsed)) {
      // Update total distance
      tracker.totalDistance += distance;

      // Convert distance to steps
      newSteps = distanceToSteps(distance);

      if (newSteps > 0) {
        tracker.totalSteps += newSteps;
        tracker.dailySteps += newSteps;
      }
    } else {
      // Invalid distance - likely GPS error, don't count it
      console.debug(
        `Filtered out invalid distance: ${distance.toFixed(2)}m in ${timeElapsed.toFixed(1)}s`
      );
    }
  }

  // Update tracking state
  tracker.lastLocation = newLocation;
  tracker.lastUpdateTime = now;

  return { newSteps, distance, tracker };
}

/**
 * Get step statistics
 */
export function getStepStats(tracker: StepTracker) {
  return {
    totalSteps: tracker.totalSteps,
    dailySteps: tracker.dailySteps,
    totalDistance: tracker.totalDistance,
    totalDistanceKm: (tracker.totalDistance / 1000).toFixed(2),
    dailyDistanceKm: 'N/A', // Can be calculated if needed
    averageStepLength: tracker.totalSteps > 0 
      ? (tracker.totalDistance / tracker.totalSteps).toFixed(2)
      : METERS_PER_STEP.toFixed(2),
  };
}

/**
 * Reset daily steps (typically called at midnight)
 */
export function resetDailySteps(tracker: StepTracker): StepTracker {
  const today = new Date().toISOString().split('T')[0];
  return {
    ...tracker,
    dailySteps: 0,
    lastResetDate: today
  };
}

