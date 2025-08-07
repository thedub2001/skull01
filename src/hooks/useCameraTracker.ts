import { useEffect, useState } from 'react';

type CameraPosition = { x: number; y: number; z: number };

// Hook qui suit en temps réel la position de la caméra d'un ForceGraph3D
export default function useCameraTracker(fgRef: React.RefObject<any>) {
  const [cameraPos, setCameraPos] = useState<CameraPosition>({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    if (!fgRef.current) return;

    let animationFrameId: number;

    const tick = () => {
      const camPos = fgRef.current.cameraPosition();
      setCameraPos({ x: camPos.x, y: camPos.y, z: camPos.z });
      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [fgRef]);

  return cameraPos;
}
