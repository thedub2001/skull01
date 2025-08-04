import { supabase } from './supabase'

export async function fetchGraphData() {
  const { data: nodes, error: nodesError } = await supabase.from('nodes').select('*')
  const { data: links, error: linksError } = await supabase.from('links').select('*')

  if (nodesError || linksError) {
    console.error('Erreur chargement données:', nodesError || linksError)
    return { nodes: [], links: [] }
  }

  return { nodes, links }
}
