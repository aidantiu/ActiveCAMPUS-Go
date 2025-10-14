'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import Image from 'next/image';

export default function Sidebar() {
  const { signOut, user } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load sidebar state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ac_sidebar_open');
      if (saved !== null) {
        setSidebarOpen(saved === 'true');
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Persist sidebar state
  useEffect(() => {
    try {
      localStorage.setItem('ac_sidebar_open', sidebarOpen ? 'true' : 'false');
    } catch (e) {
      // ignore
    }
  }, [sidebarOpen]);

  return (
    <aside
      className={`bg-white border-r border-gray-200 z-20 transform transition-width duration-200 ease-in-out flex flex-col relative h-screen ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}
    >
      {/* Collapse button - positioned absolutely inside */}
      <button
        aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-2 right-2 z-30 p-1.5 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 transition-colors"
      >
        <svg
          className={`w-3 h-3 fill-gray-600 transform transition-transform ${sidebarOpen ? '' : 'rotate-180'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Logo header - now takes full space */}
      <div className="flex items-center justify-center px-1 py-3 border-b border-gray-100 bg-white">
        <Image 
          src="/icons/activecampus-logo.svg" 
          alt="ActiveCAMPUS" 
          width={sidebarOpen ? 220 : 40} 
          height={sidebarOpen ? 65 : 40}
          className="pixelated object-contain max-w-full max-h-full"
        />
      </div>

      <nav className="flex-1 overflow-auto p-2 space-y-1 text-gray-900">

        <button
          onClick={() => router.push('/dashboard')}
          className={`w-full text-left flex items-center gap-3 px-3 py-3 rounded-md hover:bg-gray-100 ${
            sidebarOpen ? '' : 'justify-center'
          }`}
        >
          <Image 
            src="/icons/map-icon.png" 
            alt="Map" 
            width={28} 
            height={28}
            className="pixelated"
          />
          <span className={`${sidebarOpen ? '' : 'hidden'} font-medium text-base`}>Map</span>
        </button>

        <button
          onClick={() => router.push('/leaderboard')}
          className={`w-full text-left flex items-center gap-3 px-3 py-3 rounded-md hover:bg-gray-100 ${
            sidebarOpen ? '' : 'justify-center'
          }`}
          onClick={() => router.push('/leaderboards')}
        >
          <Image 
            src="/icons/trophy-icon.png" 
            alt="Leaderboard" 
            width={28} 
            height={28}
            className="pixelated"
          />
          <span className={`${sidebarOpen ? '' : 'hidden'} font-medium text-base`}>Leaderboard</span>
        </button>

        <button
          className={`w-full text-left flex items-center gap-3 px-3 py-3 rounded-md hover:bg-gray-100 ${
            sidebarOpen ? '' : 'justify-center'
          }`}
          onClick={() => router.push('/character_customization')}
        >
          <Image 
            src="/icons/profile-icon.png" 
            alt="Profile" 
            width={32} 
            height={32}
            className="pixelated"
          />
          <span className={`${sidebarOpen ? '' : 'hidden'} font-medium text-base`}>Profile</span>
        </button>
      </nav>

      {/* Sign out at bottom */}
      <div className="border-t border-gray-100 p-2 bg-white">
        <button
          onClick={async () => {
            await signOut();
            router.push('/login');
          }}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-md text-sm text-red-600 hover:bg-red-50 ${
            sidebarOpen ? '' : 'justify-center'
          }`}
        >
          <Image 
            src="/icons/logout-icon.png" 
            alt="Sign Out" 
            width={24} 
            height={24}
            className="pixelated"
          />
          <span className={`${sidebarOpen ? '' : 'hidden'}`}>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}