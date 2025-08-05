import { supabase } from './supabase'
import type { NodeType, LinkType } from '../types/graph'

export async function fetchGraphData(): Promise<{ nodes: NodeType[]; links: LinkType[] }> {
  const { data: nodes, error: nodesError } = await supabase.from('nodes').select('*')
  const { data: links, error: linksError } = await supabase.from('links').select('*')

  if (nodesError || linksError || !nodes || !links) {
    console.error('Erreur chargement données:', nodesError || linksError)
    return { nodes: [], links: [] }
  }

  return { nodes, links }
}
