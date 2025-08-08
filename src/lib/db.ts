import { supabase } from './supabase'
import type { NodeType, LinkType } from '../types/graph'
import type { VisualLink } from '../utils/addDynamicVisualLinks';

export async function fetchGraphData(): Promise<{ nodes: NodeType[]; links: LinkType[] }> {
  const { data: nodes, error: nodesError } = await supabase.from('nodes').select('*')
  const { data: links, error: linksError } = await supabase.from('links').select('*')

  if (nodesError || linksError || !nodes || !links) {
    console.error('Erreur chargement données:', nodesError || linksError)
    return { nodes: [], links: [] }
  }

  return { nodes, links }
}

export async function fetchVisualLinks(
  filterType?: string
): Promise<VisualLink[]> {
  let query = supabase.from('visual_links').select('*');

  if (filterType) {
    query = query.eq('type', filterType);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erreur chargement visual_links:', error);
    return [];
  }

  if (!data) return [];

  return data.map((row) => ({
    id: row.id,
    source_id: row.source_id,
    target_id: row.target_id,
    type: row.type,
    metadata: row.metadata || {},
  })) as VisualLink[];
}
