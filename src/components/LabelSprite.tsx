// src/components/useLabelSprite.tsx

import * as THREE from 'three'
import React from 'react'
import type { NodeType } from '../types/graph'

type Props = {
  // Position actuelle de la caméra
  cameraPos: { x: number; y: number; z: number };

  // Fonction utilitaire pour générer un canvas contenant le texte du label
  generateTextLabel: (text: string) => HTMLCanvasElement;
}

// Un objet 3D vide utilisé pour représenter un "label invisible"
const emptyObject3D = new THREE.Object3D();

/**
 * Hook personnalisé qui retourne une fonction utilisée par `nodeThreeObject`.
 * Cette fonction crée dynamiquement un `THREE.Sprite` affichant un label textuel,
 * dont l’opacité dépend de la distance à la caméra (effet de fade in/out).
 */
export default function useLabelSprite({ cameraPos, generateTextLabel }: Props) {
  return React.useCallback((node: any) => {
    const n = node as NodeType;

    // Si la position du nœud est inconnue, on ne crée rien
    if (n.x == null || n.y == null || n.z == null) return emptyObject3D;

    // Calcul de la distance entre le nœud et la caméra
    const distance = Math.sqrt(
      Math.pow(n.x - cameraPos.x, 2) +
      Math.pow(n.y - cameraPos.y, 2) +
      Math.pow(n.z - cameraPos.z, 2)
    );

    // Seuils de distance pour apparition et disparition du label
    const minVisibleDistance = 40;
    const maxVisibleDistance = 200;

    // Normalisation de la distance entre 0 et 1
    let norm = (distance - minVisibleDistance) / (maxVisibleDistance - minVisibleDistance);
    norm = Math.min(Math.max(norm, 0), 1); // Clamp entre 0 et 1

    // Calcul de l'opacité avec un effet de courbe en cloche (gaussienne aplatie)
    const opacity = Math.pow(1 - Math.abs(0.5 - norm) * 2, 1.5);

    // Si l'opacité est quasi nulle, on n'ajoute rien à la scène
    if (opacity < 0.01) return emptyObject3D;

    // Création du label en canvas, puis conversion en texture
    const canvas = generateTextLabel(n.label);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    // Matériau du sprite avec opacité dynamique
    const material = new THREE.SpriteMaterial({
      map: texture,
      depthWrite: false,
      transparent: true,
      opacity
    });

    // Création du sprite final
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(30, 15, 1); // Taille du label

    // (Décommenter pour debugging)
    // console.log(`[label] "${n.label}" dist=${distance.toFixed(1)} norm=${norm.toFixed(2)} opacity=${opacity.toFixed(2)}`)

    return sprite;

  }, [cameraPos, generateTextLabel]);
}
