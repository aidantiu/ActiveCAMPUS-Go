'use client';

import { useEffect, useState } from 'react';
import btnFrame from "../assets/startbtn_frame.svg";

export default function IntroPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentIntro, setCurrentIntro] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleIntroClick = (introNumber: number) => {
    if (isTransitioning) return; // Prevent multiple clicks during transition

    setIsTransitioning(true);

    // Add vanishing class to current section
    const currentSection = document.querySelector('.intro-section');
    if (currentSection) {
      currentSection.classList.add('vanishing');
    }

    // Wait for vanishing animation, then change intro
    setTimeout(() => {
      if (introNumber === 1) {
        setCurrentIntro(2);
      } else if (introNumber === 2) {
        setCurrentIntro(3);
      }

      // Remove vanishing class and reset transition state
      setTimeout(() => {
        if (currentSection) {
          currentSection.classList.remove('vanishing');
        }
        setIsTransitioning(false);
      }, 100);
    }, 800); // Match the vanish animation duration
  };

  return (
    <>
      <style jsx>{`
        @keyframes pixel-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .pixel-pulse {
          animation: pixel-pulse 2s ease-in-out infinite;
        }

        .intro-section {
          transition: all 0.5s ease-in-out;
          opacity: 1;
          transform: translateY(0) scale(1);
        }   

        .intro-section.fade-out {
          opacity: 0;
          transform: translateY(-30px) scale(0.95);
          filter: blur(2px);
        }

        .intro-section.fade-in {
          opacity: 1;
          transform: translateY(0) scale(1);
          animation: slideInUp 0.6s ease-out;
        }

        .intro-section.vanishing {
          animation: vanish 0.8s ease-in-out forwards;
        }

        @keyframes vanish {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0px);
          }
          50% {
            opacity: 0.3;
            transform: translateY(-15px) scale(0.98);
            filter: blur(1px);
          }
          100% {
            opacity: 0;
            transform: translateY(-30px) scale(0.95);
            filter: blur(2px);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
            filter: blur(2px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0px);
          }
        }

        .intro-container {
          transition: opacity 0.3s ease-in-out;
        }

        .intro-container.transitioning {
          opacity: 0.7;
          pointer-events: none;
        }

        /* 100% flexbox fullscreen container for all intro overlays */
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

      {/* Intro 1 - Explore Your Campus */}
      {currentIntro === 1 && (
        <div
          className="intro-viewport flex flex-col items-center justify-center p-0 cursor-pointer"
          style={{ backgroundColor: "#F7ECBE" }}
          onClick={() => handleIntroClick(1)}
        >
          <div className={`intro-section intro-container flex flex-col items-center justify-center w-full h-full p-8 ${
            isTransitioning ? 'transitioning' : ''
          }`}>
            <div className="flex flex-col items-center justify-center mb-8 w-full px-6">
              <h1 className="flex flex-col items-center justify-center w-full">
                <div className="flex justify-center w-full">
                  <img
                    src="/Explore-your-campus.svg"
                    alt="Explore your campus"
                    style={{
                      height: '400px',
                      width: 'auto',
                      maxWidth: '100%',
                      display: 'block',
                      marginTop: '50px',
                    }}
                    className="mx-auto drop-shadow-lg mb-4"
                    draggable={false}
                  />
                </div>
              </h1>
            </div>

            <div className="text-center max-w-2xl flex flex-col items-center px-6">
              <h2 className="text-4xl font-bold text-green-800 mb-4 pixel-font relative bottom-6 relative bottom-17">
                Explore Your Campus
              </h2>
              <p className="text-lg text-gray-800 pixel-font leading-relaxed relative bottom-20">
                Turn your everyday walk into a quest! Discover hidden challenges, collect Campus Energy,
                and unlock surprises as you explore familiar places in a whole new way.
              </p>
            </div>

            <div className="mt-8 flex items-center justify-center w-full">
              <div className="w-4 h-4 border-2 border-blue-400 rounded-full pixel-pulse"></div>
            </div>

            {/* Click hint */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 pixel-font relative bottom-25 ">Click anywhere to continue...</p>
            </div>
          </div>
        </div>
      )}

      {/* Intro 2 - Build Your Character */}
      {currentIntro === 2 && (
        <div
          className="intro-viewport flex flex-col items-center justify-center p-0 cursor-pointer"
          style={{ backgroundColor: "#C9F2BB" }}
          onClick={() => handleIntroClick(2)}
        >
          <div className={`intro-section intro-container fade-in flex flex-col items-center justify-center w-full h-full p-4 md:p-8 ${
            isTransitioning ? 'transitioning' : ''
          }`}>
            <div className="flex flex-col items-center justify-center mb-2 md:mb-8 w-full px-2 md:px-6">
              <h1 className="flex flex-col items-center justify-center w-full">
                <div className="flex justify-center w-full">
                  <img
                    src="/Build-your-character.svg"
                    alt="Build your character"
                    style={{
                      height: '300px',
                      width: 'auto',
                      maxWidth: '100%',
                      display: 'block',
                      marginTop: '36px',
                    }}
                    className="mx-auto drop-shadow-lg mb-3 md:mb-4"
                    draggable={false}
                  />
                </div>
              </h1>
            </div>

            <div className="text-center max-w-2xl flex flex-col items-center px-2 md:px-6">
              <h2 className="text-3xl md:text-4xl font-bold text-green-800 mb-2 md:mb-4 pixel-font relative bottom-4 md:bottom-6">
                Build Your Character
              </h2>
              <p className="text-base md:text-lg text-gray-800 pixel-font leading-relaxed md:relative md:bottom-5">
                Use your steps to earn Campus Energy and upgrade your avatar.
                Unlock outfits, gear, and effects that show off your style and boost your step rewards.
              </p>
            </div>



            {/* Click hint */}
            <div className="mt-3 md:mt-4 text-center">
              <p className="text-sm text-gray-600 pixel-font md:relative md:bottom-5">Click anywhere to continue...</p>
            </div>
          </div>
        </div>
      )}

      {/* Intro 3 - Join the Challenge */}
      {currentIntro === 3 && (
        <div
          className="intro-viewport flex flex-col items-center justify-center p-0"
          style={{ backgroundColor: "#DFD2E9" }}
        >
          <div
            className={`intro-section intro-container fade-in flex flex-col items-center justify-center w-full h-full p-4 md:p-8 ${
              isTransitioning ? "transitioning" : ""
            }`}
          >
            {/* Title image */}
            <div className="flex flex-col items-center justify-center mb-4 md:mb-8 w-full">
              <h1 className="w-full flex justify-center">
                <img
                  src="/Join-the-challenge.svg"
                  alt="Join the challenge"
                  style={{
                    height: "260px",
                    width: "auto",
                    maxWidth: "100%",
                    display: "block",
                    marginTop: "28px",
                  }}
                  className="mx-auto drop-shadow-lg mb-2 md:mb-4"
                  draggable={false}
                />
              </h1>
            </div>

            {/* Main description */}
            <div className="text-center max-w-2xl flex flex-col items-center mb-2 md:mb-6 px-2 md:px-0">
              <h2 className="text-2xl md:text-4xl font-bold text-green-800 mb-2 md:mb-4 pixel-font relative bottom-3 md:bottom-6">
                Join the Challenge
              </h2>
              <p className="text-base md:text-lg text-gray-800 pixel-font leading-relaxed">
                Turn your everyday walk into a quest! Discover hidden challenges, collect Campus Energy,
                and unlock surprises as you explore familiar places in a whole new way.
              </p>
            </div>


            {/* "Let's Step In!" button section - smaller version */}
            <div className="flex flex-col items-center justify-center relative mt-3 md:mt-5 w-full">
              <button
                style={{ outline: "none" }}
                className={`
                  relative flex items-center justify-center group
                  transition-all duration-150
                  hover:scale-105 active:scale-95
                  focus:outline-none
                `}
                tabIndex={0}
                aria-label="Let's Step In!"
                onClick={() => window.location.href = '/dashboard'}
              >
                <img
                  src={btnFrame.src}
                  alt="Start Button Frame"
                  className="w-[135px] md:w-[190px] h-auto block relative z-0 group-hover:brightness-105 group-hover:drop-shadow-lg transition-all duration-150"
                  draggable={false}
                />
                <span
                  className="absolute px-2 pixel-font text-xs md:text-lg font-bold text-green-800 pointer-events-none group-hover:text-green-900 transition-colors duration-150"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -55%)",
                    whiteSpace: "nowrap",
                    width: "fit-content",
                    textShadow: `
                      -2px -2px 0 #fff8,
                      2px -2px 0 #fff8,
                      -2px 2px 0 #fff8,
                      2px 2px 0 #fff8
                    `,
                    userSelect: "none",
                  }}
                >
                  Let's Step In!
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}