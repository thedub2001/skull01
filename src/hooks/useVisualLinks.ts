import { useState, useEffect } from 'react';
import type { VisualLinkType } from '@/types/visualLinkTypes';
import { supabase } from '@/lib/supabaseClient';

export function useVisualLinks() {
  const [links, setLinks] = useState<VisualLinkType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLinks();
  }, []);

  async function fetchLinks() {
    setLoading(true);
    const { data, error } = await supabase
      .from('visual_links')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[data] error fetching visual_links:', error);
    } else {
      setLinks(data || []);
    }

    setLoading(false);
  }

  async function addVisualLink(link: Omit<VisualLinkType, 'id' | 'created_at'>) {
    const { sourceId, targetId, type, metadata } = link;

    const { data, error } = await supabase
      .from('visual_links')
      .insert([{ sourceId, targetId, type, metadata }])
      .select();

    if (error) {
      console.error('[data] error inserting visual_link:', error);
    } else if (data) {
      setLinks(prev => [...data, ...prev]);
    }
  }

  async function deleteVisualLink(id: string) {
    const { error } = await supabase
      .from('visual_links')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[data] error deleting visual_link:', error);
    } else {
      setLinks(prev => prev.filter(link => link.id !== id));
    }
  }

  return {
    links,
    loading,
    fetchLinks,
    addVisualLink,
    deleteVisualLink,
  };
}
