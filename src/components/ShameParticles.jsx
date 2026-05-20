import { useEffect, useRef } from 'react';
import {
  WebGLRenderer, Scene, PerspectiveCamera,
  BufferGeometry, Float32BufferAttribute,
  Points, PointsMaterial,
} from 'three';

export default function ShameParticles({ active }) {
  const canvasRef = useRef();

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = window.innerWidth;
    const H = window.innerHeight;

    const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new Scene();
    const camera = new PerspectiveCamera(60, W / H, 0.1, 1000);
    camera.position.z = 5;

    const count = 150;
    const positions = new Float32Array(count * 3);
    const targets = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
      targets[i * 3]       = (Math.random() - 0.5) * 0.4 - 1.5;
      targets[i * 3 + 1]   = (Math.random() - 0.5) * 0.4 + 1.2;
      targets[i * 3 + 2]   = 0;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(positions.slice(), 3));

    const material = new PointsMaterial({
      color: 0xE24B4A,
      size: 0.06,
      transparent: true,
      opacity: 0.8,
    });

    const particles = new Points(geometry, material);
    scene.add(particles);

    let startTime = null;
    const duration = 1200;
    let rafId;

    function animate(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      const pos = geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        pos[i * 3]     = positions[i * 3]     + (targets[i * 3]     - positions[i * 3])     * ease;
        pos[i * 3 + 1] = positions[i * 3 + 1] + (targets[i * 3 + 1] - positions[i * 3 + 1]) * ease;
        pos[i * 3 + 2] = positions[i * 3 + 2] + (targets[i * 3 + 2] - positions[i * 3 + 2]) * ease;
      }
      geometry.attributes.position.needsUpdate = true;

      if (elapsed > 800) {
        material.opacity = 0.8 * (1 - (elapsed - 800) / 400);
      }

      renderer.render(scene, camera);

      if (elapsed < duration) {
        rafId = requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(rafId);
        renderer.dispose();
        geometry.dispose();
        material.dispose();
      }
    }

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
}
