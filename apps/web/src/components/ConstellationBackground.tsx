"use client";

import { useEffect, useRef } from "react";

export function ConstellationBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas to fill viewport
    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();
    window.addEventListener("resize", updateSize);

    // Configuration
    const dotRadius = 1.5;
    const dotCount = Math.floor((canvas.width * canvas.height) / 50000);
    const connectionDistance = 150;
    const dotColor = "rgba(47, 143, 255, 0.3)";
    const lineColor = "rgba(47, 143, 255, 0.08)";

    // Create dots with random positions and velocities
    interface Dot {
      x: number;
      y: number;
      vx: number;
      vy: number;
    }
    const dots: Dot[] = [];
    for (let i = 0; i < dotCount; i++) {
      dots.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
      });
    }

    // Check if motion should be reduced
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let animationId: number;

    const draw = () => {
      // Clear canvas
      ctx.fillStyle = "rgba(7, 10, 15, 0)"; // Transparent to show bg
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update dot positions (if motion is not reduced)
      if (!prefersReducedMotion) {
        for (const dot of dots) {
          dot.x += dot.vx;
          dot.y += dot.vy;

          // Wrap around edges
          if (dot.x < 0) dot.x = canvas.width;
          if (dot.x > canvas.width) dot.x = 0;
          if (dot.y < 0) dot.y = canvas.height;
          if (dot.y > canvas.height) dot.y = 0;
        }
      }

      // Draw connecting lines
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1;
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw dots
      ctx.fillStyle = dotColor;
      for (const dot of dots) {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", updateSize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
