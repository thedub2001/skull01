// src/stores/useGraphStore.ts
import { create } from 'zustand';
import type { NodeType, LinkType } from '../types/graph';

type GraphState = {
  nodes: NodeType[];
  links: LinkType[];
  setNodes: (nodes: NodeType[]) => void;
  setLinks: (links: LinkType[]) => void;
};

export const useGraphStore = create<GraphState>((set) => ({
  nodes: [],
  links: [],
  setNodes: (nodes) => set({ nodes }),
  setLinks: (links) => set({ links }),
}));
