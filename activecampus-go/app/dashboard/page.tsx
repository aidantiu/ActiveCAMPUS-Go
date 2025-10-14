"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../components/AuthProvider";
import { useRouter } from "next/navigation";
import MapComponent from "../components/MapComponent";
import Sidebar from "../components/Sidebar";

export default function DashboardPage() {
  const { user, userProfile, loading, signOut, refreshUserProfile } = useAuth();
  const router = useRouter();
  const [userStats, setUserStats] = useState({
    steps: 0,
    campusEnergy: 0,
    rank: "--",
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load sidebar state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ac_sidebar_open");
      if (saved !== null) {
        setSidebarOpen(saved === "true");
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Persist sidebar state
  useEffect(() => {
    try {
      localStorage.setItem("ac_sidebar_open", sidebarOpen ? "true" : "false");
    } catch (e) {
      // ignore
    }
  }, [sidebarOpen]);

  // Update user stats from profile
  useEffect(() => {
    if (userProfile) {
      setUserStats({
        steps: userProfile.totalSteps,
        campusEnergy: userProfile.campusEnergy,
        rank: "--", // Calculate rank later if needed
      });
    }
  }, [userProfile]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Location update handler
  const handleLocationUpdate = (lat: number, lng: number) => {
    // TODO: Update user location in Firestore
    // TODO: Calculate steps based on distance
    console.log('Location updated:', { lat, lng });
  };

  // Challenge complete handler
  const handleChallengeComplete = async () => {
    await refreshUserProfile();
    console.log('Challenge completed - profile refreshed in dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Header removed per request - content continues below */}

        {/* Content (Map) */}
        <main className="flex-1 relative overflow-hidden">
          <MapComponent 
            onLocationUpdate={handleLocationUpdate}
            onChallengeComplete={handleChallengeComplete}
          />
        </main>

        {/* Bottom navigation removed per request */}
      </div>
    </div>
  );
}
