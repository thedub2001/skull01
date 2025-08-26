// utils/addDynamicVisualLinks.ts

import * as THREE from 'three';
import type { VisualLinkType } from '../types/VisualLinkType';
import type { NodeType } from '../types/graph';

type VisualLinkLine = {
  line: THREE.Line;
  sourceId: string;
  targetId: string;
};

let visualLinkLines: VisualLinkLine[] = [];
const normal = new THREE.Vector3(0, 1, 0);

function createBezierCurve(sourcePos: THREE.Vector3, targetPos: THREE.Vector3): THREE.Vector3[] {
  const midPoint = new THREE.Vector3().addVectors(sourcePos, targetPos).multiplyScalar(0.5);
  const controlPoint = midPoint.clone().add(normal.clone().multiplyScalar(5));
  const curve = new THREE.QuadraticBezierCurve3(sourcePos, controlPoint, targetPos);
  return curve.getPoints(50);
}

export function addDynamicVisualLinks(
  fg: any,
  visualLinks: VisualLinkType[],
  graphData: { nodes: NodeType[] },
  getSelectedLinks: () => Set<string>,
  onVisualLinkClick: (linkId: string) => void
) {
  if (!fg) return;

  const scene = fg.scene();
  if (!scene) return;

  // Nettoyage
  visualLinkLines.forEach(({ line }) => {
    scene.remove(line);
    line.geometry.dispose();
    if (Array.isArray(line.material)) line.material.forEach(mat => mat.dispose());
    else line.material.dispose();
  });
  visualLinkLines = [];

  visualLinks.forEach(link => {
    const sourceNode = graphData.nodes.find(n => n.id === link.source);
    const targetNode = graphData.nodes.find(n => n.id === link.target);

    console.log("[visualLink][check]", {
      linkId: link.id,
      source: link.source,
      target: link.target,
      foundSource: !!sourceNode,
      foundTarget: !!targetNode,
    });

    if (!sourceNode || !targetNode) return;

    const sourcePos = new THREE.Vector3(sourceNode.x, sourceNode.y, sourceNode.z);
    const targetPos = new THREE.Vector3(targetNode.x, targetNode.y, targetNode.z);

    const points = createBezierCurve(sourcePos, targetPos);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineBasicMaterial({ color: 0xffa500, linewidth: 2 });

    const line = new THREE.Line(geometry, material);
    line.userData = { isVisualLink: true, id: link.id };

    scene.add(line);
    visualLinkLines.push({ line, sourceId: link.source, targetId: link.target });
  });
}

export function updateVisualLinks(fg: any, graphData: { nodes: NodeType[] }) {
  if (!fg || !visualLinkLines.length) return;

  visualLinkLines.forEach(({ line, sourceId, targetId }) => {
    const sourceNode = graphData.nodes.find(n => n.id === sourceId);
    const targetNode = graphData.nodes.find(n => n.id === targetId);
    if (!sourceNode || !targetNode) return;

    const sourcePos = new THREE.Vector3(sourceNode.x, sourceNode.y, sourceNode.z);
    const targetPos = new THREE.Vector3(targetNode.x, targetNode.y, targetNode.z);

    const points = createBezierCurve(sourcePos, targetPos);
    line.geometry.setFromPoints(points);
    line.geometry.attributes.position.needsUpdate = true;
  });
}
