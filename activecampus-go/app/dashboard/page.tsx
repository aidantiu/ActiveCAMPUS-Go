"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import MapComponent from '../components/MapComponent';

export default function DashboardPage() {
  const { user, userProfile, loading, signOut, refreshUserProfile } = useAuth();
  const router = useRouter();
  const [userStats, setUserStats] = useState({
    steps: 0,
    campusEnergy: 0,
    rank: "--",
  });

  // Update user stats from profile
  useEffect(() => {
    if (userProfile) {
      setUserStats({
        steps: userProfile.totalSteps || 0,
        campusEnergy: userProfile.campusEnergy || 0,
        rank: (userProfile as any).rank || "--",
      });
    }
  }, [userProfile]);

  // Show loading screen while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="h-screen flex relative">
      {/* FIXED BACKGROUND LAYER - This stays behind everything */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(/intro_bg.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* CONTENT LAYER - Everything sits on top with transparency */}
      <div className="relative z-10 flex w-full h-full">
        {/* Sidebar with NO background color */}
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header with semi-transparent background */}
          <header className="bg-white bg-opacity-70 backdrop-blur-md shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.displayName || user?.email}!</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Campus Energy</p>
                <p className="text-2xl font-bold text-blue-600">{userStats.campusEnergy} CE</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Steps Today</p>
                <p className="text-2xl font-bold text-green-600">{userStats.steps.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Campus Rank</p>
                <p className="text-2xl font-bold text-purple-600">#{userStats.rank}</p>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 relative overflow-hidden">
            <MapComponent 
              onLocationUpdate={(lat, lng) => {
                console.log('Location updated:', lat, lng);
              }}
              onChallengeComplete={async () => {
                await refreshUserProfile();
              }}
            />
          </main>
        </div>
      </div>
    </div>
  );
}