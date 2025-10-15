'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import IntroBg from "../assets/intro_bg.svg";
import btnFrame from "../assets/startbtn_frame.svg";


const campusSelves = [
  {
    key: 'blue',
    border: 'border-blue-300',
    highlight: 'ring-blue-400',
    img: 'base-male.png', // placeholder, update if desired
    labelColor: 'text-blue-600'
  },
  {
    key: 'pink',
    border: 'border-pink-300',
    highlight: 'ring-pink-400',
    img: '/CampusSelf-Pink.png', // placeholder, update if desired
    labelColor: 'text-pink-600'
  }
];

export default function CampusSelfPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleExplore = async () => {
    if (selected && user) {
      setIsSaving(true);
      try {
        // Update user profile with campus self selection
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          'avatar.base': selected,
          campusSelfCompleted: true,
          lastActive: new Date()
        });
        
        // Navigate to dashboard
        router.push('/dashboard');
      } catch (error) {
        console.error('Error saving campus self selection:', error);
        setIsSaving(false);
      }
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center pt-7"
      style={{
        backgroundImage: `url(${IntroBg.src})`,
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      {/* Logo & title */}
      <div className="flex flex-col items-center mt-3 mb-2 relative bottom-15">
        <img
          src="/ActiveCampusLogo.svg"
          alt="ActiveCAMPUS Go pixel logo"
          style={{
            height: '207px',
            width: 'auto',  
            maxWidth: '100%',
            display: 'block',
          }}
          className="mx-auto drop-shadow-lg mb-4"
          draggable={false}
        />
        <div className="flex items-center space-x-2 -mt-1 relative bottom-15">
          <span className="pixel-font text-[2.6rem] text-blue-900 font-extrabold drop-shadow-lg text-center leading-none tracking-tight" style={{textShadow: '2px 2px 0 #fff, 3px 3px 0 #000'}}>
            Choose Your
            <br />
            Campus Self
          </span>
        </div>
      </div>

      {/* Selectable characters */}
      <div className="flex flex-row items-center justify-center w-full mt-4 mb-10 gap-14 relative bottom-25">
        {campusSelves.map(option => (
          <button
            key={option.key}
            className={`
              focus:outline-none
              flex flex-col items-center
              bg-yellow-50
              rounded-[48px]
              px-8 py-10
              w-[220px] h-[320px]
              border-8
              ${option.border}
              shadow-2xl
              transition-all
              duration-300
              relative
              ${selected === option.key ? `ring-8 ${option.highlight} z-10 hover:scale-110` : 'opacity-90 hover:scale-105'}
              hover:ring-8 hover:z-10
            `}
            onClick={() => setSelected(option.key)}
            aria-label={`Choose ${option.key}`}
            tabIndex={0}
          >
            {option.img && (
              <img
                src={option.img}
                alt={option.key}
                className="mb-7 h-40 w-auto mx-auto rounded-xl"
                draggable={false}
                style={{pointerEvents: 'none'}}
              />
            )}
            <span className={`pixel-font text-3xl font-bold mt-4 ${option.labelColor}`}>
              {option.key}
            </span>
          </button>
        ))}
      </div>

       {/* Explore button */}
       <button
         disabled={!selected || isSaving}
         onClick={handleExplore}
         className={`
           relative bottom-20 flex flex-col items-center justify-center relative
           transition-all duration-150
           ${selected && !isSaving ? 'hover:scale-105 active:scale-95' : 'opacity-60 cursor-not-allowed'}
         `}
       >
        <img
          src={btnFrame.src}
          alt="Button Frame"
          className="w-[320px] h-auto"
          draggable={false}
        />
         <span
           className="absolute pixel-font text-[24px] font-semibold text-[#8AC1E3] text-center leading-tight"
           style={{
             textShadow: `
               -2px -2px 0 black,
               2px -2px 0 black,
               -2px 2px 0 black,
               2px 2px 0 black
             `,
             top: '50%',
             left: '50%',
             transform: 'translate(-50%, -50%)',
           }}
         >
           {isSaving ? 'Saving...' : 'Explore\nthe Campus'}
         </span>
      </button>
    </div>
  );
}
