import { useEffect, useState, useRef } from 'react';

type CameraPosition = { x: number; y: number; z: number };

export default function useCameraTracker(fgRef: React.RefObject<any>) {
  const [cameraPos, setCameraPos] = useState<CameraPosition>({ x: 0, y: 0, z: 0 });
  const lastPosRef = useRef<CameraPosition>({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    if (!fgRef.current) return;

    let animationFrameId: number;

    const threshold = 0.01; // tolérance pour considérer un mouvement réel

    const tick = () => {
      const camPos = fgRef.current.cameraPosition();
      const lastPos = lastPosRef.current;

      // Calcul simple de distance au carré pour éviter sqrt
      const dx = camPos.x - lastPos.x;
      const dy = camPos.y - lastPos.y;
      const dz = camPos.z - lastPos.z;
      const distSq = dx * dx + dy * dy + dz * dz;

      if (distSq > threshold * threshold) {
        lastPosRef.current = camPos;
        setCameraPos({ x: camPos.x, y: camPos.y, z: camPos.z });
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [fgRef]);

  return cameraPos;
}
