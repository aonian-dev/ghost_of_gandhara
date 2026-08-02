'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageLayout } from '@/components/layout/PageLayout';
import { supabase } from '@/lib/supabase';
import { Poem } from '@/types';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function PoemsPage() {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPoems() {
      const { data } = await supabase
        .from('poems')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });
      
      if (data) setPoems(data);
      setLoading(false);
    }
    fetchPoems();
  }, []);

  return (
    <PageLayout>
      <div className="container mx-auto px-6 py-24 min-h-screen max-w-5xl">
        <div className="mb-24 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="font-serif text-5xl md:text-7xl mb-6 text-shadow-glow">The Poetry Archive</h1>
          <p className="font-serif text-xl italic text-foreground/70">
            Fragments of thought, carved in ink.
          </p>
          <div className="divider-ornate text-primary mx-auto mt-8">✦</div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-primary">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : poems.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground font-serif text-xl italic">
            No verses have been transcribed yet.
          </div>
        ) : (
          <div className="space-y-16">
            {poems.map((poem, i) => (
              <div 
                key={poem.id}
                className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <Link href={`/poems/${poem.slug}`} className="group block">
                  <div className="border-l border-primary/20 pl-8 md:pl-12 py-4 hover:border-primary transition-colors duration-500">
                    <h2 className="font-serif text-3xl md:text-4xl mb-4 group-hover:text-primary transition-colors">
                      {poem.title}
                    </h2>
                    <p className="font-serif text-lg md:text-xl italic text-muted-foreground leading-relaxed">
                      "{poem.excerpt || poem.content.substring(0, 150) + '...'}"
                    </p>
                    <div className="mt-6 font-sans text-xs tracking-widest uppercase text-primary/60 group-hover:text-primary transition-colors flex items-center gap-2">
                      Read full poem <span className="opacity-0 group-hover:opacity-100 transition-opacity transition-transform transform translate-x-0 group-hover:translate-x-1">&rarr;</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
