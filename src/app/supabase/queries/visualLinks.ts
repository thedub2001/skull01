import { supabase } from '../client'
import type { VisualLinkType } from '@/types/VisualLinkType'

export async function getAllVisualLinks(): Promise<VisualLinkType[]> {
  const { data, error } = await supabase
    .from('visual_links')
    .select('*')

  if (error) throw error
  return data
}
