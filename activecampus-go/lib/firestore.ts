// Reusable Firestore functions for ActiveCAMPUS GO
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  orderBy, 
  limit,
  where,
  Timestamp,
  arrayUnion 
} from 'firebase/firestore';
import { db } from './firebase';

// User Management
export interface User {
  uid: string;
  displayName: string;
  email: string;
  school: string; // e.g., "Polytechnic University of the Philippines"
  avatar: {
    base: string; // base avatar type
    accessories: string[]; // unlocked accessories
    currentOutfit: string[]; // equipped items
  };
  totalSteps: number;
  campusEnergy: number; // CE - the main currency
  level: number;
  achievements: string[]; // array of achievement IDs
  badges: string[]; // array of badge IDs
  completedChallenges: string[]; // array of challenge IDs
  createdAt: Timestamp;
  lastActive: Timestamp;
  dailySteps: number; // resets daily
  lastStepUpdate: Timestamp;
}

export const createUser = async (uid: string, userData: Partial<User>) => {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    uid,
    school: 'Polytechnic University of the Philippines', // Default to PUP for MVP
    avatar: {
      base: 'default',
      accessories: [],
      currentOutfit: []
    },
    totalSteps: 0,
    campusEnergy: 0,
    level: 1,
    achievements: [],
    badges: [],
    completedChallenges: [],
    dailySteps: 0,
    createdAt: Timestamp.now(),
    lastActive: Timestamp.now(),
    lastStepUpdate: Timestamp.now(),
    ...userData,
  });
};

export const getUser = async (uid: string): Promise<User | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data() as User;
  }
  return null;
};

export const updateUserSteps = async (uid: string, steps: number) => {
  const userRef = doc(db, 'users', uid);
  const user = await getUser(uid);
  
  if (user) {
    const newTotalSteps = user.totalSteps + steps;
    const newDailySteps = user.dailySteps + steps;
    const earnedCE = calculateCEFromSteps(steps);
    const newCampusEnergy = user.campusEnergy + earnedCE;
    const newLevel = calculateLevel(newTotalSteps);
    
    await updateDoc(userRef, {
      totalSteps: newTotalSteps,
      dailySteps: newDailySteps,
      campusEnergy: newCampusEnergy,
      level: newLevel,
      lastActive: Timestamp.now(),
      lastStepUpdate: Timestamp.now(),
    });
    
    return { earnedCE, newLevel };
  }
  return null;
};

// Leaderboard
export const getLeaderboard = async (limitCount: number = 10) => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy('campusEnergy', 'desc'), limit(limitCount));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => doc.data() as User);
};

export const getDepartmentLeaderboard = async (school: string, limitCount: number = 10) => {
  const usersRef = collection(db, 'users');
  const q = query(
    usersRef, 
    where('school', '==', school),
    orderBy('campusEnergy', 'desc'), 
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => doc.data() as User);
};

// Campus Map Challenges
export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'location' | 'steps' | 'event'; // different challenge types
  location?: {
    lat: number;
    lng: number;
    name: string; // e.g., "PUP Main Building", "Engineering Building"
  };
  radius?: number; // meters - for location-based challenges
  requiredSteps?: number; // for step-based challenges
  reward: number; // Campus Energy (CE) reward
  badgeReward?: string; // optional badge ID
  difficulty: 'easy' | 'medium' | 'hard';
  isActive: boolean;
  startDate?: Timestamp;
  endDate?: Timestamp;
  completedBy: string[]; // array of user IDs
  createdAt: Timestamp;
}

export const getChallenges = async () => {
  const challengesRef = collection(db, 'challenges');
  const querySnapshot = await getDocs(challengesRef);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Challenge[];
};

export const completeChallenge = async (challengeId: string, uid: string) => {
  const challengeRef = doc(db, 'challenges', challengeId);
  const challengeSnap = await getDoc(challengeRef);
  
  // Get user first to check if already completed
  const user = await getUser(uid);
  if (!user) {
    return { success: false, reward: 0 };
  }
  
  // Check if user already completed this challenge
  if (user.completedChallenges && user.completedChallenges.includes(challengeId)) {
    return { success: false, reward: 0 };
  }
  
  let challengeReward = 0;
  let badgeReward: string | undefined;
  
  if (challengeSnap.exists()) {
    const challenge = challengeSnap.data() as Challenge;
    challengeReward = challenge.reward;
    badgeReward = challenge.badgeReward;
    
    // Add user to completedBy array in challenge document
    await updateDoc(challengeRef, {
      completedBy: arrayUnion(uid)
    });
  } else {
    // If challenge doesn't exist in Firebase, we can still award points from the local definition
    // This allows for backwards compatibility and easier development
    console.warn(`Challenge ${challengeId} not found in Firebase, awarding default points`);
    // Default rewards based on challenge ID (you can customize this)
    const defaultRewards: Record<string, number> = {
      'lagoon': 50,
      'library': 30,
      'gym': 40
    };
    challengeReward = defaultRewards[challengeId] || 25;
  }
  
  // Award CE and badge to user
  const userRef = doc(db, 'users', uid);
  const newCampusEnergy = user.campusEnergy + challengeReward;
  const newLevel = calculateLevel(user.totalSteps);
  
  const updateData: any = {
    campusEnergy: newCampusEnergy,
    level: newLevel,
    completedChallenges: arrayUnion(challengeId),
    lastActive: Timestamp.now(),
  };
  
  // Add badge if challenge awards one
  if (badgeReward) {
    updateData.badges = arrayUnion(badgeReward);
  }
  
  await updateDoc(userRef, updateData);
  
  return { success: true, reward: challengeReward };
};

