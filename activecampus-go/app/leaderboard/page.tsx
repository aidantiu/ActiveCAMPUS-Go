'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';

interface LeaderboardUser {
  uid: string;
  displayName: string;
  campusEnergy: number;
  completedChallenges: string[];
  totalSteps: number;
  level: number;
  school: string;
}

type FilterType = 'campusEnergy' | 'quests';

export default function LeaderboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [filteredLeaderboard, setFilteredLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<FilterType>('campusEnergy');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch leaderboard data directly from Firestore (client-side with auth)
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        
        // Import Firestore client SDK dynamically
        const { collection, query, orderBy, limit, getDocs } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        
        // Query users collection, ordered by campusEnergy
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('campusEnergy', 'desc'), limit(100));
        const querySnapshot = await getDocs(q);
        
        const users: LeaderboardUser[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          users.push({
            uid: data.uid || doc.id,
            displayName: data.displayName || 'Anonymous',
            campusEnergy: data.campusEnergy || 0,
            completedChallenges: data.completedChallenges || [],
            totalSteps: data.totalSteps || 0,
            level: data.level || 1,
            school: data.school || 'Unknown',
          });
        });
        
        setLeaderboard(users);
        setFilteredLeaderboard(users);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('An error occurred while fetching the leaderboard');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchLeaderboard();
    }
  }, [user]);

  // Apply filtering and sorting
  useEffect(() => {
    if (!leaderboard.length) return;

    let filtered = [...leaderboard];

    // Sort based on filter type
    if (filterType === 'campusEnergy') {
      filtered.sort((a, b) => b.campusEnergy - a.campusEnergy);
    } else if (filterType === 'quests') {
      filtered.sort((a, b) => {
        const aQuests = a.completedChallenges?.length || 0;
        const bQuests = b.completedChallenges?.length || 0;
        return bQuests - aQuests;
      });
    }

    setFilteredLeaderboard(filtered);
  }, [filterType, leaderboard]);

  const getRankMedal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-600';
    if (rank === 2) return 'text-gray-500';
    if (rank === 3) return 'text-orange-600';
    return 'text-gray-700';
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen flex bg-gray-50">
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                See how you rank against other players
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto w-full">
            {/* Filter Buttons */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Filter by:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterType('campusEnergy')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      filterType === 'campusEnergy'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ⚡ Campus Energy
                  </button>
                  <button
                    onClick={() => setFilterType('quests')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      filterType === 'quests'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🎯 Quests Completed
                  </button>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Leaderboard Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Player
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Campus Energy
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quests
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Steps
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLeaderboard.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          No players found
                        </td>
                      </tr>
                    ) : (
                      filteredLeaderboard.map((player, index) => {
                        const rank = index + 1;
                        const isCurrentUser = player.uid === user?.uid;
                        
                        return (
                          <tr
                            key={player.uid}
                            className={`${
                              isCurrentUser ? 'bg-blue-50' : ''
                            } hover:bg-gray-50 transition-colors`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-lg font-bold ${getRankColor(rank)}`}>
                                {getRankMedal(rank)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div>
                                  <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                    {player.displayName}
                                    {isCurrentUser && (
                                      <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                                        You
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500">{player.school}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-blue-600">
                                {player.campusEnergy} CE
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {player.completedChallenges?.length || 0} quests
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {player.totalSteps?.toLocaleString() || 0}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Stats Summary */}
            {user && filteredLeaderboard.length > 0 && (
              <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Stats</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {filteredLeaderboard.findIndex(p => p.uid === user.uid) + 1}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Your Rank</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {filteredLeaderboard.find(p => p.uid === user.uid)?.completedChallenges?.length || 0}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Quests Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {filteredLeaderboard.find(p => p.uid === user.uid)?.campusEnergy || 0}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Campus Energy</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

