"use client";

import { useEffect, useState } from "react";
import { colors as themeColors } from "@/lib/theme/colors";

export default function HeroCosmicBg() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Helper to generate random number between min and max
  const random = (min: number, max: number) =>
    Math.random() * (max - min) + min;

  return (
    <>
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        
        @keyframes shootingStar {
          0% { transform: translateX(0) translateY(0); opacity: 1; }
          70% { opacity: 1; }
          100% { transform: translateX(300px) translateY(300px); opacity: 0; }
        }
        
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 30px) scale(0.9); }
        }
        
        @keyframes rotateGalaxy {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes orbit {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        @keyframes rocketFly {
          0% { left: '-100px'; }
          100% { left: '110%'; }
        }
        
        @keyframes drift {
          0% { transform: translateY(0); }
          50% { transform: translateY(5px); }
          100% { transform: translateY(0); }
        }
        
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      `}</style>

      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          background: `
                radial-gradient(circle at 20% 30%, rgba(0, 255, 180, 0.12), transparent 40%),
                radial-gradient(circle at 80% 70%, rgba(100, 180, 255, 0.15), transparent 45%),
                radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.06), transparent 60%),
                linear-gradient(
                  135deg,
                  ${themeColors.brand[950]},
                  ${themeColors.brand[900]},
                  ${themeColors.brand[800]}
                ),
                radial-gradient(circle at 50% 100%, rgba(0, 255, 200, 0.15), transparent 60%)

              `,

          color: themeColors.white,
          overflow: "hidden",
          inset: 0,
          backgroundImage: `
      radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.8), transparent),
      radial-gradient(1px 1px at 80% 40%, rgba(255,255,255,0.6), transparent),
      radial-gradient(1px 1px at 60% 70%, rgba(255,255,255,0.7), transparent),
      radial-gradient(1px 1px at 40% 80%, rgba(255,255,255,0.5), transparent),
      radial-gradient(1px 1px at 90% 10%, rgba(255,255,255,0.6), transparent)
    `,
          backgroundSize: "200px 200px",
          pointerEvents: "none",
        }}
      >
        {/* Large Stars */}
        {[...Array(50)].map((_, i) => {
          return (
            <div
              key={`star-${i}`}
              className="absolute rounded-full bg-white"
              style={{
                width: `${random(1, 4)}px`,
                height: `${random(1, 4)}px`,
                top: `${random(0, 100)}%`,
                left: `${random(0, 100)}%`,
                animation: `twinkle 1s ease-in-out infinite`,
                animationDelay: "0.5s",
                opacity: random(0.3, 1),
              }}
            />
          );
        })}

        {/* Glowing Stars */}
        {[...Array(250)].map((_, i) => {
          return (
            <div
              key={`glow-star-${i}`}
              className="absolute rounded-full"
              style={{
                width: `${random(2, 6)}px`,
                height: `${random(2, 6)}px`,
                top: `${random(0, 100)}%`,
                left: `${random(0, 100)}%`,
                background:
                  "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(147,197,253,0.8) 40%, transparent 70%)",
                // animation: `pulse 0.2s ease-in-out infinite`,
                // animationDelay: "0.5s",
              }}
            />
          );
        })}

        {/* Shooting Stars */}
        <div
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            top: "20%",
            left: "10%",
            boxShadow: "0 0 10px 2px rgba(255,255,255,0.9)",
            animation: "shootingStar 2s ease-in-out infinite",
            animationDelay: "1s",
          }}
        />
        <div
          className="absolute w-2 h-1 bg-white rounded-full"
          style={{
            top: "60%",
            left: "70%",
            boxShadow: "0 0 10px 2px rgba(255,255,255,0.8)",
            animation: "shootingStar 4s ease-in-out infinite",
            animationDelay: "5s",
          }}
        />
      </div>

      {/* Spiral Galaxy - Top Right */}
      <div
        className="absolute rounded-full"
        style={{
          top: "5%",
          right: "0%",
          width: "200px",
          height: "200px",
          background: `
            radial-gradient(ellipse at center,
              rgba(139, 92, 246, 0.4) 0%,
              rgba(99, 102, 241, 0.3) 20%,
              rgba(59, 130, 246, 0.2) 40%,
              transparent 70%
            )
          `,
          filter: "blur(1px)",
          animation: "rotateGalaxy 60s linear infinite",
          opacity: 0.6,
        }}
      >
        {/* Galaxy Arms */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`arm-${i}`}
            className="absolute"
            style={{
              width: "100%",
              height: "2px",
              background:
                "linear-gradient(90deg, rgba(147, 197, 253, 0.6), transparent)",
              top: "50%",
              left: "50%",
              transformOrigin: "0% 50%",
              transform: `rotate(${i * 45}deg)`,
            }}
          />
        ))}
      </div>

      {/* Planetary System - Left Side */}
      <div
        className="absolute"
        style={{
          top: "20%",
          left: "20%",
          width: "300px",
          height: "300px",
        }}
      >
        {/* Central Star/Sun */}
        <div
          className="absolute rounded-full"
          style={{
            top: "45%",
            left: "45%",
            transform: "translate(-50%, -50%)",
            width: "35px",
            height: "35px",
            background:
              "radial-gradient(circle, rgba(251, 191, 36, 0.8), rgba(245, 158, 11, 0.4))",
            boxShadow: "0 0 30px rgba(251, 191, 36, 0.6)",
            animation: "pulse 4s ease-in-out infinite",
          }}
        />
        {/* Mercury - Orbit 1 */}
        <div
          className="absolute"
          style={{
            top: "50%",
            left: "50%",
            width: "90px",
            height: "90px",
            transform: "translate(-50%, -50%)",
            animation: "orbit 10s linear infinite",
          }}
        >
          <div
            className="absolute rounded-full"
            style={{
              top: "0",
              left: "50%",
              transform: "translateX(-50%)",
              width: "8px",
              height: "8px",
              background:
                "radial-gradient(circle at 30% 30%, #b8b8b8, #8a8a8a)",
              boxShadow: "0 0 6px rgba(184, 184, 184, 0.4)",
            }}
          />
        </div>

        {/* Venus - Orbit 2 */}
        <div
          className="absolute"
          style={{
            top: "50%",
            left: "50%",
            width: "120px",
            height: "120px",
            transform: "translate(-50%, -50%)",
            animation: "orbit 16s linear infinite",
          }}
        >
          <div
            className="absolute rounded-full"
            style={{
              top: "0",
              left: "50%",
              transform: "translateX(-50%)",
              width: "14px",
              height: "14px",
              background:
                "radial-gradient(circle at 30% 30%, #ffd89c, #f4a261)",
              boxShadow: "0 0 8px rgba(255, 216, 156, 0.5)",
            }}
          />
        </div>

        {/* Earth - Orbit 3 */}
        <div
          className="absolute"
          style={{
            top: "50%",
            left: "50%",
            width: "155px",
            height: "155px",
            transform: "translate(-50%, -50%)",
            animation: "orbit 20s linear infinite",
          }}
        >
          <div
            className="absolute rounded-full"
            style={{
              top: "0",
              left: "50%",
              transform: "translateX(-50%)",
              width: "16px",
              height: "16px",
              background:
                "radial-gradient(circle at 30% 30%, #4a90e2, #2e5c8a)",
              boxShadow: "0 0 10px rgba(74, 144, 226, 0.6)",
              position: "relative",
            }}
          >
            {/* Moon orbiting Earth */}
            <div
              className="absolute rounded-full"
              style={{
                width: "4px",
                height: "4px",
                background: "#c0c0c0",
                top: "-12px",
                left: "50%",
                transform: "translateX(-50%)",
                animation: "moonOrbit 4s linear infinite",
              }}
            />
          </div>
        </div>

        {/* Mars - Orbit 4 */}
        <div
          className="absolute"
          style={{
            top: "50%",
            left: "50%",
            width: "190px",
            height: "190px",
            transform: "translate(-50%, -50%)",
            animation: "orbit 26s linear infinite",
          }}
        >
          <div
            className="absolute rounded-full"
            style={{
              top: "0",
              left: "50%",
              transform: "translateX(-50%)",
              width: "12px",
              height: "12px",
              background:
                "radial-gradient(circle at 30% 30%, #e27b58, #c1440e)",
              boxShadow: "0 0 8px rgba(226, 123, 88, 0.5)",
            }}
          />
        </div>

        {/* Jupiter - Orbit 5 */}
        <div
          className="absolute"
          style={{
            top: "50%",
            left: "50%",
            width: "240px",
            height: "240px",
            transform: "translate(-50%, -50%)",
            animation: "orbit 35s linear infinite",
          }}
        >
          <div
            className="absolute rounded-full"
            style={{
              top: "0",
              left: "50%",
              transform: "translateX(-50%)",
              width: "28px",
              height: "28px",
              background:
                "radial-gradient(circle at 30% 30%, #d4a574, #b8886d)",
              boxShadow: "0 0 12px rgba(212, 165, 116, 0.6)",
              position: "relative",
            }}
          >
            {/* Jupiter's Great Red Spot */}
            <div
              style={{
                position: "absolute",
                width: "8px",
                height: "6px",
                background: "rgba(200, 100, 80, 0.6)",
                borderRadius: "50%",
                top: "45%",
                right: "20%",
              }}
            />
          </div>
        </div>

        {/* Saturn - Orbit 6 (with rings) */}
        <div
          className="absolute"
          style={{
            top: "50%",
            left: "50%",
            width: "285px",
            height: "285px",
            transform: "translate(-50%, -50%)",
            animation: "orbit 42s linear infinite",
          }}
        >
          <div
            className="absolute"
            style={{
              top: "0",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <div
              className="rounded-full"
              style={{
                width: "24px",
                height: "24px",
                background:
                  "radial-gradient(circle at 30% 30%, #f4e4c1, #d4c5a0)",
                boxShadow: "0 0 12px rgba(244, 228, 193, 0.6)",
              }}
            />
            {/* Saturn's Rings */}
            <div
              className="absolute"
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%) rotateX(75deg)",
                width: "45px",
                height: "45px",
                border: "3px solid rgba(251, 191, 36, 0.4)",
                borderRadius: "50%",
                boxShadow: "inset 0 0 10px rgba(251, 191, 36, 0.3)",
              }}
            />
          </div>
        </div>

        {/* Uranus - Orbit 7 */}
        <div
          className="absolute"
          style={{
            top: "50%",
            left: "50%",
            width: "330px",
            height: "330px",
            transform: "translate(-50%, -50%)",
            animation: "orbit 52s linear infinite reverse",
          }}
        >
          <div
            className="absolute rounded-full"
            style={{
              top: "0",
              left: "50%",
              transform: "translateX(-50%)",
              width: "18px",
              height: "18px",
              background:
                "radial-gradient(circle at 30% 30%, #a8d5e2, #7ba7bc)",
              boxShadow: "0 0 10px rgba(168, 213, 226, 0.6)",
            }}
          />
        </div>

        {/* Neptune - Orbit 8 */}
        <div
          className="absolute"
          style={{
            top: "50%",
            left: "50%",
            width: "370px",
            height: "370px",
            transform: "translate(-50%, -50%)",
            animation: "orbit 65s linear infinite",
          }}
        >
          <div
            className="absolute rounded-full"
            style={{
              top: "0",
              left: "50%",
              transform: "translateX(-50%)",
              width: "17px",
              height: "17px",
              background:
                "radial-gradient(circle at 30% 30%, #5b7bb4, #3d5a8c)",
              boxShadow: "0 0 10px rgba(91, 123, 180, 0.6)",
            }}
          />
        </div>

        {/* Orbit paths - subtle rings */}
        {[90, 120, 155, 190, 240, 285, 330, 370].map((size, i) => (
          <div
            key={`orbit-${i}`}
            className="absolute rounded-full"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: `${size}px`,
              height: `${size}px`,
              border: "1px solid rgba(147, 197, 253, 0.08)",
            }}
          />
        ))}
      </div>
      {/* </div> */}

      {/* Rocket Animation - Flies across screen */}
      <div
        className="absolute"
        style={{
          bottom: "40%",
          left: "-100px",
          animation: "rocketFly 1s linear infinite",
          zIndex: 5,
        }}
      >
        <div style={{ position: "relative", transform: "rotate(-45deg)" }}>
          {/* Rocket body */}
          <div
            style={{
              width: "40px",
              height: "60px",
              background:
                "linear-gradient(135deg, rgba(226, 232, 240, 0.9), rgba(203, 213, 225, 0.8))",
              borderRadius: "20px 20px 5px 5px",
              position: "relative",
              boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)",
            }}
          ></div>
          {/* Fire trail */}
          <div
            style={{
              position: "absolute",
              bottom: "-30px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "20px",
              height: "30px",
              background:
                "linear-gradient(180deg, rgba(251, 191, 36, 0.8), rgba(239, 68, 68, 0.6), transparent)",
              borderRadius: "50%",
              filter: "blur(3px)",
              animationName: "flicker",
              animationDuration: "0.2s",
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
              animationDelay: "1s",
            }}
          />
        </div>
      </div>

      {/* Distant Moon - Top Left */}
      {/* <div
        className="absolute rounded-full"
        style={{
          top: "12%",
          left: "12%",
          width: "80px",
          height: "80px",
          background:
            "radial-gradient(circle at 35% 35%, rgba(226, 232, 240, 0.4), rgba(148, 163, 184, 0.3))",
          boxShadow:
            "inset -10px -10px 20px rgba(0, 0, 0, 0.3), 0 0 30px rgba(148, 163, 184, 0.2)",
          animation: "float 12s ease-in-out infinite",
          animationDelay: `0.1s`,
        }}
      > */}
      {/* Moon craters */}
      {/* {[...Array(5)].map((_, i) => (
          <div
            key={`crater-${i}`}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 15 + 5}px`,
              height: `${Math.random() * 15 + 5}px`,
              background: "rgba(71, 85, 105, 0.3)",
              top: `${Math.random() * 70 + 10}%`,
              left: `${Math.random() * 70 + 10}%`,
              boxShadow: "inset 2px 2px 4px rgba(0, 0, 0, 0.4)",
            }}
          />
        ))} */}
      {/* </div> */}

      {/* Nebula Clouds */}
      {/* <div className="absolute inset-0">
        <div
          className="absolute rounded-full"
          style={{
            top: "10%",
            right: "5%",
            width: "500px",
            height: "500px",
            background:
              "radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, rgba(59, 130, 246, 0.15) 40%, transparent 70%)",
            filter: "blur(60px)",
            animation: "float 20s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            bottom: "-10%",
            left: "-5%",
            width: "600px",
            height: "600px",
            background:
              "radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, rgba(59, 130, 246, 0.1) 40%, transparent 70%)",
            filter: "blur(80px)",
            animation: "float 25s ease-in-out infinite reverse",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            top: "40%",
            right: "20%",
            width: "400px",
            height: "400px",
            background:
              "radial-gradient(circle, rgba(96, 165, 250, 0.15) 0%, transparent 60%)",
            filter: "blur(70px)",
            animation: "float 18s ease-in-out infinite",
            animationDelay: "3s",
          }}
        />
      </div> */}

      {/* Cosmic Dust Particles */}
      {/* <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {[...Array(100)].map((_, i) => (
            <circle
              key={`particle-${i}`}
              cx={Math.random() * 100 + "%"}
              cy={Math.random() * 100 + "%"}
              r={Math.random() * 1.5}
              fill="rgba(147, 197, 253, 0.6)"
              filter="url(#glow)"
            >
              <animate
                attributeName="opacity"
                values="0.3;0.8;0.3"
                dur={`${Math.random() * 4 + 2}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </svg>
      </div> */}

      {/* Gradient Overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-brand-950/20"></div>
    </>
  );
}
