import * as THREE from 'three';

export type VisualLink = {
  id: string;
  source_id: string;
  target_id: string;
  type: string;
  metadata?: Record<string, any>;
};

const LINK_STYLES: Record<
  string,
  { color: number; dashed?: boolean; controlOffset?: number }
> = {
  amitié: { color: 0xffa500, dashed: false, controlOffset: 50 },
  hiérarchie: { color: 0x00aaff, dashed: false, controlOffset: 100 },
  conflit: { color: 0xff0000, dashed: true, controlOffset: 70 },
};

export function addDynamicVisualLinks(
  fgRef: any,
  visualLinks: VisualLink[],
  getSelectedLinks: () => Set<string>,
  onLinkClick: (linkId: string) => void
) {
  if (!fgRef?.current) return;

  const scene = fgRef.current.scene();
  const curves: {
    geometry: THREE.BufferGeometry;
    line: THREE.Line;
    sprite?: THREE.Sprite;
    sourceId: string;
    targetId: string;
    style: { color: number; dashed?: boolean; controlOffset?: number };
    id: string;
  }[] = [];

  visualLinks.forEach((link) => {
    const style = LINK_STYLES[link.type] || {
      color: 0xffffff,
      dashed: false,
      controlOffset: 50,
    };

    const geometry = new THREE.BufferGeometry();
    const material = new THREE.LineBasicMaterial({
      color: style.color,
      linewidth: 2,
    });

    const line = new THREE.Line(geometry, material);
    line.userData = { linkId: link.id };
    scene.add(line);

    let sprite: THREE.Sprite | undefined;
    if (link.metadata?.label) {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.font = '28px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(link.metadata.label, canvas.width / 2, canvas.height / 2);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
      });
      sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(80, 40, 1);
      scene.add(sprite);
    }

    curves.push({
      geometry,
      line,
      sprite,
      sourceId: link.source_id,
      targetId: link.target_id,
      style,
      id: link.id,
    });
  });

  let lastCamPos = new THREE.Vector3();
  const lastNodePositions = new Map<string, THREE.Vector3>();

  function updateCurvesIfNeeded() {
    let shouldUpdate = false;
    const cam = fgRef.current.camera();
    const camPos = cam.position.clone();
    if (!camPos.equals(lastCamPos)) {
      lastCamPos.copy(camPos);
      shouldUpdate = true;
    }

    const graph = fgRef.current.graphData();

    curves.forEach(({ sourceId, targetId }) => {
      [sourceId, targetId].forEach((id) => {
        const node = graph.nodes.find((n: any) => n.id === id);
        if (!node) return;
        const pos = new THREE.Vector3(node.x, node.y, node.z || 0);
        const lastPos = lastNodePositions.get(id);
        if (!lastPos || !pos.equals(lastPos)) {
          lastNodePositions.set(id, pos.clone());
          shouldUpdate = true;
        }
      });
    });

    if (!shouldUpdate) return;

    const selected = getSelectedLinks();

    curves.forEach(({ geometry, sprite, sourceId, targetId, style, line, id }) => {
      const source = graph.nodes.find((n: any) => n.id === sourceId);
      const target = graph.nodes.find((n: any) => n.id === targetId);
      if (!source || !target) return;

      const src = new THREE.Vector3(source.x, source.y, source.z || 0);
      const tgt = new THREE.Vector3(target.x, target.y, target.z || 0);
      const control = new THREE.Vector3(
        (src.x + tgt.x) / 2,
        (src.y + tgt.y) / 2 + (style.controlOffset ?? 50),
        (src.z + tgt.z) / 2
      );

      const curve = new THREE.QuadraticBezierCurve3(src, control, tgt);
      const points = curve.getPoints(50);
      geometry.setFromPoints(points);

      if (sprite) sprite.position.copy(control);

      if (selected.has(id)) {
        (line.material as THREE.LineBasicMaterial).color.set(0xff6600);
        (line.material as THREE.LineBasicMaterial).linewidth = 5;
      } else {
        (line.material as THREE.LineBasicMaterial).color.set(style.color);
        (line.material as THREE.LineBasicMaterial).linewidth = 2;
      }
    });
  }

  // Raycaster pour clics
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function handleClick(event: MouseEvent) {
    const canvas = fgRef.current.renderer().domElement;
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, fgRef.current.camera());
    const intersects = raycaster.intersectObjects(curves.map(c => c.line));

    if (intersects.length > 0) {
      const linkId = intersects[0].object.userData.linkId;
      onLinkClick(linkId);
    }
  }

  fgRef.current.renderer().domElement.addEventListener('click', handleClick);

  function animate() {
    updateCurvesIfNeeded();
    requestAnimationFrame(animate);
  }
  animate();
}

