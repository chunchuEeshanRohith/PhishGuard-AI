import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * CyberGlobe — pure Canvas 2D implementation.
 * No React Three Fiber / Three.js dependency required.
 * Renders a rotating wireframe globe with network dots and connection lines.
 */
export default function CyberGlobe({ height = 400 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const R = Math.min(canvas.width, canvas.height) * 0.38;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Generate stable globe points
    const PARALLELS = 10;
    const MERIDIANS = 12;
    const DOTS_COUNT = 40;

    const dots = Array.from({ length: DOTS_COUNT }, () => ({
      phi: Math.acos(-1 + 2 * Math.random()),
      theta: Math.random() * Math.PI * 2,
    }));

    const connections = [];
    for (let i = 0; i < 18; i++) {
      connections.push({
        p1: { phi: Math.acos(-1 + 2 * Math.random()), theta: Math.random() * Math.PI * 2 },
        p2: { phi: Math.acos(-1 + 2 * Math.random()), theta: Math.random() * Math.PI * 2 },
        opacity: 0.2 + Math.random() * 0.3,
      });
    }

    let rotY = 0;
    let animId;

    function project(phi, theta) {
      const x3 = R * Math.sin(phi) * Math.cos(theta + rotY);
      const y3 = R * Math.cos(phi);
      const z3 = R * Math.sin(phi) * Math.sin(theta + rotY);
      // Simple perspective
      const scale = (R + 80) / (R + 80 - z3 * 0.4);
      return { x: cx + x3 * scale, y: cy - y3 * scale, z: z3, visible: z3 > -R * 0.9 };
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      rotY += 0.006;

      // Parallels
      for (let p = 1; p < PARALLELS; p++) {
        const phi = (p / PARALLELS) * Math.PI;
        ctx.beginPath();
        let first = true;
        for (let t = 0; t <= 64; t++) {
          const theta = (t / 64) * Math.PI * 2;
          const { x, y, z } = project(phi, theta);
          const alpha = Math.max(0, (z + R) / (2 * R)) * 0.18;
          if (first) { ctx.moveTo(x, y); first = false; }
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(14,165,233,0.12)`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }

      // Meridians
      for (let m = 0; m < MERIDIANS; m++) {
        const theta = (m / MERIDIANS) * Math.PI * 2;
        ctx.beginPath();
        let first = true;
        for (let t = 0; t <= 32; t++) {
          const phi = (t / 32) * Math.PI;
          const { x, y, z } = project(phi, theta);
          if (first) { ctx.moveTo(x, y); first = false; }
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(14,165,233,0.1)`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }

      // Connection lines
      connections.forEach(({ p1, p2, opacity }) => {
        const a = project(p1.phi, p1.theta);
        const b = project(p2.phi, p2.theta);
        if (!a.visible || !b.visible) return;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(14,165,233,${opacity})`;
        ctx.lineWidth = 0.9;
        ctx.stroke();
      });

      // Dots
      dots.forEach(({ phi, theta }) => {
        const { x, y, z, visible } = project(phi, theta);
        if (!visible) return;
        const brightness = Math.max(0.3, (z + R) / (2 * R));
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34,211,238,${brightness * 0.8})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div style={{ width: '100%', height }} className="relative flex items-center justify-center">
      {/* Glow underneath */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div style={{
          width: '60%', height: '60%',
          background: 'radial-gradient(circle, rgba(14,165,233,0.18) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }} />
      </div>

      <motion.canvas
        ref={canvasRef}
        width={500}
        height={height}
        className="relative z-10"
        style={{ width: '100%', height: '100%', maxWidth: 500 }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}
