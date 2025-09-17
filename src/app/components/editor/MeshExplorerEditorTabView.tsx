import React from "react";
import GraphWrapper from "./GraphWrapper";
import { useMoleculeSettings } from "../../hooks/useMoleculeSettings";
import { useGraphSelection } from "../../hooks/useGraphSelection";
import { useGraphDataSync } from "../../hooks/useGraphDataSync";
import { useGraphInitialFetch } from "../../hooks/useGraphInitialFetch";
import useCameraTracker from "../../hooks/useCameraTracker";
import { useNodeLabelGenerator } from "../../hooks/useNodeLabelGenerator";
import { addChildNodeHandler, deleteNodeRecursive } from "../../utils/nodeHandlers";
import useLabelSprite from "./LabelSprite";
import { fetchNodes, addNode as adapterAddNode, deleteNode as adapterDeleteNode, fetchLinks, addLink as adapterAddLink, deleteLink as adapterDeleteLink, fetchVisualLinks, addVisualLink as adapterAddVisualLink, deleteVisualLink as adapterDeleteVisualLink } from "../../db/adapter";
import type { ForceGraphMethods } from "react-force-graph-3d";
import type { NodeType, LinkType, VisualLinkType } from "../../types/types";
import { closeMeshExplorerAuxiliaryBar, meshExplorerAuxiliaryBar } from "../../meshExplorerAuxiliaryBar";
import { v4 as uuidv4 } from "uuid";

const DEBUG_MODE = true;
const PREFIX = "[MeshExplorerEditorTabView]";

function dbg(...args: unknown[]) {
  if (DEBUG_MODE) console.log(PREFIX, ...args);
}

/**
 * Composant React principal affiché dans l’onglet Mesh Explorer.
 */
