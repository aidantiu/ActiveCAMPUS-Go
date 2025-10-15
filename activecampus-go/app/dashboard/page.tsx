"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { getUserRank } from '@/lib/firestore';
import Sidebar from '../components/Sidebar';
import MapComponent from '../components/MapComponent';
import LeaderboardsPage from '../leaderboards/page'; // local import of the page component
import ProfilePage from '../character_customization/page';

export default function DashboardPage() {
  const { user, userProfile, loading, signOut, refreshUserProfile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams?.get('view') || 'map';
  const [userStats, setUserStats] = useState({
    steps: 0,
    campusEnergy: 0,
    rank: "--",
  });

  // mobile header toggle
  const [mobileHeaderOpen, setMobileHeaderOpen] = useState(true);
  
  // Update user stats from profile
  useEffect(() => {
    if (userProfile) {
      setUserStats(prevStats => ({
        ...prevStats,
        steps: userProfile.dailySteps || 0, // Changed from totalSteps to dailySteps
        campusEnergy: userProfile.campusEnergy || 0,
      }));
    }
  }, [userProfile]);

  // Fetch user rank separately
  useEffect(() => {
    const fetchUserRank = async () => {
      if (user) {
        try {
          const rank = await getUserRank(user.uid);
          setUserStats(prevStats => ({
            ...prevStats,
            rank: rank ? rank.toString() : "--",
          }));
        } catch (error) {
          console.error('Error fetching user rank:', error);
          setUserStats(prevStats => ({
            ...prevStats,
            rank: "--",
          }));
        }
      }
    };

    fetchUserRank();
  }, [user]);

  // Show loading screen while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-950 via-maroon-900 to-red-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rose-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-rose-200">Loading...</p>
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
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/intro_bg.svg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-rose-950/80 via-red-950/75 to-maroon-950/80" />
      </div>

      <div className="relative z-10 flex w-full h-full">
        {/* Sidebar hidden on small screens */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        <div className="flex-1 flex flex-col">
          {/* Mobile compact top navigation */}
          <div className="md:hidden bg-white/5 backdrop-blur-sm border-b border-white/10 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className={`px-3 py-1 rounded-md text-white text-sm ${view === 'map' ? 'bg-white/10' : 'hover:bg-white/5'}`}
              >
                🗺️ Map
              </button>
              <button
                onClick={() => router.push('/dashboard?view=leaderboards')}
                className={`ml-2 px-3 py-1 rounded-md text-white text-sm ${view === 'leaderboards' ? 'bg-white/10' : 'hover:bg-white/5'}`}
              >
                🏆 LB
              </button>
              <button
                onClick={() => router.push('/dashboard?view=profile')}
                className={`ml-2 px-3 py-1 rounded-md text-white text-sm ${view === 'profile' ? 'bg-white/10' : 'hover:bg-white/5'}`}
              >
                👤 Profile
              </button>
            </div>

            {/* toggle header button */}
            <div className="flex items-center gap-3">
              <div className="text-sm text-rose-200 hidden sm:block">CE: <span className="font-semibold text-white">{userStats.campusEnergy}</span></div>
              <button
                onClick={() => setMobileHeaderOpen(v => !v)}
                aria-label="Toggle header"
                className="ml-2 px-2 py-1 rounded-md bg-white/6 hover:bg-white/10 text-white"
              >
                {mobileHeaderOpen ? '▲' : '▼'}
              </button>
            </div>
          </div>

          {/* Enhanced Header with responsive stacking */}
          <header className={`${mobileHeaderOpen ? 'block' : 'hidden'} md:block bg-white/10 backdrop-blur-xl shadow-2xl border-b border-white/20 px-4 md:px-8 py-3 transition-all duration-200`}>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Dashboard</h1>
                <p className="text-rose-200 text-sm md:text-lg">
                  Welcome back, <span className="font-semibold text-white">{userProfile?.displayName || user?.email}</span>!
                </p>
              </div>

              {/* Stats Cards - stack on mobile, row on md+ */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-stretch">
                <div className="w-full sm:w-auto bg-gradient-to-br from-amber-500/20 to-orange-600/20 backdrop-blur-lg rounded-2xl px-4 py-3 border border-amber-400/30 shadow-xl min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-amber-200 uppercase tracking-wider">Campus Energy</p>
                      <p className="text-xl md:text-2xl font-bold text-white">{userStats.campusEnergy}</p>
                      <p className="text-xs text-amber-200 mt-1">CE Points</p>
                    </div>
                    <div className="hidden sm:flex items-center">
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse ml-4" />
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-auto bg-gradient-to-br from-emerald-500/20 to-green-600/20 backdrop-blur-lg rounded-2xl px-4 py-3 border border-emerald-400/30 shadow-xl min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">Steps Today</p>
                      <p className="text-xl md:text-2xl font-bold text-white">{userStats.steps.toLocaleString()}</p>
                      <p className="text-xs text-emerald-200 mt-1">Daily Count</p>
                    </div>
                    <div className="hidden sm:flex items-center">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse ml-4" />
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-auto bg-gradient-to-br from-violet-500/20 to-purple-600/20 backdrop-blur-lg rounded-2xl px-4 py-3 border border-violet-400/30 shadow-xl min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-violet-200 uppercase tracking-wider">Campus Rank</p>
                      <p className="text-xl md:text-2xl font-bold text-white">#{userStats.rank}</p>
                      <p className="text-xs text-violet-200 mt-1">Leaderboard</p>
                    </div>
                    <div className="hidden sm:flex items-center">
                      <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse ml-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content with subtle frame */}
          <main className="flex-1 relative overflow-hidden p-3 md:p-6">
            <div className="h-full bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
              {/* Conditional render: leaderboards, profile or map */}
              {view === 'leaderboards' ? (
                <LeaderboardsPage />
              ) : view === 'profile' ? (
                <ProfilePage />
              ) : (
                <MapComponent
                  onLocationUpdate={(lat, lng) => {
                    console.log('Location updated:', lat, lng);
                  }}
                  onChallengeComplete={async () => {
                    await refreshUserProfile();
                    if (user) {
                      try {
                        const rank = await getUserRank(user.uid);
                        setUserStats(prevStats => ({
                          ...prevStats,
                          rank: rank ? rank.toString() : "--",
                        }));
                      } catch (error) {
                        console.error('Error refreshing user rank:', error);
                      }
                    }
                  }}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}