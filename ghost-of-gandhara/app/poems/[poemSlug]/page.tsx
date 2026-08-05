'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { supabase } from '@/lib/supabase';
import { Poem } from '@/types';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PoemReaderPage() {
  const params = useParams<{ poemSlug: string }>();
  const [poem, setPoem] = useState<Poem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPoem() {
      if (!params?.poemSlug) return;

      const { data } = await supabase
        .from('poems')
        .select('*')
        .eq('slug', params.poemSlug)
        .single();

      if (data) setPoem(data);
      setLoading(false);
    }
    fetchPoem();
  }, [params?.poemSlug]);

  if (loading) {
    return (
      <PageLayout>
        <div className="flex min-h-screen items-center justify-center text-primary">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageLayout>
    );
  }

  if (!poem) {
    return (
      <PageLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <h1 className="font-serif text-4xl mb-4">Poem not found</h1>
          <Button variant="link" asChild><Link href="/poems">Return to Archive</Link></Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen py-16 md:py-24 bg-[url('/hero-bg.jpg')] bg-cover bg-center bg-fixed bg-no-repeat relative">
        <div className="absolute inset-0 bg-background/95 backdrop-blur-[2px]" />
        
        <div className="container relative z-10 mx-auto px-6 max-w-4xl">
          <div className="mb-12">
            <Link 
              href="/poems"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-sans text-sm tracking-wide uppercase"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Archive
            </Link>
          </div>

          <article className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <header className="text-center mb-20">
              <h1 className="font-serif text-4xl md:text-5xl lg:text-7xl mb-8 text-primary text-shadow-glow">
                {poem.title}
              </h1>
              <div className="divider-ornate text-primary/40 mx-auto">✦</div>
            </header>

            <div className="max-w-2xl mx-auto bg-card/40 backdrop-blur-md p-8 md:p-16 border border-border/30 rounded-sm shadow-2xl">
              <div className="font-serif text-xl md:text-2xl leading-loose md:leading-[2.5] text-foreground/90 whitespace-pre-wrap selection:bg-primary/30 selection:text-primary text-center">
                {poem.content}
              </div>
            </div>
            
            <div className="mt-20 flex justify-center">
               <div className="divider-ornate text-primary/20 w-48">✦</div>
            </div>
          </article>
        </div>
      </div>
    </PageLayout>
  );
}
