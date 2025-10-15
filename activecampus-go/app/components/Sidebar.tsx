'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from './AuthProvider';
import Image from 'next/image';

export default function Sidebar() {
  const { signOut, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const view = searchParams?.get('view') || 'map';

  const isDashboard = pathname === '/dashboard';
  const isMap = pathname === '/dashboard' && (view === 'map' || !searchParams?.get('view'));
  const isLeaderboards = pathname === '/dashboard' && view === 'leaderboards';

  useEffect(() => {
    // Sidebar state managed in memory only
  }, []);

  useEffect(() => {
    // Sidebar state managed in memory only
  }, [sidebarOpen]);

  return (
    <aside
      className={`border-r border-white/20 transform transition-all duration-300 ease-in-out flex flex-col relative h-screen ${
        sidebarOpen ? 'w-64' : 'w-16'
      } ${isDashboard ? 'bg-gradient-to-b from-rose-950/40 via-red-950/30 to-maroon-950/40 backdrop-blur-xl' : 'bg-gradient-to-b from-rose-950 via-red-950 to-maroon-950'}`}
    >
      {/* Logo header with collapse button overlay */}
      <div className={`relative flex items-center justify-center px-1 py-6 border-b border-white/20 ${
        isDashboard ? 'bg-white/5 backdrop-blur-md' : 'bg-black/20'
      }`}>
        <Image 
          src="/icons/activecampus-logo.svg"  
          alt="ActiveCAMPUS" 
          width={sidebarOpen ? 200 : 40} 
          height={sidebarOpen ? 48 : 40}
          className="pixelated object-contain max-w-full max-h-full transition-all duration-300"
        />
        
        {/* Collapse button - positioned absolutely on top right */}
        <button
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-2 right-2 p-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg hover:bg-white/20 transition-all hover:scale-110"
        >
          <svg
            className={`w-3.5 h-3.5 text-rose-200 transform transition-transform duration-300 ${sidebarOpen ? '' : 'rotate-180'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 overflow-auto p-3 space-y-2">
        <button
          onClick={() => router.push('/dashboard')}
          className={`w-full flex items-center rounded-xl transition-all duration-200 group ${
            isMap
              ? 'bg-white/20 backdrop-blur-md border border-white/30 shadow-lg'
              : 'hover:bg-white/10 border border-transparent hover:border-white/20'
          } ${sidebarOpen ? 'gap-3 px-4 py-3.5 text-left' : 'justify-center p-3'}`}
        >
          <div className={`${sidebarOpen ? 'p-1.5' : 'p-0'} rounded-lg ${isMap ? 'bg-rose-400/20' : 'group-hover:bg-white/10'} transition-colors flex items-center justify-center`}>
            <Image 
              src="/icons/map-icon.png" 
              alt="Map" 
              width={32} 
              height={32}
              className="pixelated"
              unoptimized
            />
          </div>
          {sidebarOpen && <span className="font-semibold text-base text-white">Map</span>}
        </button>

        <button
          onClick={() => router.push('/dashboard?view=leaderboards')}
          className={`w-full flex items-center rounded-xl transition-all duration-200 group ${
            isLeaderboards
              ? 'bg-white/20 backdrop-blur-md border border-white/30 shadow-lg'
              : 'hover:bg-white/10 border border-transparent hover:border-white/20'
          } ${sidebarOpen ? 'gap-3 px-4 py-3.5 text-left' : 'justify-center p-3'}`}
        >
          <div className={`${sidebarOpen ? 'p-1.5' : 'p-0'} rounded-lg ${isLeaderboards ? 'bg-amber-400/20' : 'group-hover:bg-white/10'} transition-colors flex items-center justify-center`}>
            <Image 
              src="/icons/trophy-icon.png" 
              alt="Leaderboard" 
              width={30} 
              height={30}
              className="pixelated"
              unoptimized
            />
          </div>
          {sidebarOpen && <span className="font-semibold text-base text-white">Leaderboard</span>}
        </button>

        <button
          className={`w-full flex items-center rounded-xl transition-all duration-200 group ${
            pathname === '/character_customization' 
              ? 'bg-white/20 backdrop-blur-md border border-white/30 shadow-lg' 
              : 'hover:bg-white/10 border border-transparent hover:border-white/20'
          } ${sidebarOpen ? 'gap-3 px-4 py-3.5 text-left' : 'justify-center p-3'}`}
          onClick={() => router.push('/dashboard?view=profile')}
        >
          <div className={`${sidebarOpen ? 'p-1.5' : 'p-0'} rounded-lg ${pathname === '/character_customization' ? 'bg-violet-400/20' : 'group-hover:bg-white/10'} transition-colors flex items-center justify-center`}>
            <Image 
              src="/icons/profile-icon.png" 
              alt="Profile" 
              width={32} 
              height={32}
              className="pixelated"
              unoptimized
            />
          </div>
          {sidebarOpen && <span className="font-semibold text-base text-white">Profile</span>}
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
          className={`w-full flex items-center rounded-xl transition-all duration-200 group border border-transparent ${
            isDashboard 
              ? 'hover:bg-red-500/20 hover:border-red-400/30' 
              : 'hover:bg-red-500/20 hover:border-red-400/30'
          } ${sidebarOpen ? 'gap-3 px-4 py-3.5 text-left' : 'justify-center p-3'}`}
        >
          <div className={`${sidebarOpen ? 'p-1.5' : 'p-0'} rounded-lg group-hover:bg-red-400/20 transition-colors flex items-center justify-center`}>
            <Image 
              src="/icons/logout-icon.png" 
              alt="Sign Out" 
              width={26} 
              height={26}
              className="pixelated"
              unoptimized
            />
          </div>
          {sidebarOpen && <span className="font-semibold text-white">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}