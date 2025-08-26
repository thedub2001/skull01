/**
 * ========================
 * Types pour la Base de Données (Supabase)
 * ========================
 * Ces types reflètent EXACTEMENT la structure SQL des tables.
 * Ils sont utilisés uniquement pour les opérations avec Supabase.
 */

 export interface DBNode {
  id: string;            // uuid
  label: string;         // text NOT NULL
  type: string | null;   // text
  x?: number | null;     // real
  y?: number | null;     // real
  fx?: number | null;    // real
  fy?: number | null;    // real
  level?: number | null; // integer
}

export interface DBLink {
  id: string;             // uuid
  source: string;         // uuid NOT NULL
  target: string;          // uuid
  type: string | null;    // text
}

/**
 * ========================
 * Types pour l'Application (React + 3d-force-graph)
 * ========================
 * Ces types sont dérivés des DB-types mais adaptés à la visualisation :
 * - `source` et `target` peuvent être soit des UUID (string),
 *   soit des objets NodeType complets.
 */

export interface NodeType extends DBNode {}

export interface LinkType {
  id: string;
  source: string | NodeType;
  target: string | NodeType;
  type?: string | null;
}

/**
 * utilitaire de debug
 */
export const test = "ok";
