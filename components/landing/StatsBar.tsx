"use client";

import { useEffect, useRef, useState } from "react";
import { colors as themeColors } from "@/lib/theme/colors";

const stats = [
  { value: 50, suffix: "+", label: "Companies Assessed", prefix: "" },
  { value: 2400, suffix: " Cr+", label: "Capital Raised", prefix: "₹" },
  { value: 94, suffix: "%", label: "Assessment Accuracy", prefix: "" },
  { value: 12, suffix: "+", label: "Sectors Covered", prefix: "" },
];

function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);

  return count;
}

function StatItem({
  stat,
  animate,
  index,
}: {
  stat: (typeof stats)[0];
  animate: boolean;
  index: number;
}) {
  const count = useCountUp(stat.value, 1600, animate);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "32px 24px",
        position: "relative",
        opacity: animate ? 1 : 0,
        transform: animate ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`,
      }}
    >
      {/* Number */}
      <div
        style={{
          fontSize: 48,
          fontWeight: 800,
          lineHeight: 1,
          background: `linear-gradient(135deg, ${themeColors.amber[400]}, ${themeColors.amber[600]})`,
          WebkitBackgroundClip: "text",
          color: "transparent",
          letterSpacing: "-0.02em",
          marginBottom: 8,
        }}
      >
        {stat.prefix}
        {count}
        {stat.suffix}
      </div>

      {/* Label */}
      <div
        style={{
          fontSize: 14,
          color: themeColors.gray[500],
          fontWeight: 500,
          textAlign: "center",
          letterSpacing: "0.01em",
        }}
      >
        {stat.label}
      </div>
    </div>
  );
}

export function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimate(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        background: themeColors.white,
        borderBottom: `1px solid ${themeColors.gray[100]}`,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 1rem",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
        }}
      >
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            style={{
              borderRight:
                i < stats.length - 1
                  ? `1px solid ${themeColors.gray[100]}`
                  : "none",
            }}
          >
            <StatItem stat={stat} animate={animate} index={i} />
          </div>
        ))}
      </div>
    </div>
  );
}
