'use client';

import pup_bg from '../assets/pup_bg.svg';
import baseMale from '../assets/outfits/base_male.png';
import baseFemale from '../assets/outfits/base_female.png';
import pigtails from '../assets/outfits/pigtails.png';
import madame from '../assets/outfits/madame.png';
import malePUP from '../assets/outfits/male_PUPian.png';
import femalePUP from '../assets/outfits/female_PUPian.png';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';

interface Outfit {
  id: string;
  name: string;
  price: number;
  image: string;
  owned: boolean;
}

interface Character {
  currentOutfit: string;
  ownedOutfits: string[];
  campusEnergy: number;
}

const outfits: Outfit[] = [
  { id: 'casual', name: 'Basic Male', price: 100, image: baseMale.src, owned: true },
  { id: 'female', name: 'Basic Female', price: 100, image: baseFemale.src, owned: true },
  { id: 'pigtails', name: 'Schoolgirl', price: 200, image: pigtails.src, owned: false },
  { id: 'madame', name: 'Madame', price: 150, image: madame.src, owned: false },
  { id: 'male_pup', name: 'Male PUPian', price: 300, image: malePUP.src, owned: false },
  { id: 'female_pup', name: 'Female PUPian', price: 300, image: femalePUP.src, owned: false }
];

export default function CharacterCustomization() {
  const { user } = useAuth();
  const router = useRouter();
  const [character, setCharacter] = useState<Character>({
    currentOutfit: 'casual',
    ownedOutfits: ['casual', 'female'],
    campusEnergy: 0
  });
  const [selectedOutfit, setSelectedOutfit] = useState('casual');
  const [loading, setLoading] = useState(true);

  // responsive items per page
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const updateItemsPerPage = () => {
      const w = window.innerWidth;
      if (w < 640) setItemsPerPage(1); // mobile
      else if (w < 1024) setItemsPerPage(2); // tablet
      else setItemsPerPage(3); // desktop
      setCurrentPage(0); // reset page when breakpoint changes
    };
    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchCharacterData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCharacter({
            currentOutfit: userData.currentOutfit || 'casual',
            ownedOutfits: userData.ownedOutfits || ['casual', 'female'],
            campusEnergy: userData.campusEnergy || 0
          });
          setSelectedOutfit(userData.currentOutfit || 'casual');
        }
      } catch (error) {
        console.error('Error fetching character data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacterData();
  }, [user, router]);

  const purchaseOutfit = async (outfit: Outfit) => {
    if (!user) return;
    if (character.campusEnergy < outfit.price) {
      alert('Not enough Campus Energy!');
      return;
    }
    try {
      const newCE = character.campusEnergy - outfit.price;
      const newOwnedOutfits = [...new Set([...character.ownedOutfits, outfit.id])];
      await updateDoc(doc(db, 'users', user.uid), {
        campusEnergy: newCE,
        ownedOutfits: newOwnedOutfits
      });
      setCharacter(prev => ({ ...prev, campusEnergy: newCE, ownedOutfits: newOwnedOutfits }));
    } catch (error) {
      console.error('Error purchasing outfit:', error);
      alert('Failed to purchase outfit');
    }
  };

  const equipOutfit = async (outfitId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), { currentOutfit: outfitId });
      setCharacter(prev => ({ ...prev, currentOutfit: outfitId }));
      setSelectedOutfit(outfitId);
    } catch (error) {
      console.error('Error equipping outfit:', error);
      alert('Failed to equip outfit');
    }
  };

  // pagination based on itemsPerPage
  const totalPages = Math.max(1, Math.ceil(outfits.length / itemsPerPage));
  const startIndex = currentPage * itemsPerPage;
  const visibleOutfits = outfits.slice(startIndex, startIndex + itemsPerPage);

  const nextPage = () => setCurrentPage((p) => Math.min(totalPages - 1, p + 1));
  const prevPage = () => setCurrentPage((p) => Math.max(0, p - 1));

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div
      className="min-h-screen p-4 sm:p-8"
      style={{ backgroundImage: `url(${pup_bg.src})`, backgroundSize: 'cover', imageRendering: 'pixelated' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          {/* Preview */}
          <div className="lg:col-span-1 bg-white/5 rounded-lg p-6 backdrop-blur-sm border border-[#800000]/20">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">Your Character</h2>
            <div className="w-28 sm:w-40 md:w-56 lg:w-full mx-auto aspect-square bg-gray-800/50 rounded-lg flex items-center justify-center p-3">
              <Image
                src={outfits.find(o => o.id === selectedOutfit)?.image || baseMale.src}
                alt="Character Preview"
                width={400}
                height={400}
                className="pixelated w-full h-full object-contain"
                unoptimized
              />
            </div>
            <div className="mt-4 text-center text-white">
              <p className="text-sm">Campus Energy: <span className="font-semibold">{character.campusEnergy} CE</span></p>
              <p className="text-xs text-rose-200 mt-2">Current Outfit: <span className="font-medium">{character.currentOutfit}</span></p>
            </div>
            <div className="mt-4 flex gap-2">
              {/* Refresh and Profile buttons removed */}
            </div>
          </div>

          {/* Outfits / Carousel */}
          <div className="lg:col-span-2 bg-white/5 rounded-lg p-4 sm:p-6 backdrop-blur-sm border border-[#800000]/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-white">Available Outfits</h2>
              <div className="text-sm text-white/80">Page {currentPage + 1} / {totalPages}</div>
            </div>

            <div className="relative">
              {/* track: visible items */}
              <div className="overflow-hidden">
                <div
                  className="flex transition-all duration-400 ease-in-out"
                  style={{ gap: '0.5rem' }}
                >
                  {visibleOutfits.map((outfit) => (
                    <div
                      key={outfit.id}
                      className={`rounded-lg p-3 transition-all ${selectedOutfit === outfit.id ? 'ring-2 ring-[#ff8080]' : ''}`}
                      style={{ flex: `0 0 ${100 / itemsPerPage}%` }}
                    >
                      <div
                        className={`bg-[#800000]/20 rounded-md p-3 h-full flex flex-col justify-between cursor-pointer ${character.ownedOutfits.includes(outfit.id) ? 'hover:bg-[#800000]/30' : 'opacity-90'}`}
                        onClick={() => character.ownedOutfits.includes(outfit.id) && equipOutfit(outfit.id)}
                      >
                        <div className="flex items-center justify-center h-32 mb-3">
                          <Image
                            src={outfit.image}
                            alt={outfit.name}
                            width={160}
                            height={160}
                            className="pixelated object-contain"
                            unoptimized
                          />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{outfit.name}</h3>
                          <div className="text-xs text-[#ff8080] mb-2">CE Multiplier: 1.0x</div>
                          {!character.ownedOutfits.includes(outfit.id) ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); purchaseOutfit(outfit); }}
                              className="mt-2 w-full bg-[#800000] hover:bg-[#600000] text-white py-2 px-4 rounded-lg text-sm"
                            >
                              Buy ({outfit.price} CE)
                            </button>
                          ) : (
                            <p className="text-green-300 mt-2 text-sm">Owned</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nav controls (overlay on small screens, inline on large) */}
              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 0}
                  className="p-2 rounded-full bg-[#800000] hover:bg-[#600000] text-white transition-colors disabled:opacity-40"
                >
                  ←
                </button>

                {/* paging dots for mobile */}
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`w-2 h-2 rounded-full ${currentPage === i ? 'bg-[#ff8080]' : 'bg-white/30'}`}
                      aria-label={`Go to page ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages - 1}
                  className="p-2 rounded-full bg-[#800000] hover:bg-[#600000] text-white transition-colors disabled:opacity-40"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}