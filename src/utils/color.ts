/**
 * Retourne une couleur HSL en fonction du niveau du nœud.
 */
 export function levelToColor(level: number): string {
    const baseHue = 60;
    const hueStep = 47;
    const hue = (baseHue + level * hueStep) % 360;
    const saturation = 80;
    const lightness = level % 2 === 0 ? 45 : 65;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }
  