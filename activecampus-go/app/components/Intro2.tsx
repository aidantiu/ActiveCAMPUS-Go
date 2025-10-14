'use client';

import { useEffect, useState } from 'react';

export default function Intro() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{ backgroundColor: "#C9F2BB" }}
    >
      {/* Center everything vertically and horizontally */}
      <div className="flex flex-col items-center justify-center w-full h-full">
        {/* Title Section with Centered Images */}
        <div className="flex flex-col items-center mb-8">
          <h1 className="flex flex-col items-center">
            <span className="sr-only">ActiveCAMPUS Go</span>
            <img
              src="/ActiveCampusLogo.svg"
              alt="ActiveCAMPUS Go pixel logo"
              style={{
                height: '279px',
                width: 'auto',
                maxWidth: '100%',
                display: 'block',
              }}
              className="mx-auto drop-shadow-lg mb-4"
              draggable={false}
            />
            <img
              src="/Build-your-character.svg"
              alt="Explore your campus"
              style={{
                height: '400px',
                width: 'auto',
                maxWidth: '100%',
                display: 'block',
                marginTop: '-100px',
              }}
              className="mx-auto drop-shadow-lg mb-4"
              draggable={false}
            />
          </h1>
        </div>

        {/* Centered Text Section */}
        <div className="text-center max-w-2xl flex flex-col items-center">
          <h2 className="text-4xl font-bold text-green-800 mb-4 pixel-font relative bottom-6">
            Build Your Character
          </h2>
          <p className="text-lg text-gray-800 pixel-font leading-relaxed">
            Use your steps to earn Campus Energy and upgrade your avatar. 
            Unlock outfits, gear, and effects that show off your style and boost your step rewards.
          </p>
        </div>

        {/* Centered Bottom Indicator */}
        <div className="mt-8 flex items-center justify-center w-full">
          <div className="w-4 h-4 border-2 border-blue-400 rounded-full pixel-pulse"></div>
        </div>
      </div>
    </div>
  );
}