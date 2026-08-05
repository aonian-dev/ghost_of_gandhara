'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Book, Poem } from '@/types';

export function useNavigationData() {
  const [books, setBooks] = useState<Pick<Book, 'id' | 'title' | 'slug'>[]>([]);
  const [poems, setPoems] = useState<Pick<Poem, 'id' | 'title' | 'slug'>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [booksRes, poemsRes] = await Promise.all([
          supabase
            .from('books')
            .select('id, title, slug')
            .eq('published', true)
            .order('created_at', { ascending: false }),
          supabase
            .from('poems')
            .select('id, title, slug')
            .eq('published', true)
            .order('created_at', { ascending: false })
        ]);

        if (booksRes.data) setBooks(booksRes.data);
        if (poemsRes.data) setPoems(poemsRes.data);
      } catch (error) {
        console.error('Error fetching navigation data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { books, poems, loading };
}
