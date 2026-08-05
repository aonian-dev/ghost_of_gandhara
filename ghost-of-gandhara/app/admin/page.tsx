'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { Book, Poem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LogOut, Plus, Book as BookIcon, Feather, Loader2, Edit3, Globe, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [books, setBooks] = useState<Book[]>([]);
  const [poems, setPoems] = useState<Poem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchAdminData();
    }
  }, [user]);

  async function fetchAdminData() {
    setDataLoading(true);
    const [booksRes, poemsRes] = await Promise.all([
      supabase.from('books').select('*').order('created_at', { ascending: false }),
      supabase.from('poems').select('*').order('created_at', { ascending: false })
    ]);

    if (booksRes.data) setBooks(booksRes.data);
    if (poemsRes.data) setPoems(poemsRes.data);
    setDataLoading(false);
  }

  const toggleBookPublish = async (book: Book) => {
    const { error } = await supabase
      .from('books')
      .update({ published: !book.published })
      .eq('id', book.id);
      
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      setBooks(books.map(b => b.id === book.id ? { ...b, published: !b.published } : b));
      toast({ title: 'Success', description: `Book ${!book.published ? 'published' : 'unpublished'}` });
    }
  };

  const togglePoemPublish = async (poem: Poem) => {
    const { error } = await supabase
      .from('poems')
      .update({ published: !poem.published })
      .eq('id', poem.id);
      
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      setPoems(poems.map(p => p.id === poem.id ? { ...p, published: !p.published } : p));
      toast({ title: 'Success', description: `Poem ${!poem.published ? 'published' : 'unpublished'}` });
    }
  };

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-card/50">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-serif text-2xl text-primary hover:text-primary/80 transition-colors">
              Gandhara Admin
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:inline">{user.email}</span>
            <Button variant="outline" size="sm" onClick={() => { signOut(); router.push('/'); }}>
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-6xl">
        {dataLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Books Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-3xl flex items-center gap-3">
                  <BookIcon className="w-6 h-6 text-primary" /> Books
                </h2>
                <Button size="sm" asChild>
                  <Link href="/admin/books/new">
                    <Plus className="w-4 h-4 mr-2" /> New Book
                  </Link>
                </Button>
              </div>

              <Card className="bg-transparent border-border/40">
                <CardContent className="p-0 divide-y divide-border/30">
                  {books.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground italic">No books found.</div>
                  ) : (
                    books.map((book) => (
                      <div key={book.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/10 transition-colors">
                        <div>
                          <h3 className="font-serif text-xl mb-1">{book.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>/{book.slug}</span>
                            {book.published ? (
                              <span className="flex items-center text-emerald-500/80"><Globe className="w-3 h-3 mr-1" /> Published</span>
                            ) : (
                              <span className="flex items-center text-amber-500/80"><EyeOff className="w-3 h-3 mr-1" /> Draft</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => toggleBookPublish(book)}>
                            {book.published ? 'Unpublish' : 'Publish'}
                          </Button>
                          <Button variant="secondary" size="sm" asChild>
                            <Link href={`/admin/books/${book.id}`}><Edit3 className="w-4 h-4" /></Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Poems Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-3xl flex items-center gap-3">
                  <Feather className="w-6 h-6 text-primary" /> Poems
                </h2>
                <Button size="sm" asChild>
                  <Link href="/admin/poems/new">
                    <Plus className="w-4 h-4 mr-2" /> New Poem
                  </Link>
                </Button>
              </div>

              <Card className="bg-transparent border-border/40">
                <CardContent className="p-0 divide-y divide-border/30">
                  {poems.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground italic">No poems found.</div>
                  ) : (
                    poems.map((poem) => (
                      <div key={poem.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/10 transition-colors">
                        <div>
                          <h3 className="font-serif text-xl mb-1">{poem.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>/{poem.slug}</span>
                            {poem.published ? (
                              <span className="flex items-center text-emerald-500/80"><Globe className="w-3 h-3 mr-1" /> Published</span>
                            ) : (
                              <span className="flex items-center text-amber-500/80"><EyeOff className="w-3 h-3 mr-1" /> Draft</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => togglePoemPublish(poem)}>
                            {poem.published ? 'Unpublish' : 'Publish'}
                          </Button>
                          <Button variant="secondary" size="sm" asChild>
                            <Link href={`/admin/poems/${poem.id}`}><Edit3 className="w-4 h-4" /></Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