// Helper function to initialize default challenges in Firebase
export const initializeDefaultChallenges = async () => {
  const defaultChallenges = [
    {
      id: 'lagoon',
      name: 'Walk to the Lagoon',
      description: 'Walk to the campus lagoon to earn Campus Energy.',
      type: 'location' as const,
      location: {
        lat: 14.5998,
        lng: 121.0112,
        name: 'PUP Lagoon'
      },
      radius: 50,
      reward: 50,
      difficulty: 'easy' as const,
      isActive: true,
      completedBy: [],
      createdAt: Timestamp.now()
    },
    {
      id: 'library',
      name: 'Library Loop',
      description: 'Take a stroll around the main library.',
      type: 'location' as const,
      location: {
        lat: 14.5993,
        lng: 121.0099,
        name: 'PUP Main Library'
      },
      radius: 50,
      reward: 30,
      difficulty: 'easy' as const,
      isActive: true,
      completedBy: [],
      createdAt: Timestamp.now()
    },
    {
      id: 'gym',
      name: 'Gym Dash',
      description: 'Visit the campus gym to get a quick reward.',
      type: 'location' as const,
      location: {
        lat: 14.6000,
        lng: 121.0100,
        name: 'PUP Gymnasium'
      },
      radius: 50,
      reward: 40,
      difficulty: 'easy' as const,
      isActive: true,
      completedBy: [],
      createdAt: Timestamp.now()
    }
  ];

  for (const challenge of defaultChallenges) {
    const challengeRef = doc(db, 'challenges', challenge.id);
    const challengeSnap = await getDoc(challengeRef);
    
    if (!challengeSnap.exists()) {
      await setDoc(challengeRef, challenge);
      console.log(`Initialized challenge: ${challenge.id}`);
    }
  }
  
  return defaultChallenges.length;
};

// Department Events (now School Events)
export interface DepartmentEvent {
  id: string;
  name: string;
  description: string;
  school?: string; // if null, it's cross-school
  startDate: Timestamp;
  endDate: Timestamp;
  challenges: string[]; // array of challenge IDs
  participants: string[]; // array of user IDs
  prizes: {
    first: string;
    second: string;
    third: string;
  };
  isActive: boolean;
}

export const getActiveDepartmentEvents = async () => {
  const eventsRef = collection(db, 'events');
  const now = Timestamp.now();
  const q = query(
    eventsRef,
    where('isActive', '==', true),
    where('endDate', '>', now)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as DepartmentEvent[];
};

// Achievements & Badges
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: {
    type: 'steps' | 'challenges' | 'ce' | 'streak';
    value: number;
  };
  reward: number; // CE bonus
}

export const checkAndAwardAchievements = async (uid: string) => {
  const user = await getUser(uid);
  if (!user) return [];

  const achievementsRef = collection(db, 'achievements');
  const querySnapshot = await getDocs(achievementsRef);
  const allAchievements = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Achievement[];

  const newAchievements: Achievement[] = [];

  for (const achievement of allAchievements) {
    if (user.achievements.includes(achievement.id)) continue;

    let earned = false;
    switch (achievement.requirement.type) {
      case 'steps':
        earned = user.totalSteps >= achievement.requirement.value;
        break;
      case 'challenges':
        earned = user.completedChallenges.length >= achievement.requirement.value;
        break;
      case 'ce':
        earned = user.campusEnergy >= achievement.requirement.value;
        break;
    }

    if (earned) {
      newAchievements.push(achievement);
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        achievements: arrayUnion(achievement.id),
        campusEnergy: user.campusEnergy + achievement.reward,
      });
    }
  }

  return newAchievements;
};

// Utility functions
export const calculateCEFromSteps = (steps: number): number => {
  // Example: 100 steps = 1 CE
  return Math.floor(steps / 100);
};

export const calculateLevel = (totalSteps: number): number => {
  // Example: Every 5000 steps = 1 level
  return Math.floor(totalSteps / 5000) + 1;
};

// Avatar Shop Items
export interface ShopItem {
  id: string;
  name: string;
  type: 'accessory' | 'outfit' | 'base';
  cost: number; // Campus Energy cost
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requiredLevel?: number;
}

export const purchaseShopItem = async (uid: string, itemId: string) => {
  const itemRef = doc(db, 'shop', itemId);
  const itemSnap = await getDoc(itemRef);
  
  if (!itemSnap.exists()) return { success: false, message: 'Item not found' };
  
  const item = itemSnap.data() as ShopItem;
  const user = await getUser(uid);
  
  if (!user) return { success: false, message: 'User not found' };
  
  // Check if user has enough CE
  if (user.campusEnergy < item.cost) {
    return { success: false, message: 'Insufficient Campus Energy' };
  }
  
  // Check level requirement
  if (item.requiredLevel && user.level < item.requiredLevel) {
    return { success: false, message: 'Level requirement not met' };
  }
  
  // Purchase item
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    campusEnergy: user.campusEnergy - item.cost,
    [`avatar.accessories`]: arrayUnion(itemId),
  });
  
  return { success: true, message: 'Purchase successful!' };
};
