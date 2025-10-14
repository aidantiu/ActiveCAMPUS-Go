"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import introBg from "./assets/intro_bg.svg";
import logo from "./assets/activecampus_logo.svg";
import groupStudents from "./assets/group_students.svg";
import btnFrame from "./assets/startbtn_frame.svg";
import textFrame from "./assets/text_frame.svg";

export default function Home() {
  const router = useRouter();
  const [isShifted, setIsShifted] = useState(false);
  const [showStudents, setShowStudents] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const shiftTimer = setTimeout(() => {
      setIsShifted(true);
    }, 1000);

    const studentsTimer = setTimeout(() => {
      setShowStudents(true);
      setShowButton(true);
    }, 1300);

    return () => {
      clearTimeout(shiftTimer);
      clearTimeout(studentsTimer);
    };
  }, [router]);

  return (
    <div
      className="relative h-screen w-screen bg-cover bg-center bg-no-repeat flex items-center justify-center overflow-hidden"
      style={{ backgroundImage: `url(${introBg.src})` }}
    >
      {/* Logo */}
      <img
        src={logo.src}
        alt="ActiveCampus GO Logo"
        className={`absolute w-[570px] h-auto transition-all duration-700 ease-in-out transform ${
          isShifted ? "-translate-y-75" : "translate-y-0"
        }`}
      />

      {/* Group of Students */}
      <img
        src={groupStudents.src}
        alt="Group of Students"
        className={`absolute w-[500px] h-auto transition-opacity duration-700 ease-in-out ${
          showStudents
            ? "opacity-100 -translate-y-12"
            : "opacity-0 -translate-y-12"
        }`}
      />

      {/* Text Frame with Text */}
      <div
        className={`absolute flex flex-col items-center justify-center transition-opacity duration-700 ease-in-out ${
          showStudents ? "opacity-100" : "opacity-0"
        }`}
        style={{ top: "62%" }} // positions the frame below the logo
      >
        <img src={textFrame.src} alt="Text Frame" className="w-[400px] h-auto" />

        {/* Text on top of the text frame */}
        <span
          className="absolute text-[24px] font-semibold text-[#dfd2e9] text-center leading-tight"
          style={{
            textShadow: `
        -2px -2px 0 black,
        2px -2px 0 black,
        -2px 2px 0 black,
        2px 2px 0 black
      `,
            top: "33%", // adjust vertically to fit your frame
          }}
        >
          Your Steps. Your Story. <br /> Your Campus Adventure.
        </span>
      </div>

      {/* Button Frame */}
      {showButton && (
        <button
          onClick={() => router.push("/register")}
          className="absolute flex flex-col items-center justify-center transition-all duration-700 ease-in-out opacity-0 animate-fadeIn hover:scale-105"
          style={{ top: "75%" }} // positions the button below students
        >
          <img
            src={btnFrame.src}
            alt="Button Frame"
            className="w-[370px] h-auto"
          />
          <span
            className="absolute text-[30px] font-semibold text-[#8AC1E3]"
            style={{
              textShadow: `
      -2px -2px 0 black,
      2px -2px 0 black,
      -2px 2px 0 black,
      2px 2px 0 black
    `,
            }}
          >
            Begin Your <br /> Campus Quest
          </span>
        </button>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 1s forwards;
        }
      `}</style>
    </div>
  );
}
