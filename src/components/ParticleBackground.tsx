"use client";

import { useEffect, useRef } from "react";

export function ParticleBackground({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let mouse = { x: -1000, y: -1000 };

    const particles: Array<{
      x: number;
      y: number;
      baseRadius: number;
      vx: number;
      vy: number;
    }> = [];

    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        baseRadius: Math.random() * 3 + 1.5,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
      });
    }

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        let renderX = p.x;
        let renderY = p.y;
        let glowMultiplier = 1;

        // Calculate distance from mouse
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const distanceSq = dx * dx + dy * dy;

        let isTouched = false;
        let force = 0;

        // Interactive threshold (closer radius for a real 'touch' effect)
        if (distanceSq < 150 * 150) {
          isTouched = true;
          const distance = Math.sqrt(distanceSq);
          force = 1 - distance / 150;
          
          // Repel away from cursor (dx, dy points towards cursor, so we subtract)
          const angle = Math.atan2(dy, dx);
          const pushDistance = force * 80; // Pushes up to 80px away
          
          renderX -= Math.cos(angle) * pushDistance;
          renderY -= Math.sin(angle) * pushDistance;
          
          glowMultiplier = 1 + force * 2;
        }

        ctx.beginPath();
        ctx.arc(renderX, renderY, p.baseRadius, 0, Math.PI * 2);
        
        if (isTouched) {
          // White burst when repelled
          ctx.fillStyle = `rgba(255, 255, 255, ${0.7 + force * 0.3})`;
          ctx.shadowColor = '#FFFFFF';
          ctx.shadowBlur = 25 * glowMultiplier;
        } else {
          // Standard constant cyan glow
          ctx.fillStyle = `rgba(0, 210, 255, 0.6)`;
          ctx.shadowColor = '#00C8FF';
          ctx.shadowBlur = 10;
        }
        
        ctx.fill();
        
        // Reset shadow for performance and next particle
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      // Reverting pointer-events-none completely here is safe because 
      // we bound mousemove to window. But we do want to avoid blocking clicks underneath.
      className={`absolute inset-0 z-0 pointer-events-none mix-blend-screen ${className || 'opacity-50'}`}
    />
  );
}
