# ActiveCAMPUS GO

A gamified fitness platform that encourages university students to walk more around campus by tracking steps and rewarding them with Campus Energy (CE) points.

**Team:** 404 Brain Not Found

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

Required variables:
- Firebase credentials (see `BACKEND_SETUP.md`)
- Google Maps API key (see `QUICKSTART_MAPS.md`)

### 3. Setup Google Maps API
**This is required for map features!**

👉 **[Quick Setup Guide](QUICKSTART_MAPS.md)** (5 minutes)

Or detailed instructions: [GOOGLE_MAPS_SETUP.md](GOOGLE_MAPS_SETUP.md)

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 📖 Documentation

| Guide | Purpose |
|-------|---------|
| [QUICKSTART_MAPS.md](QUICKSTART_MAPS.md) | ⚡ 5-minute Google Maps setup |
| [GOOGLE_MAPS_SETUP.md](GOOGLE_MAPS_SETUP.md) | 📚 Detailed Maps API setup |
| [BACKEND_SETUP.md](BACKEND_SETUP.md) | 🔥 Firebase backend configuration |
| [LOCATION_TROUBLESHOOTING.md](LOCATION_TROUBLESHOOTING.md) | 🗺️ Fix location tracking issues |

---

## 🎮 Features

- **Step Tracking**: GPS-based step counting with Haversine formula
- **Campus Energy (CE)**: Currency earned from steps (100 steps = 1 CE)
- **Leveling System**: Progress through levels (5000 steps per level)
- **Interactive Map**: View PUP campus and track your location in real-time
- **Location-based Challenges**: Complete tasks at specific campus locations
- **Avatar Customization**: Unlock items with CE
- **Leaderboards**: Compete with other students
- **Achievements**: Earn badges for milestones

---

## 🗺️ Map Features

The integrated Google Maps shows:
- PUP Sta. Mesa campus location
- Real-time user location tracking
- Accuracy circle showing GPS precision
- Campus boundary (500m radius)
- Custom markers for challenges/events
- One-click center on location or campus

**Location Tracking Status:**
- 🟢 Green = Active tracking
- 🔴 Red = Tracking inactive

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.5 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Backend**: Firebase (Auth, Firestore, Analytics)
- **Maps**: Google Maps JavaScript API
- **Location**: Geolocation API

---

## 📁 Project Structure

```
activecampus-go/
├── app/
│   ├── (auth)/
│   │   └── login/          # Login page
│   ├── components/
│   │   ├── AuthProvider.tsx    # Auth context
│   │   └── MapComponent.tsx    # Google Maps component
│   ├── map/                # Map page with location tracking
│   ├── register/           # Registration page
│   ├── test/               # Firebase connection tests
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── lib/
│   ├── firebase.ts         # Firebase client initialization
│   ├── firestore.ts        # Database functions
│   ├── utils.ts            # Helper functions (CE, levels, distance)
│   └── validation.ts       # Security & input validation
├── .env                    # Environment variables (create from .env.example)
└── docs/                   # Setup guides
```

---

## 🔒 Security Features

- Input validation and sanitization
- Rate limiting (3 attempts per 5 minutes)
- Firebase Auth password encryption
- XSS prevention
- API key restrictions
- Firestore security rules

---

## 🧪 Testing

Visit the test page to verify Firebase connection:
```
http://localhost:3000/test
```

Tests include:
- ✅ Firebase initialization
- ✅ User creation/retrieval
- ✅ Step updates & CE calculation
- ✅ Leaderboard queries
- ✅ Challenge system
- ✅ Event management
- ✅ Achievement system
- ✅ Shop functionality

---

## 🚨 Common Issues

### "ApiNotActivatedMapError"
- **Cause**: Maps JavaScript API not enabled
- **Fix**: See [QUICKSTART_MAPS.md](QUICKSTART_MAPS.md)

### "GeolocationPositionError: Timeout"
- **Cause**: GPS signal too weak or taking too long
- **Fix**: See [LOCATION_TROUBLESHOOTING.md](LOCATION_TROUBLESHOOTING.md)
- Click the "🔄 Retry Location" button

### "Firebase Auth error"
- **Cause**: Authentication not enabled
- **Fix**: See [BACKEND_SETUP.md](BACKEND_SETUP.md)

---

## 🎯 MVP Scope

**Target School**: PUP (Polytechnic University of the Philippines)

**Core Features** (Current Implementation):
- ✅ User registration & login
- ✅ Step tracking with GPS
- ✅ Campus Energy (CE) system
- ✅ Level progression
- ✅ Interactive campus map
- ✅ Real-time location tracking

**Coming Soon**:
- Dashboard with step counter
- Challenge system UI
- Avatar customization shop
- Leaderboard display
- Achievement badges
- Push notifications

---

## 📊 Game Mechanics

### Campus Energy (CE)
- **Earn**: 100 steps = 1 CE
- **Use**: Purchase avatar items, unlock features

### Levels
- **Progress**: 5,000 steps per level
- **Rewards**: Unlock new avatar items and challenges

### Challenges
- **Types**: Distance, location-based, time-limited
- **Rewards**: Bonus CE, achievements, exclusive items

---

## 🌐 Deployment

### Prerequisites
- Node.js 18+ installed
- Firebase project configured
- Google Maps API key with billing enabled
- HTTPS domain (for production Geolocation API)

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

Make sure to add all `.env` variables to Vercel project settings!

---

## 📱 Progressive Web App (Future)

Planned PWA features:
- Offline step tracking
- Background sync
- Push notifications for challenges
- Install to home screen
- Service worker for caching

---

## 🤝 Contributing

This is a university project by Team 404 Brain Not Found.

---

## 📄 License

This project is developed for educational purposes.

---

## 👥 Team

**404 Brain Not Found**
- Building the future of campus fitness gamification! 🎮💪

---

## 📞 Support

Having issues? Check our documentation:

1. [Quick Maps Setup](QUICKSTART_MAPS.md) - 5-minute guide
2. [Detailed Maps Guide](GOOGLE_MAPS_SETUP.md) - Complete setup
3. [Location Issues](LOCATION_TROUBLESHOOTING.md) - Fix GPS problems
4. [Firebase Setup](BACKEND_SETUP.md) - Backend configuration

Still stuck? Check the browser console (F12) for specific error messages.

---

**Made with ❤️ by Team 404 Brain Not Found**