export default function MeshExplorerEditorTabView() {
  const { dbMode, dataset } = useMoleculeSettings();
  const [nodes, setNodes] = React.useState<NodeType[]>([]);
  const [links, setLinks] = React.useState<LinkType[]>([]);
  const [visualLinks, setVisualLinks] = React.useState<VisualLinkType[]>([]);
  const {
    selectedNodes,
    selectedLinks,
    selectedNodeObjects,
    selectedLinkObjects,
    setSelectedNodes,
    setSelectedLinks,
    getLinkId,
    onNodeClick,
    onLinkClick,
  } = useGraphSelection(nodes, links);

  const fgRef = React.useRef<ForceGraphMethods<NodeType, LinkType> | null>(null);
  const graphData = useGraphDataSync(nodes, links);

  const cameraPos = useCameraTracker(fgRef);
  const generateTextLabel = useNodeLabelGenerator();
  const nodeThreeObject = useLabelSprite({ cameraPos, generateTextLabel });

  // Fetch nodes
  const fetchNodesFn = React.useCallback(async () => {
    if (!dataset) {
      dbg("no dataset selected -> returning []");
      setNodes([]);
      return;
    }
    try {
      const fetchedNodes = await fetchNodes(dbMode, dataset);
      setNodes(fetchedNodes);
      dbg("loaded nodes count=", fetchedNodes.length);
    } catch (err) {
      console.error(PREFIX, "fetchNodes ERROR:", err);
      setNodes([]);
    }
  }, [dbMode, dataset]);

  // Fetch links
  const fetchLinksFn = React.useCallback(async () => {
    if (!dataset) {
      dbg("no dataset selected -> returning []");
      setLinks([]);
      return;
    }
    try {
      const fetchedLinks = await fetchLinks(dbMode, dataset);
      setLinks(fetchedLinks);
      dbg("loaded links count=", fetchedLinks.length);
    } catch (err) {
      console.error(PREFIX, "fetchLinks ERROR:", err);
      setLinks([]);
    }
  }, [dbMode, dataset]);

  // Fetch visual links
  const fetchVisualLinksFn = React.useCallback(async (filterType?: string) => {
    if (!dataset) {
      dbg("no dataset selected -> returning []");
      setVisualLinks([]);
      return;
    }
    try {
      const fetchedVisualLinks = await fetchVisualLinks(dbMode, dataset, filterType);
      setVisualLinks(fetchedVisualLinks);
      dbg("loaded visualLinks count=", fetchedVisualLinks.length);
    } catch (err) {
      console.error(PREFIX, "fetchVisualLinks ERROR:", err);
      setVisualLinks([]);
    }
  }, [dbMode, dataset]);

  // Add node
  const addNode = React.useCallback(
    async (label: string, type?: string | null, level?: number): Promise<NodeType | null> => {
      if (!dataset) {
        console.error(PREFIX, "addNode ERROR: No dataset selected");
        return null;
      }
      const newNode: NodeType = {
        id: uuidv4(),
        label,
        dataset,
        level: level ?? 0,
      } as NodeType;

      dbg("addNode", { dbMode, newNode });

      try {
        await adapterAddNode(dbMode, newNode);
        setNodes((prev) => [...prev, newNode]);
        return newNode;
      } catch (err) {
        console.error(PREFIX, "addNode ERROR:", err);
        return null;
      }
    },
    [dbMode, dataset]
  );

  // Add link
  const addLink = React.useCallback(
    async (source: string, target: string, type?: string | null): Promise<LinkType | null> => {
      if (!dataset) {
        console.error(PREFIX, "addLink ERROR: No dataset selected");
        return null;
      }
      const newLink: LinkType = {
        id: uuidv4(),
        source,
        target,
        dataset,
        type,
      } as LinkType;

      dbg("addLink", { dbMode, newLink });

      try {
        await adapterAddLink(dbMode, newLink);
        setLinks((prev) => [...prev, newLink]);
        return newLink;
      } catch (err) {
        console.error(PREFIX, "addLink ERROR:", err);
        return null;
      }
    },
    [dbMode, dataset]
  );

  // Add visual link
  const addVisualLink = React.useCallback(
    async (
      source: string,
      target: string,
      type: string | null,
      metadata?: Record<string, unknown>,
      created_at?: string
    ): Promise<VisualLinkType | null> => {
      if (!dataset) {
        console.error(PREFIX, "addVisualLink ERROR: No dataset selected");
        return null;
      }
      const newVL: VisualLinkType = {
        id: uuidv4(),
        source,
        target,
        dataset,
        type,
        metadata: metadata ?? {},
        created_at: created_at ?? new Date().toISOString(),
      };

      dbg("addVisualLink", { dbMode, newVL });

      try {
        await adapterAddVisualLink(dbMode, newVL);
        setVisualLinks((prev) => [...prev, newVL]);
        return newVL;
      } catch (err) {
        console.error(PREFIX, "addVisualLink ERROR:", err);
        return null;
      }
    },
    [dbMode, dataset]
  );

  // Delete node
  const deleteNode = React.useCallback(
    async (id: string): Promise<boolean> => {
      dbg("deleteNode", { dbMode, id });
      try {
        await adapterDeleteNode(dbMode, id);
        setNodes((prev) => prev.filter((n) => n.id !== id));
        return true;
      } catch (err) {
        console.error(PREFIX, "deleteNode ERROR:", err);
        return false;
      }
    },
    [dbMode]
  );

  // Delete link
  const deleteLink = React.useCallback(
    async (id: string): Promise<boolean> => {
      dbg("deleteLink", { dbMode, id });
      try {
        await adapterDeleteLink(dbMode, id);
        setLinks((prev) => prev.filter((l) => l.id !== id));
        return true;
      } catch (err) {
        console.error(PREFIX, "deleteLink ERROR:", err);
        return false;
      }
    },
    [dbMode]
  );

  // Delete visual link
  const deleteVisualLink = React.useCallback(
    async (id: string): Promise<boolean> => {
      dbg("deleteVisualLink", { dbMode, id });
      try {
        await adapterDeleteVisualLink(dbMode, id);
        setVisualLinks((prev) => prev.filter((vl) => vl.id !== id));
        return true;
      } catch (err) {
        console.error(PREFIX, "deleteVisualLink ERROR:", err);
        return false;
      }
    },
    [dbMode]
  );

  // Initial fetch
  useGraphInitialFetch(fetchNodesFn, fetchLinksFn, fetchVisualLinksFn);

  // Synchronisation avec l'AuxiliaryBar
  React.useEffect(() => {
    if (selectedNodeObjects.length === 0 && selectedLinkObjects.length === 0) {
      closeMeshExplorerAuxiliaryBar();
      return;
    }

    meshExplorerAuxiliaryBar({
      selectedNodes: selectedNodeObjects,
      selectedLinks: selectedLinkObjects,
      nodes,
      links,
      onClose: () => {
        setSelectedNodes(new Set());
        setSelectedLinks(new Set());
      },
      onCreateChildNode: async (parentId) => {
        await addChildNodeHandler(parentId, nodes, addNode, addLink);
      },
      onDeleteNode: async (nodeId) => {
        await deleteNodeRecursive(
          nodeId,
          nodes,
          links,
          deleteNode,
          deleteLink,
          visualLinks,
          deleteVisualLink // Use deleteVisualLink (aliased as removeVisualLink for compatibility)
        );
      },
    });
  }, [selectedNodeObjects, selectedLinkObjects, nodes, links, visualLinks, addNode, deleteNode, addLink, deleteLink, deleteVisualLink]);

  // Resize observer
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
        console.debug("[GraphWrapper] resize", width, height);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <GraphWrapper
        fgRef={fgRef}
        width={size.width}
        height={size.height}
        graphData={graphData}
        selectedNodes={selectedNodes}
        selectedLinks={selectedLinks}
        setSelectedLinks={setSelectedLinks}
        getLinkId={getLinkId}
        nodeThreeObject={nodeThreeObject}
        onNodeClick={onNodeClick}
        onLinkClick={onLinkClick}
        visualLinks={visualLinks}
      />
    </div>
  );
}