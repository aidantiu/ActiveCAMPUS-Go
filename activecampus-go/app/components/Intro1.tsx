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
      style={{ backgroundColor: "#F7ECBE" }}
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
              src="/Explore-your-campus.svg"
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
            Explore Your Campus
          </h2>
          <p className="text-lg text-gray-800 pixel-font leading-relaxed">
            Turn your everyday walk into a quest! Discover hidden challenges, collect Campus Energy,
            and unlock surprises as you explore familiar places in a whole new way.
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