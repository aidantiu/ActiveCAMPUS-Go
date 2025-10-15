'use client';

import pup_bg from '../assets/pup_bg.svg';
import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface LeaderboardEntry {
  id: string;
  displayName: string;
  campusEnergy: number;
  level: number;
  rank?: number;
}

export default function LeaderboardsPage() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(
          collection(db, 'users'),
          orderBy('campusEnergy', 'desc'),
          limit(5)
        );

        const querySnapshot = await getDocs(q);
        const entries: LeaderboardEntry[] = [];

        // Explicitly assign rank starting from 1
        let currentRank = 1;
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          entries.push({
            id: doc.id,
            displayName: data.displayName || 'Anonymous User',
            campusEnergy: data.campusEnergy || 0,
            level: Math.floor((data.totalSteps || 0) / 5000) + 1,
            rank: currentRank++ // Increment rank for each entry
          });
        });

        setLeaderboard(entries);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#800000] to-[#400000] flex items-center justify-center">
        <div className="text-white text-xl">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8"
    style={{ backgroundImage: `url(${pup_bg.src})`,
    backgroundSize: "cover", }}>
      <div className="max-w-4xl mx-auto">

        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Campus Energy Leaderboard 🏆
        </h1>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-[#800000]/20 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 p-5 border-b border-[#800000]/20 text-white font-semibold">
            <div className="col-span-2 text-center">Rank</div>
            <div className="col-span-5">Name</div>
            <div className="col-span-3 text-right">CE</div>
            <div className="col-span-2 text-right">Level</div>
          </div>

          {/* Leaderboard Entries */}
          {leaderboard.map((entry) => (
            <div
              key={entry.id}
              className="grid grid-cols-12 gap-2 p-5 border-b border-[#800000]/20 text-white hover:bg-white/5 transition-colors"
            >
              {/* Rank with medal for top 3 */}
              <div className="col-span-2 text-center font-semibold">
                {entry.rank === 1 ? '🥇 1' : 
                 entry.rank === 2 ? '🥈 2' : 
                 entry.rank === 3 ? '🥉 3' : 
                 entry.rank}
              </div>

              {/* Name */}
              <div className="col-span-5 truncate">{entry.displayName}</div>

              {/* CE Amount */}
              <div className="col-span-3 text-right font-mono">
                {entry.campusEnergy.toLocaleString()} CE
              </div>

              {/* Level */}
              <div className="col-span-2 text-right">
                Lvl {entry.level}
              </div>
            </div>
          ))}

          {leaderboard.length === 0 && (
            <div className="p-8 text-center text-white">
              No entries found. Start walking to earn CE!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}