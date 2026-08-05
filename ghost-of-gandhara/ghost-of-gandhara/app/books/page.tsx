'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageLayout } from '@/components/layout/PageLayout';
import { supabase } from '@/lib/supabase';
import { Book } from '@/types';
import { Loader2 } from 'lucide-react';

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBooks() {
      const { data } = await supabase
        .from('books')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });
      
      if (data) setBooks(data);
      setLoading(false);
    }
    fetchBooks();
  }, []);

  return (
    <PageLayout>
      <div className="container mx-auto px-6 py-24 min-h-screen">
        <div className="mb-20 text-center max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="font-serif text-5xl md:text-7xl mb-6 text-shadow-glow">The Library</h1>
          <p className="font-serif text-xl italic text-foreground/70 leading-relaxed">
            Chronicles of forgotten eras, bound in digital parchment.
          </p>
          <div className="divider-ornate text-primary mx-auto mt-8">✦</div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-primary">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground font-serif text-xl italic">
            The shelves are empty for now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {books.map((book, i) => (
              <Link 
                key={book.id} 
                href={`/books/${book.slug}`} 
                className="group flex flex-col h-full animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="aspect-[2/3] w-full mb-6 overflow-hidden bg-muted/10 border border-border/30 relative shadow-xl">
                  <img
                    src={book.cover_image_url || '/book-cover-placeholder.jpg'}
                    alt={book.title}
                    className="object-cover w-full h-full transition-all duration-700 group-hover:scale-105 group-hover:brightness-75"
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/10 pointer-events-none" />
                </div>
                <h2 className="font-serif text-2xl mb-3 group-hover:text-primary transition-colors">{book.title}</h2>
                <p className="font-sans text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {book.description}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
