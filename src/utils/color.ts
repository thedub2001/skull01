/**
 * Retourne une couleur HSL en fonction du niveau du nœud.
 */
export function levelToColor(level: number, hueStep: number = 47): string {
  const baseHue = 60;
  const hue = (baseHue + level * hueStep) % 360;
  const saturation = 80;
  const lightness = level % 2 === 0 ? 45 : 65;
  console.log("[levelToColor] level:", level, "hueStep:", hueStep, "hue:", hue);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

  