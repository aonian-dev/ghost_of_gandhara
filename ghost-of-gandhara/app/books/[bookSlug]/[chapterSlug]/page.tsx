'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { supabase } from '@/lib/supabase';
import { Book, Chapter } from '@/types';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ChapterReaderPage() {
  const params = useParams<{ bookSlug: string; chapterSlug: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [prevChapter, setPrevChapter] = useState<Chapter | null>(null);
  const [nextChapter, setNextChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReaderData() {
      if (!params?.bookSlug || !params?.chapterSlug) return;

      const { data: bookData } = await supabase
        .from('books')
        .select('*')
        .eq('slug', params.bookSlug)
        .single();

      if (bookData) {
        setBook(bookData);
        
        const { data: allChapters } = await supabase
          .from('chapters')
          .select('*')
          .eq('book_id', bookData.id)
          .order('order_index', { ascending: true });

        if (allChapters) {
          const currentIndex = allChapters.findIndex(c => c.slug === params.chapterSlug);
          if (currentIndex !== -1) {
            setChapter(allChapters[currentIndex]);
            setPrevChapter(currentIndex > 0 ? allChapters[currentIndex - 1] : null);
            setNextChapter(currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null);
          }
        }
      }
      setLoading(false);
    }
    fetchReaderData();
  }, [params?.bookSlug, params?.chapterSlug]);

  if (loading) {
    return (
      <PageLayout>
        <div className="flex min-h-screen items-center justify-center text-primary">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageLayout>
    );
  }

  if (!chapter || !book) {
    return (
      <PageLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <h1 className="font-serif text-4xl mb-4">Chapter not found</h1>
          <Button variant="link" asChild><Link href="/books">Return to Library</Link></Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-[#140F0A]">
        {/* Reader Header */}
        <div className="sticky top-0 z-40 bg-[#140F0A]/90 backdrop-blur-sm border-b border-border/20 py-4 px-6 flex items-center justify-between">
          <Link 
            href={`/books/${book.slug}`}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-sans text-sm tracking-wide uppercase"
          >
            <ArrowLeft className="w-4 h-4" />
            {book.title}
          </Link>
          <span className="font-serif italic text-foreground/50 hidden md:inline">
            Chapter {chapter.order_index}
          </span>
          <div className="w-[100px]" /> {/* Spacer for balance */}
        </div>

        {/* Reader Content */}
        <article className="max-w-3xl mx-auto px-6 py-16 md:py-24 animate-in fade-in duration-1000">
          <header className="text-center mb-20">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6 text-primary">
              {chapter.title}
            </h1>
            <div className="divider-ornate text-primary/40 mx-auto">✦</div>
          </header>

          <div className="prose prose-invert prose-p:font-serif prose-p:text-xl md:prose-p:text-2xl prose-p:leading-loose md:prose-p:leading-[2.2] prose-p:text-foreground/90 mx-auto w-full selection:bg-primary/20 selection:text-primary">
            {chapter.content.split('\n').map((paragraph, i) => {
              if (paragraph.trim() === '') return <br key={i} />;
              return <p key={i} className="mb-8 indent-8">{paragraph}</p>;
            })}
          </div>

          {/* Reader Footer Navigation */}
          <footer className="mt-32 pt-12 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-6">
            {prevChapter ? (
              <Link 
                href={`/books/${book.slug}/${prevChapter.slug}`}
                className="group flex flex-col items-center sm:items-start w-full sm:w-auto"
              >
                <span className="font-sans text-xs tracking-widest text-muted-foreground uppercase mb-2">Previous Chapter</span>
                <span className="font-serif text-xl group-hover:text-primary transition-colors flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> {prevChapter.title}
                </span>
              </Link>
            ) : (
              <div className="w-full sm:w-auto" />
            )}

            {nextChapter ? (
              <Link 
                href={`/books/${book.slug}/${nextChapter.slug}`}
                className="group flex flex-col items-center sm:items-end w-full sm:w-auto"
              >
                <span className="font-sans text-xs tracking-widest text-muted-foreground uppercase mb-2">Next Chapter</span>
                <span className="font-serif text-xl group-hover:text-primary transition-colors flex items-center gap-2">
                  {nextChapter.title} <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ) : (
              <Link 
                href={`/books/${book.slug}`}
                className="group flex flex-col items-center sm:items-end w-full sm:w-auto"
              >
                <span className="font-sans text-xs tracking-widest text-muted-foreground uppercase mb-2">End of Book</span>
                <span className="font-serif text-xl group-hover:text-primary transition-colors flex items-center gap-2">
                  Return to Table of Contents
                </span>
              </Link>
            )}
          </footer>
        </article>
      </div>
    </PageLayout>
  );
}
