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
  department: string; // e.g., "Engineering", "Business", "Computer Science"
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
    department: userData.department || '',
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

export const getDepartmentLeaderboard = async (department: string, limitCount: number = 10) => {
  const usersRef = collection(db, 'users');
  const q = query(
    usersRef, 
    where('department', '==', department),
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
  
  if (challengeSnap.exists()) {
    const challenge = challengeSnap.data() as Challenge;
    
    if (!challenge.completedBy.includes(uid)) {
      // Add user to completedBy array
      await updateDoc(challengeRef, {
        completedBy: arrayUnion(uid)
      });
      
      // Award CE and badge to user
      const userRef = doc(db, 'users', uid);
      const user = await getUser(uid);
      
      if (user) {
        const newCampusEnergy = user.campusEnergy + challenge.reward;
        const newLevel = calculateLevel(user.totalSteps);
        
        const updateData: any = {
          campusEnergy: newCampusEnergy,
          level: newLevel,
          completedChallenges: arrayUnion(challengeId),
          lastActive: Timestamp.now(),
        };
        
        // Add badge if challenge awards one
        if (challenge.badgeReward) {
          updateData.badges = arrayUnion(challenge.badgeReward);
        }
        
        await updateDoc(userRef, updateData);
      }
      
      return { success: true, reward: challenge.reward };
    }
  }
  
  return { success: false, reward: 0 };
};

// Department Events
export interface DepartmentEvent {
  id: string;
  name: string;
  description: string;
  department?: string; // if null, it's campus-wide
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
