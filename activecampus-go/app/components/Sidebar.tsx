'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

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
      className={`bg-white border-r border-gray-200 z-20 transform transition-width duration-200 ease-in-out flex flex-col ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}
    >
      <div className="flex items-center justify-between px-3 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className={`text-2xl ${sidebarOpen ? '' : 'hidden'}`}>🔥</span>
          <h2 className={`font-bold text-indigo-600 text-lg ${sidebarOpen ? '' : 'hidden'}`}>
            ActiveCAMPUS
          </h2>
        </div>

        <button
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          onClick={() => setSidebarOpen((s) => !s)}
          className="p-1 rounded-md hover:bg-gray-100"
        >
          <svg
            className={`w-5 h-5 fill-black transform transition-transform ${sidebarOpen ? '' : 'rotate-180'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 overflow-auto p-2 space-y-1 text-gray-900">
        <button
          className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 ${
            sidebarOpen ? '' : 'justify-center'
          }`}
        >
          <span className="text-2xl">🗺️</span>
          <span className={`${sidebarOpen ? '' : 'hidden'} font-medium`}>Map</span>
        </button>

        <button
          className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 ${
            sidebarOpen ? '' : 'justify-center'
          }`}
        >
          <span className="text-2xl">🏆</span>
          <span className={`${sidebarOpen ? '' : 'hidden'} font-medium`}>Leaderboard</span>
        </button>

        <button
          className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 ${
            sidebarOpen ? '' : 'justify-center'
          }`}
        >
          <span className="text-2xl">👤</span>
          <span className={`${sidebarOpen ? '' : 'hidden'} font-medium`}>Profile</span>
        </button>

        <button
          className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 ${
            sidebarOpen ? '' : 'justify-center'
          }`}
        >
          <span className="text-2xl">⚙️</span>
          <span className={`${sidebarOpen ? '' : 'hidden'} font-medium`}>Settings</span>
        </button>

        {/* Quick actions */}
        <div className="mt-4 border-t border-gray-100 pt-3 px-3">
          <button
            onClick={async () => {
              await signOut();
              router.push('/login');
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50 ${
              sidebarOpen ? '' : 'justify-center'
            }`}
          >
            <span className="text-xl">⎋</span>
            <span className={`${sidebarOpen ? '' : 'hidden'}`}>Sign Out</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
