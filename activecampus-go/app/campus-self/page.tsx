'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import IntroBg from "../assets/intro_bg.svg";
import btnFrame from "../assets/startbtn_frame.svg";
import blueMale from "../assets/images/base-male.png";
import pinkFemale from "../assets/images/base-female.png";

const campusSelves = [
  {
    id: 'boy',
    border: 'border-blue-300',
    highlight: 'ring-blue-400',
    labelColor: 'text-blue-600',
    img: blueMale.src
  },
  {
    id: 'girl',
    border: 'border-pink-300',
    highlight: 'ring-pink-400',
    labelColor: 'text-pink-600',
    img: pinkFemale.src
  }
];

export default function CampusSelfPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleExplore = () => {
    if (selected) {
      // Optionally, save selection in localStorage or context here
      router.push('/intro');
    }
  };

  return (
    <>
      <style jsx>{`
          .intro-viewport {
            position: fixed;
            inset: 0;
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            min-width: 0;
            min-height: 0;
            max-width: none;
            max-height: none;
            overflow: hidden;
          }
      `}</style>
      <div
        className="intro-viewport flex flex-col items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(30,35,70,0.45), rgba(10,12,32,0.68)), url(${IntroBg.src})`,
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundColor: '#1a213a',
        }}
      >
        {/* Logo & title */}
        <div className="w-full flex items-center justify-center mt-4 mb-4 px-4 mt-25">
          <span
            className="pixel-font text-[40px] font-bold text-[#8AC1E3] text-center leading-tight whitespace-nowrap"
            style={{
              textShadow: `
                -2px -2px 0 black,
                2px -2px 0 black,
                -2px 2px 0 black,
                2px 2px 0 black,
                0 4px 16px #000a
              `,
              transform: 'scale(1.3)',
            }}
          >
            Choose Your Campus Self
          </span>
        </div>

        {/* Selectable characters */}
        <div className="flex flex-row items-center justify-center w-full gap-8 md:gap-16 px-2 md:px-0 mb-8 md:mb-12 relative top-10">
          {campusSelves.map(option => (
            <button
              key={option.id}
              id={option.id}
              className={`
                focus:outline-none
                flex flex-col items-center
                bg-yellow-50
                rounded-[48px]
                px-5 py-7
                md:px-8 md:py-10
                w-[170px] h-[250px]
                md:w-[220px] md:h-[320px]
                border-8
                ${option.border}
                shadow-2xl
                transition-all
                duration-300
                relative
                ${selected === option.id ? `ring-8 ${option.highlight} z-10 hover:scale-110` : 'opacity-90 hover:scale-105'}
                hover:ring-8 hover:z-10
              `}
              onClick={() => setSelected(option.id)}
              aria-label={`Choose ${option.id}`}
              tabIndex={0}
            >
              {option.img && (
                <img
                  src={option.img}
                  alt={option.id}
                  className="mb-4 md:mb-7 h-24 md:h-40 w-auto mx-auto rounded-xl"
                  draggable={false}
                  style={{ pointerEvents: 'none' }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Explore button */}
        <div className="w-full flex items-center justify-center pb-8 md:pb-16 mb-5 relative top-5">
          <button
            disabled={!selected}
            onClick={handleExplore}
            className={`
              relative flex flex-col items-center justify-center
              transition-all duration-150
              ${selected ? 'hover:scale-105 active:scale-95' : 'opacity-60 cursor-not-allowed'}
            `}
          >
            <img
              src={btnFrame.src}
              alt="Button Frame"
              className="w-[240px] md:w-[320px] h-auto"
              draggable={false}
            />
            <span
              className="absolute pixel-font text-[18px] md:text-[24px] font-semibold text-[#8AC1E3] text-center leading-tight"
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
              Explore<br />the Campus
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
