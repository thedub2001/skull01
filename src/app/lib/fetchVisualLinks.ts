import { createClient } from '@supabase/supabase-js';
import type { VisualLink } from '@/utils/addDynamicVisualLinks';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function fetchVisualLinksFromSupabase(
  filterType?: string // si tu veux récupérer uniquement un type de lien (ex: "amitié")
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
    source: row.source,
    target: row.target,
    type: row.type,
    metadata: row.metadata || {},
  })) as VisualLink[];
}
