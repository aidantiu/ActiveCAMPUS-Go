// Server-side Firestore functions using Firebase Admin SDK
// Use this ONLY in API routes (app/api/*) - never in client components
import { adminDb } from './firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { calculateLevel, calculateCEFromSteps } from './utils';

// Re-export the Challenge interface
export interface Challenge {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  reward: number; // Campus Energy (CE) reward
  badgeReward?: string; // Optional badge ID
  completedBy: string[]; // Array of user UIDs who completed this challenge
  createdAt: Timestamp;
}

// User interface (server version)
export interface User {
  uid: string;
  displayName: string;
  email: string;
  school: string;
  avatar: {
    base: string;
    accessories: string[];
    currentOutfit: string[];
  };
  totalSteps: number;
  campusEnergy: number;
  level: number;
  achievements: string[];
  badges: string[];
  completedChallenges: string[];
  createdAt: Timestamp;
  lastActive: Timestamp;
  dailySteps: number;
  lastStepUpdate: Timestamp;
}

export const getUser = async (uid: string): Promise<User | null> => {
  const userRef = adminDb.doc(`users/${uid}`);
  const userSnap = await userRef.get();
  return userSnap.exists ? (userSnap.data() as User) : null;
};

export const completeChallenge = async (challengeId: string, uid: string) => {
  const challengeRef = adminDb.doc(`challenges/${challengeId}`);
  const challengeSnap = await challengeRef.get();

  if (challengeSnap.exists) {
    const challenge = challengeSnap.data() as Challenge;

    if (!challenge.completedBy.includes(uid)) {
      // Add user to completedBy array
      await challengeRef.update({
        completedBy: FieldValue.arrayUnion(uid)
      });

      // Award CE and badge to user
      const userRef = adminDb.doc(`users/${uid}`);
      const user = await getUser(uid);

      if (user) {
        const newCampusEnergy = user.campusEnergy + challenge.reward;
        const newLevel = calculateLevel(user.totalSteps);

        const updateData: any = {
          campusEnergy: newCampusEnergy,
          level: newLevel,
          completedChallenges: FieldValue.arrayUnion(challengeId),
          lastActive: Timestamp.now(),
        };

        // Add badge if challenge awards one
        if (challenge.badgeReward) {
          updateData.badges = FieldValue.arrayUnion(challenge.badgeReward);
        }

        await userRef.update(updateData);
      }

      return { success: true, reward: challenge.reward };
    }
  }

  return { success: false, reward: 0 };
};

export const updateUserSteps = async (uid: string, steps: number) => {
  const userRef = adminDb.doc(`users/${uid}`);
  const user = await getUser(uid);
  
  if (user) {
    const newTotalSteps = user.totalSteps + steps;
    const newDailySteps = user.dailySteps + steps;
    const earnedCE = calculateCEFromSteps(steps);
    const newCampusEnergy = user.campusEnergy + earnedCE;
    const newLevel = calculateLevel(newTotalSteps);
    
    await userRef.update({
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

// Leaderboard (server-side with Admin SDK)
export const getLeaderboard = async (limitCount: number = 50) => {
  try {
    const usersRef = adminDb.collection('users');
    const snapshot = await usersRef
      .orderBy('campusEnergy', 'desc')
      .limit(limitCount)
      .get();
    
    const users: User[] = [];
    snapshot.forEach(doc => {
      users.push(doc.data() as User);
    });
    
    return users;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
};