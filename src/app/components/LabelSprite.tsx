// src/components/useLabelSprite.tsx

import * as THREE from 'three'
import React from 'react'
import type { NodeType } from '../types/graph'

type Props = {
  cameraPos: { x: number; y: number; z: number };
  generateTextLabel: (text: string) => HTMLCanvasElement;
}

// Objet 3D vide (label invisible)
const emptyObject3D = new THREE.Object3D();

// Cache global pour éviter de recréer les textures/matériaux
const labelCache = new Map<
  string,
  { texture: THREE.CanvasTexture; material: THREE.SpriteMaterial }
>();

export default function useLabelSprite({ cameraPos, generateTextLabel }: Props) {
  return React.useCallback((node: any) => {
    const n = node as NodeType;
    if (n.x == null || n.y == null || n.z == null) return emptyObject3D;

    // Distance caméra-nœud
    const distance = Math.sqrt(
      Math.pow(n.x - cameraPos.x, 2) +
      Math.pow(n.y - cameraPos.y, 2) +
      Math.pow(n.z - cameraPos.z, 2)
    );

    // Seuils de visibilité
    const minVisibleDistance = 40;
    const maxVisibleDistance = 200;

    // Normalisation entre 0 et 1
    let norm = (distance - minVisibleDistance) / (maxVisibleDistance - minVisibleDistance);
    norm = Math.min(Math.max(norm, 0), 1);

    // Opacité (courbe en cloche aplatie)
    const opacity = Math.pow(1 - Math.abs(0.5 - norm) * 2, 1.5);
    if (opacity < 0.01) return emptyObject3D;

    // Vérifier si on a déjà ce label en cache
    let cached = labelCache.get(n.label);
    if (!cached) {
      const canvas = generateTextLabel(n.label);
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;

      const material = new THREE.SpriteMaterial({
        map: texture,
        depthWrite: false,
        transparent: true,
      });

      cached = { texture, material };
      labelCache.set(n.label, cached);
    }

    // Sprite réutilisant le matériel
    const sprite = new THREE.Sprite(cached.material);
    sprite.material.opacity = opacity;
    sprite.scale.set(30, 15, 1);

    return sprite;

  }, [cameraPos, generateTextLabel]);
}
