'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { supabase } from '@/lib/supabase';
import { Book, Chapter } from '@/types';
import { Loader2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BookDetailPage() {
  const params = useParams<{ bookSlug: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookAndChapters() {
      if (!params?.bookSlug) return;

      const { data: bookData } = await supabase
        .from('books')
        .select('*')
        .eq('slug', params.bookSlug)
        .single();

      if (bookData) {
        setBook(bookData);
        const { data: chaptersData } = await supabase
          .from('chapters')
          .select('id, title, slug, order_index')
          .eq('book_id', bookData.id)
          .order('order_index', { ascending: true });
        
        if (chaptersData) setChapters(chaptersData as Chapter[]);
      }
      setLoading(false);
    }
    fetchBookAndChapters();
  }, [params?.bookSlug]);

  if (loading) {
    return (
      <PageLayout>
        <div className="flex min-h-[60vh] items-center justify-center text-primary">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageLayout>
    );
  }

  if (!book) {
    return (
      <PageLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <h1 className="font-serif text-4xl mb-4">Book not found</h1>
          <Button variant="link" asChild><Link href="/books">Return to Library</Link></Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-6 py-16 md:py-24 min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          <div className="lg:col-span-4 flex flex-col items-center lg:items-end">
            <div className="w-full max-w-sm sticky top-32">
              <div className="aspect-[2/3] w-full shadow-2xl border border-border/40 relative">
                <img
                  src={book.cover_image_url || '/book-cover-placeholder.jpg'}
                  alt={book.title}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl mb-8 leading-tight">
                {book.title}
              </h1>
              
              <div className="prose prose-invert prose-p:font-serif prose-p:text-lg prose-p:leading-relaxed prose-p:text-foreground/80 max-w-3xl mb-16">
                {book.description?.split('\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>

              <div className="max-w-3xl">
                <h2 className="heading-spaced text-sm mb-8 flex items-center gap-4 text-primary">
                  <BookOpen className="w-4 h-4" /> Table of Contents
                </h2>
                
                <div className="space-y-4">
                  {chapters.length === 0 ? (
                    <p className="font-serif italic text-muted-foreground">Chapters are being scribed...</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {chapters.map((chapter) => (
                        <Link 
                          key={chapter.id} 
                          href={`/books/${book.slug}/${chapter.slug}`}
                          className="group flex items-baseline gap-4 py-3 border-b border-border/30 hover:border-primary/50 transition-colors"
                        >
                          <span className="font-sans text-xs text-primary/60 w-8">
                            {chapter.order_index.toString().padStart(2, '0')}
                          </span>
                          <span className="font-serif text-xl md:text-2xl group-hover:text-primary transition-colors">
                            {chapter.title}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                
                {chapters.length > 0 && (
                  <div className="mt-12">
                    <Button size="lg" className="font-sans tracking-wide px-8" asChild>
                      <Link href={`/books/${book.slug}/${chapters[0].slug}`}>
                        Begin Reading
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </PageLayout>
  );
}
