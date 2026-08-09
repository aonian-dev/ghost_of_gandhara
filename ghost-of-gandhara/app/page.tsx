'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageLayout } from '@/components/layout/PageLayout';
import { supabase } from '@/lib/supabase';
import { Book, Poem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [poems, setPoems] = useState<Poem[]>([]);

  useEffect(() => {
    async function fetchHomeData() {
      const { data: booksData } = await supabase
        .from('books')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(3);

      const { data: poemsData } = await supabase
        .from('poems')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (booksData) setBooks(booksData);
      if (poemsData) setPoems(poemsData);
    }
    fetchHomeData();
  }, []);

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-bg.jpg"
            alt="Hero background"
            className="h-full w-full object-cover opacity-30 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background" />
        </div>
        
        <div className="container relative z-10 mx-auto px-6 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="mb-6 font-serif text-6xl md:text-8xl lg:text-9xl tracking-tight text-foreground text-shadow-glow">
            Ghost of Gandhara
          </h1>
          <p className="mx-auto mb-12 max-w-2xl font-serif text-xl md:text-2xl italic text-foreground/80 leading-relaxed">
            Ghost of Gandhara è il progetto di uno scrittore underground del Sud Italia, le cui ispirazioni includono letteratura greca classica, scritti buddhisti, letteratura Russa e Sovietica, romanticismo francese e tedesco. <br/>

          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button size="lg" className="h-14 px-8 text-lg font-sans tracking-wide" asChild>
              <Link href="/books">Prosa</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-sans tracking-wide" asChild>
              <Link href="/poems">Poesia</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Recent Books */}
      {books.length > 0 && (
        <section className="py-24 bg-background">
          <div className="container mx-auto px-6">
            <div className="mb-16 text-center">
              <h2 className="heading-spaced text-sm md:text-base">Recent Tomes</h2>
              <div className="divider-ornate text-primary mx-auto">✦</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {books.map((book) => (
                <Link key={book.id} href={`/books/${book.slug}`} className="group block">
                  <div className="flex flex-col h-full bg-card/30 border border-border/40 hover:border-primary/50 transition-colors p-6">
                    <div className="aspect-[2/3] w-full mb-6 overflow-hidden bg-muted/20 relative shadow-2xl">
                      <img
                        src={book.cover_image_url || '/book-cover-placeholder.jpg'}
                        alt={book.title}
                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105 group-hover:opacity-80"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    <h3 className="font-serif text-3xl mb-3 group-hover:text-primary transition-colors">{book.title}</h3>
                    <p className="font-sans text-sm text-muted-foreground line-clamp-3 leading-relaxed flex-1">
                      {book.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Poems */}
      {poems.length > 0 && (
        <section className="py-24 bg-card/20 border-t border-border/30">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="mb-16 text-center">
              <h2 className="heading-spaced text-sm md:text-base">Latest Verses</h2>
              <div className="divider-ornate text-primary mx-auto">✦</div>
            </div>
            <div className="space-y-8">
              {poems.map((poem) => (
                <Link key={poem.id} href={`/poems/${poem.slug}`} className="group block">
                  <Card className="bg-transparent border-border/40 hover:border-primary/30 transition-colors shadow-none rounded-none">
                    <CardContent className="p-8 md:p-12 text-center flex flex-col items-center">
                      <h3 className="font-serif text-3xl md:text-4xl mb-6 group-hover:text-primary transition-colors">{poem.title}</h3>
                      <p className="font-serif text-lg md:text-xl italic text-foreground/70 leading-loose max-w-2xl mx-auto">
                        "{poem.excerpt || poem.content.substring(0, 100) + '...'}"
                      </p>
                      <div className="mt-8 w-8 h-px bg-primary/40 group-hover:w-16 group-hover:bg-primary transition-all duration-500" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="mt-16 text-center">
              <Button variant="link" className="text-primary hover:text-primary/80 font-sans tracking-widest uppercase text-sm" asChild>
                <Link href="/poems">View the full archive &rarr;</Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </PageLayout>
  );
}
