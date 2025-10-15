'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import Image from 'next/image';

export default function Sidebar() {
  const { signOut, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Check if we're on the dashboard page
  const isDashboard = pathname === '/dashboard';

  // Load sidebar state - DO NOT use localStorage in artifacts
  useEffect(() => {
    // Sidebar state managed in memory only
  }, []);

  // Persist sidebar state - DO NOT use localStorage in artifacts
  useEffect(() => {
    // Sidebar state managed in memory only
  }, [sidebarOpen]);

  return (
    <aside
      className={`border-r border-white/20 transform transition-all duration-300 ease-in-out flex flex-col relative h-screen ${
        sidebarOpen ? 'w-64' : 'w-16'
      } ${isDashboard ? 'bg-gradient-to-b from-rose-950/40 via-red-950/30 to-maroon-950/40 backdrop-blur-xl' : 'bg-gradient-to-b from-rose-950 via-red-950 to-maroon-950'}`}
    >
      {/* Collapse button */}
      <button
        aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-3 right-3 z-30 p-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg hover:bg-white/20 transition-all hover:scale-110"
      >
        <svg
          className={`w-4 h-4 text-rose-200 transform transition-transform duration-300 ${sidebarOpen ? '' : 'rotate-180'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Logo header */}
      <div className={`flex items-center justify-center px-1 py-4 border-b border-white/20 ${
        isDashboard ? 'bg-white/5 backdrop-blur-md' : 'bg-black/20'
      }`}>
        <Image 
          src="/icons/activecampus-logo.svg"  
          alt="ActiveCAMPUS" 
          width={sidebarOpen ? 126 : 40} 
          height={sidebarOpen ? 30 : 40}
          className="pixelated object-contain max-w-full max-h-full transition-all duration-300"
        />
      </div>

      <nav className="flex-1 overflow-auto p-3 space-y-2">
        <button
          onClick={() => router.push('/dashboard')}
          className={`w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
            pathname === '/dashboard' 
              ? 'bg-white/20 backdrop-blur-md border border-white/30 shadow-lg' 
              : 'hover:bg-white/10 border border-transparent hover:border-white/20'
          } ${sidebarOpen ? '' : 'justify-center'}`}
        >
          <div className={`p-1.5 rounded-lg ${pathname === '/dashboard' ? 'bg-rose-400/20' : 'group-hover:bg-white/10'} transition-colors`}>
            <Image 
              src="/icons/map-icon.png" 
              alt="Map" 
              width={24} 
              height={24}
              className="pixelated"
            />
          </div>
          <span className={`${sidebarOpen ? '' : 'hidden'} font-semibold text-base text-white`}>Map</span>
        </button>

        <button
          onClick={() => router.push('/leaderboards')}
          className={`w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
            pathname === '/leaderboards' 
              ? 'bg-white/20 backdrop-blur-md border border-white/30 shadow-lg' 
              : 'hover:bg-white/10 border border-transparent hover:border-white/20'
          } ${sidebarOpen ? '' : 'justify-center'}`}
        >
          <div className={`p-1.5 rounded-lg ${pathname === '/leaderboards' ? 'bg-amber-400/20' : 'group-hover:bg-white/10'} transition-colors`}>
            <Image 
              src="/icons/trophy-icon.png" 
              alt="Leaderboard" 
              width={24} 
              height={24}
              className="pixelated"
            />
          </div>
          <span className={`${sidebarOpen ? '' : 'hidden'} font-semibold text-base text-white`}>Leaderboard</span>
        </button>

        <button
          className={`w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
            pathname === '/character_customization' 
              ? 'bg-white/20 backdrop-blur-md border border-white/30 shadow-lg' 
              : 'hover:bg-white/10 border border-transparent hover:border-white/20'
          } ${sidebarOpen ? '' : 'justify-center'}`}
          onClick={() => router.push('/character_customization')}
        >
          <div className={`p-1.5 rounded-lg ${pathname === '/character_customization' ? 'bg-violet-400/20' : 'group-hover:bg-white/10'} transition-colors`}>
            <Image 
              src="/icons/profile-icon.png" 
              alt="Profile" 
              width={28} 
              height={28}
              className="pixelated"
            />
          </div>
          <span className={`${sidebarOpen ? '' : 'hidden'} font-semibold text-base text-white`}>Profile</span>
        </button>
      </nav>

      {/* Sign out at bottom */}
      <div className={`border-t border-white/20 p-3 ${
        isDashboard ? 'bg-white/5 backdrop-blur-md' : 'bg-black/20'
      }`}>
        <button
          onClick={async () => {
            await signOut();
            router.push('/login');
          }}
          className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group border border-transparent ${
            isDashboard 
              ? 'hover:bg-red-500/20 hover:border-red-400/30' 
              : 'hover:bg-red-500/20 hover:border-red-400/30'
          } ${sidebarOpen ? '' : 'justify-center'}`}
        >
          <div className="p-1.5 rounded-lg group-hover:bg-red-400/20 transition-colors">
            <Image 
              src="/icons/logout-icon.png" 
              alt="Sign Out" 
              width={22} 
              height={22}
              className="pixelated"
            />
          </div>
          <span className={`${sidebarOpen ? '' : 'hidden'} font-semibold text-white`}>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}