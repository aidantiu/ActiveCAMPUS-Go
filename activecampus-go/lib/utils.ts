// Utility functions for ActiveCAMPUS-Go

// Step simulation for testing
export const simulateSteps = (min: number = 100, max: number = 1000): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// Check if user is within challenge radius
export const isWithinRadius = (
  userLat: number,
  userLon: number,
  targetLat: number,
  targetLon: number,
  radius: number
): boolean => {
  const distance = calculateDistance(userLat, userLon, targetLat, targetLon);
  return distance <= radius;
};

// Format steps with commas
export const formatSteps = (steps: number): string => {
  return steps.toLocaleString();
};

// Format CE
export const formatCE = (ce: number): string => {
  return `${ce} CE`;
};

// Calculate CE earned from steps
export const calculateCEFromSteps = (steps: number): number => {
  // Example: 100 steps = 1 CE
  return Math.floor(steps / 100);
};

// Calculate level from total steps
export const calculateLevel = (totalSteps: number): number => {
  // Example: Every 5000 steps = 1 level
  return Math.floor(totalSteps / 5000) + 1;
};

// PUP Departments
export const PUP_DEPARTMENTS = [
  'College of Engineering',
  'College of Computer and Information Sciences',
  'College of Business Administration',
  'College of Education',
  'College of Science',
  'College of Social Sciences and Development',
  'College of Liberal Arts',
  'College of Architecture, Design and the Built Environment',
  'College of Tourism, Hospitality and Transportation Management',
  'College of Communication',
  'Other',
] as const;

export type Department = typeof PUP_DEPARTMENTS[number];

// Avatar rarities with colors
export const RARITY_COLORS = {
  common: '#9CA3AF', // gray
  rare: '#3B82F6', // blue
  epic: '#A855F7', // purple
  legendary: '#F59E0B', // gold
} as const;

// Challenge difficulty colors
export const DIFFICULTY_COLORS = {
  easy: '#10B981', // green
  medium: '#F59E0B', // yellow
  hard: '#EF4444', // red
} as const;

// Validate if running in browser
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};

// Get current geolocation
export const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
    } else {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    }
  });
};

// Get reward multiplier based on difficulty
export const getDifficultyMultiplier = (difficulty: 'easy' | 'medium' | 'hard'): number => {
  switch (difficulty) {
    case 'easy':
      return 1;
    case 'medium':
      return 1.5;
    case 'hard':
      return 2;
    default:
      return 1;
  }
};

// Format timestamp to readable date
export const formatDate = (timestamp: any): string => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

// Check if date is today
export const isToday = (timestamp: any): boolean => {
  if (!timestamp) return false;
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

// Calculate streak (consecutive days)
export const calculateStreak = (lastActive: any): number => {
  if (!lastActive) return 0;
  const lastDate = lastActive.toDate ? lastActive.toDate() : new Date(lastActive);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - lastDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= 1 ? 1 : 0; // Simple streak logic
};
