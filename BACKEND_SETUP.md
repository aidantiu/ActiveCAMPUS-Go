# ActiveCAMPUS GO - Firebase Backend Setup

## 🎯 Project Overview
**ActiveCAMPUS GO** is a gamified fitness platform for PUP students that transforms campus walking into an engaging experience through step tracking, Campus Energy (CE), and location-based challenges.

## 📁 Backend Structure

### 1. Firebase Configuration (`lib/firebase.ts`)
- ✅ Initialized Firebase app with environment variables
- ✅ Exported Firebase Auth (`auth`)
- ✅ Exported Firestore database (`db`)
- ✅ Setup Analytics for browser only

### 2. Firestore Functions (`lib/firestore.ts`)
Core database operations for:

#### User Management
- `createUser()` - Create new user with department, avatar, steps, CE
- `getUser()` - Fetch user data
- `updateUserSteps()` - Update steps and award Campus Energy
- User schema includes:
  - Department (Engineering, CIS, Business, etc.)
  - Avatar customization (base, accessories, outfit)
  - Campus Energy (CE)
  - Total steps & daily steps
  - Achievements & badges
  - Completed challenges

#### Leaderboards
- `getLeaderboard()` - Global campus leaderboard by CE
- `getDepartmentLeaderboard()` - Department-specific rankings

#### Campus Map Challenges
- `getChallenges()` - Fetch all challenges
- `completeChallenge()` - Award CE and badges for completion
- Challenge types:
  - **Location-based**: Visit campus landmarks
  - **Step-based**: Reach step milestones
  - **Event-based**: Department-specific events

#### Department Events
- `getActiveDepartmentEvents()` - Fetch ongoing events (e.g., Engineering Month)
- Support for campus-wide and department-specific events

#### Achievements & Badges
- `checkAndAwardAchievements()` - Auto-award achievements based on:
  - Total steps
  - Challenges completed
  - Campus Energy earned
  - Activity streaks

#### Avatar Shop
- `purchaseShopItem()` - Buy avatar items with CE
- Item rarities: Common, Rare, Epic, Legendary
- Level requirements for special items

### 3. Utility Functions (`lib/utils.ts`)
Helper functions for:

#### Step & CE Calculations
- `calculateCEEarnings()` - 100 steps = 1 CE
- `calculateLevelProgress()` - Every 5000 steps = 1 level
- `formatSteps()` - Format numbers with commas
- `formatCE()` - Display CE currency

#### Location Services
- `calculateDistance()` - Haversine formula for GPS distance
- `isWithinRadius()` - Check if user is at challenge location
- `getCurrentLocation()` - Get user's geolocation

#### PUP-Specific
- `PUP_DEPARTMENTS` - List of all PUP colleges
- Department leaderboard support

#### Game Mechanics
- `DIFFICULTY_COLORS` - Color codes for easy/medium/hard
- `RARITY_COLORS` - Avatar item rarity colors
- `getDifficultyMultiplier()` - Challenge reward multipliers
- `calculateStreak()` - Track consecutive active days

#### Date/Time
- `formatDate()` - User-friendly date display
- `isToday()` - Check if timestamp is today
- Daily step reset logic

### 4. Firebase Admin SDK (`lib/firebase-admin.ts`)
- For server-side operations in API routes
- **Note**: Requires `firebase-admin` package installation
- Used for secure backend operations

## 🔑 Environment Variables (`.env`)
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

## 📊 Firestore Database Schema

### Collections

#### `users`
```
{
  uid: string
  displayName: string
  email: string
  department: string (e.g., "College of Engineering")
  avatar: {
    base: string
    accessories: string[]
    currentOutfit: string[]
  }
  totalSteps: number
  dailySteps: number
  campusEnergy: number (CE)
  level: number
  achievements: string[]
  badges: string[]
  completedChallenges: string[]
  createdAt: Timestamp
  lastActive: Timestamp
  lastStepUpdate: Timestamp
}
```

#### `challenges`
```
{
  id: string
  name: string
  description: string
  type: "location" | "steps" | "event"
  location?: { lat, lng, name }
  radius?: number (meters)
  requiredSteps?: number
  reward: number (CE)
  badgeReward?: string
  difficulty: "easy" | "medium" | "hard"
  isActive: boolean
  startDate?: Timestamp
  endDate?: Timestamp
  completedBy: string[] (user IDs)
}
```

#### `events`
```
{
  id: string
  name: string (e.g., "Engineering Month 2025")
  description: string
  department?: string (null = campus-wide)
  startDate: Timestamp
  endDate: Timestamp
  challenges: string[] (challenge IDs)
  participants: string[]
  prizes: { first, second, third }
  isActive: boolean
}
```

#### `achievements`
```
{
  id: string
  name: string
  description: string
  icon: string
  requirement: {
    type: "steps" | "challenges" | "ce" | "streak"
    value: number
  }
  reward: number (CE bonus)
}
```

#### `shop`
```
{
  id: string
  name: string
  type: "accessory" | "outfit" | "base"
  cost: number (CE)
  icon: string
  rarity: "common" | "rare" | "epic" | "legendary"
  requiredLevel?: number
}
```

## 🚀 Next Steps

1. **Install Firebase Admin** (for API routes):
   ```bash
   npm install firebase-admin
   ```

2. **Create API Routes**:
   - `app/api/steps/route.ts` - Handle step submissions
   - `app/api/leaderboard/route.ts` - Fetch leaderboard data
   - `app/api/auth/route.ts` - Custom auth endpoints

3. **Setup Firestore Security Rules** in Firebase Console

4. **Create sample data** in Firestore:
   - Add PUP campus challenges
   - Add avatar shop items
   - Add achievements

5. **Build Frontend Components**:
   - Dashboard with step counter
   - Campus map with challenges
   - Department leaderboards
   - Avatar customization
   - Achievement showcase

## 💡 Key Features Aligned with Project Concept

✅ **Step-Based Currency (Campus Energy)** - Implemented  
✅ **Avatar Customization & Progression** - Schema ready  
✅ **Campus Map Challenges** - Location-based system ready  
✅ **Department Events & Leaderboards** - Fully supported  
✅ **Achievements & Badges** - Auto-award system implemented  

## 🎓 PUP-Specific Features

- 11 PUP colleges/departments supported
- Department vs. Department competitions
- Event system for celebrations (Engineering Month, etc.)
- Campus landmark challenges (Main Building, Engineering Building, etc.)

---

**Team**: 404 Brain Not Found  
**Project**: ActiveCAMPUS GO - PUP Digital Bayanihan 2025
