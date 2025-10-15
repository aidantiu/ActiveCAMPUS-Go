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
  {
    id: 'casual',
    name: 'Basic Male',
    price: 100,
    image: baseMale.src,
    owned: true
  },
  {
    id: 'female',
    name: 'Basic Female',
    price: 100,
    image: baseFemale.src,
    owned: true
  },
  {
    id: 'pigtails',
    name: 'Schoolgirl',
    price: 200,
    image: pigtails.src,
    owned: false
  },
  {
    id: 'madame',
    name: 'Madame',
    price: 150,
    image: madame.src,
    owned: false
  },
  {
    id: 'male_pup',
    name: 'Male PUPian',
    price: 300,
    image: malePUP.src,
    owned: false
  },
  {
    id: 'female_pup',
    name: 'Female PUPian',
    price: 300,
    image: femalePUP.src,
    owned: false
  }
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
  const itemsPerPage = 3;
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
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
        setLoading(false);
      } catch (error) {
        console.error('Error fetching character data:', error);
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
      const newOwnedOutfits = [...character.ownedOutfits, outfit.id];

      await updateDoc(doc(db, 'users', user.uid), {
        campusEnergy: newCE,
        ownedOutfits: newOwnedOutfits
      });

      setCharacter(prev => ({
        ...prev,
        campusEnergy: newCE,
        ownedOutfits: newOwnedOutfits
      }));
    } catch (error) {
      console.error('Error purchasing outfit:', error);
      alert('Failed to purchase outfit');
    }
  };

  const equipOutfit = async (outfitId: string) => {
    if (!user) return;

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        currentOutfit: outfitId
      });

      setCharacter(prev => ({
        ...prev,
        currentOutfit: outfitId
      }));
      setSelectedOutfit(outfitId);
    } catch (error) {
      console.error('Error equipping outfit:', error);
      alert('Failed to equip outfit');
    }
  };

  const totalPages = Math.ceil(outfits.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const visibleOutfits = outfits.slice(startIndex, startIndex + itemsPerPage);

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-8" 
      style={{ 
        backgroundImage: `url(${pup_bg.src})`,
        backgroundSize: "cover",
        imageRendering: 'pixelated'
      }}>
      <div className="max-w-6xl mx-auto">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-5">
          {/* Character Preview */}
          <div className="col-span-1 bg-white/5 rounded-lg p-6 backdrop-blur-sm border border-[#800000]/20">
            <h2 className="text-2xl font-semibold text-white mb-4">Your Character</h2>
            <div className="aspect-square bg-gray-800/50 rounded-lg flex items-center justify-center p-4">
              <Image
                src={outfits.find(o => o.id === selectedOutfit)?.image || baseMale.src}
                alt="Character Preview"
                width={300}
                height={300}
                className="pixelated w-full h-full object-contain"
                unoptimized
              />
            </div>
            <div className="mt-4 text-center text-white">
              <p>Campus Energy: {character.campusEnergy} CE</p>
            </div>
          </div>

          {/* Outfit Selection */}
          <div className="col-span-2 bg-white/5 rounded-lg p-6 backdrop-blur-sm border border-[#800000]/20">
            <h2 className="text-2xl font-semibold text-white mb-4">Available Outfits</h2>
            <div className="relative overflow-hidden">
              {/* Outfit Container with Sliding Animation */}
              <div 
                className="transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentPage * 100}%)` }}
              >
                <div className="flex">
                  {outfits.map((outfit) => (
                    <div 
                      key={outfit.id}
                      className="min-w-[33.333%] px-2"
                    >
                      <div 
                        className={`bg-[#800000]/20 rounded-lg p-4 cursor-pointer transition-all
                          ${selectedOutfit === outfit.id ? 'ring-2 ring-[#ff8080]' : ''}
                          ${character.ownedOutfits.includes(outfit.id) ? 'hover:bg-[#800000]/30' : 'opacity-75'}
                        `}
                        onClick={() => character.ownedOutfits.includes(outfit.id) && equipOutfit(outfit.id)}
                      >
                        <div className="w-full h-32 flex items-center justify-center mb-2">
                          <Image
                            src={outfit.image}
                            alt={outfit.name}
                            width={128}
                            height={128}
                            className="pixelated object-contain"
                            unoptimized
                          />
                        </div>
                        <h3 className="text-white font-medium">{outfit.name}</h3>
                        {!character.ownedOutfits.includes(outfit.id) ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              purchaseOutfit(outfit);
                            }}
                            className="mt-2 w-full bg-[#800000] hover:bg-[#600000] text-white py-2 px-4 rounded-lg transition-colors"
                          >
                            Buy ({outfit.price} CE)
                          </button>
                        ) : (
                          <p className="text-[#ff8080] mt-2">Owned</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={prevPage}
                  className="p-2 rounded-full bg-[#800000] hover:bg-[#600000] text-white transition-colors disabled:opacity-50"
                  disabled={currentPage === 0}
                >
                  ←
                </button>
                <span className="text-white">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  onClick={nextPage}
                  className="p-2 rounded-full bg-[#800000] hover:bg-[#600000] text-white transition-colors disabled:opacity-50"
                  disabled={currentPage === totalPages - 1}
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