/**
 * Hook pour générer des labels canvas pour les nodes 3D
 */
 export function useNodeLabelGenerator() {
    function generateTextLabel(text: string): HTMLCanvasElement {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const fontSize = 64;
  
      ctx.font = `${fontSize}px Sans-Serif`;
      const width = ctx.measureText(text).width;
  
      canvas.width = width;
      canvas.height = fontSize;
  
      ctx.font = `${fontSize}px Sans-Serif`;
      ctx.fillStyle = "white";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 0, fontSize / 2);
  
      return canvas;
    }
  
    return generateTextLabel;
  }
  