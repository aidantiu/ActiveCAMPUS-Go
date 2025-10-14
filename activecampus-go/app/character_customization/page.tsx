'use client';

import pup_bg from '../assets/pup_bg.svg';
import baseMale from '../assets/outfits/base_male.png';
import pigtails from '../assets/outfits/pigtails.png';
import madame from '../assets/outfits/madame.png';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
    name: 'Basic Wear',
    price: 100,
    image: baseMale.src,
    owned: true // Default outfit
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
  // Add more outfits as needed
];

export default function CharacterCustomization() {
  const { user } = useAuth();
  const router = useRouter();
  const [character, setCharacter] = useState<Character>({
    currentOutfit: 'casual',
    ownedOutfits: ['casual'],
    campusEnergy: 0
  });
  const [selectedOutfit, setSelectedOutfit] = useState('casual');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCharacterData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCharacter({
            currentOutfit: userData.currentOutfit || 'casual',
            ownedOutfits: userData.ownedOutfits || ['casual'],
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

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-8" 
      style={{ backgroundImage: `url(${pup_bg.src})`,
      backgroundSize: "cover", }}>
      <div className="max-w-6xl mx-auto">
        {/* Add Back Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="mb-4 flex items-center gap-2 text-white hover:text-[#ff8080] transition-colors"
        >
          <span className="text-2xl">←</span>
          <span>Back to Dashboard</span>
        </button>

        <h1 className="text-4xl font-bold text-white mb-8 text-center">Character Customization</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Character Preview */}
          <div className="col-span-1 bg-white/5 rounded-lg p-6 backdrop-blur-sm border border-[#800000]/20">
            <h2 className="text-2xl font-semibold text-white mb-4">Your Character</h2>
            <div className="aspect-square bg-gray-800/50 rounded-lg flex items-center justify-center">
              <img 
                src={outfits.find(o => o.id === selectedOutfit)?.image} 
                alt="Character Preview"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="mt-4 text-center text-white">
              <p>Campus Energy: {character.campusEnergy} CE</p>
            </div>
          </div>

          {/* Outfit Selection */}
          <div className="col-span-2 bg-white/5 rounded-lg p-6 backdrop-blur-sm border border-[#800000]/20">
            <h2 className="text-2xl font-semibold text-white mb-4">Available Outfits</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {outfits.map((outfit) => (
                <div 
                  key={outfit.id} 
                  className={`bg-[#800000]/20 rounded-lg p-4 cursor-pointer transition-all
                    ${selectedOutfit === outfit.id ? 'ring-2 ring-[#ff8080]' : ''}
                    ${character.ownedOutfits.includes(outfit.id) ? 'hover:bg-[#800000]/30' : 'opacity-75'}
                  `}
                  onClick={() => character.ownedOutfits.includes(outfit.id) && equipOutfit(outfit.id)}
                >
                  <img 
                    src={outfit.image} 
                    alt={outfit.name}
                    className="w-full h-32 object-contain mb-2"
                  />
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
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}