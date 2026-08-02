'use client';

export const dynamic = 'force-static';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { Book, Chapter } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Plus, Loader2, Edit3, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

export default function AdminBookEditor() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const isNew = !params?.id || params.id === 'new';
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Book>>({
    title: '',
    slug: '',
    description: '',
    cover_image_url: '',
    published: false,
  });
  const [chapters, setChapters] = useState<Chapter[]>([]);

  useEffect(() => {
    if (!authLoading && !user) router.push('/admin/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      if (!params?.id) return;
      const { data: book, error } = await supabase.from('books').select('*').eq('id', params.id).single();
      if (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load book.' });
        router.push('/admin');
        return;
      }
      setFormData(book);

      const { data: chaptersData } = await supabase
        .from('chapters')
        .select('*')
        .eq('book_id', book.id)
        .order('order_index', { ascending: true });
      
      if (chaptersData) setChapters(chaptersData);
      setLoading(false);
    }
    fetchData();
  }, [isNew, params?.id, router, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const dataToSave = {
      ...formData,
      title: formData.title || 'Untitled',
      slug: formData.slug || `book-${Date.now()}`,
    };

    let result;
    if (isNew) {
      result = await supabase.from('books').insert([dataToSave]).select().single();
    } else {
      result = await supabase.from('books').update(dataToSave).eq('id', params.id).select().single();
    }

    setSaving(false);

    if (result.error) {
      toast({ variant: 'destructive', title: 'Save Failed', description: result.error.message });
    } else {
      toast({ title: 'Success', description: 'Book saved successfully.' });
      if (isNew && result.data) {
        router.push(`/admin/books/${result.data.id}`);
      }
    }
  };

  const handleDeleteChapter = async (id: string) => {
    if (!confirm('Are you sure you want to delete this chapter?')) return;
    const { error } = await supabase.from('chapters').delete().eq('id', id);
    if (!error) {
      setChapters(chapters.filter(c => c.id !== id));
      toast({ title: 'Chapter deleted' });
    }
  };

  if (loading || authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="border-b border-border/40 bg-card/50 sticky top-0 z-10">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin"><ArrowLeft className="w-5 h-5" /></Link>
            </Button>
            <h1 className="font-serif text-xl">{isNew ? 'New Book' : 'Edit Book'}</h1>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Book
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl space-y-8">
        <Card className="bg-transparent border-border/40">
          <CardHeader>
            <CardTitle className="font-serif">Book Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" value={formData.title || ''} onChange={handleChange} className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL path)</Label>
                <Input id="slug" name="slug" value={formData.slug || ''} onChange={handleChange} className="bg-background/50" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={4}
                className="flex w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cover_image_url">Cover Image URL</Label>
              <Input id="cover_image_url" name="cover_image_url" value={formData.cover_image_url || ''} onChange={handleChange} placeholder="/hero-bg.jpg" className="bg-background/50" />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch 
                id="published" 
                checked={!!formData.published}
                onCheckedChange={(c) => setFormData(p => ({ ...p, published: c }))}
              />
              <Label htmlFor="published">Published (Visible to public)</Label>
            </div>
          </CardContent>
        </Card>

        {!isNew && (
          <Card className="bg-transparent border-border/40">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-serif">Chapters</CardTitle>
              <Button size="sm" asChild>
                <Link href={`/admin/chapters/new?book_id=${params.id}`}>
                  <Plus className="w-4 h-4 mr-2" /> Add Chapter
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {chapters.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border border-dashed border-border/50 rounded-lg">
                  No chapters yet. Create one to start writing.
                </div>
              ) : (
                <div className="space-y-2">
                  {chapters.map((chapter) => (
                    <div key={chapter.id} className="flex items-center justify-between p-4 border border-border/40 rounded-lg bg-card/30 hover:bg-card/80 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-sans text-xs font-bold">
                          {chapter.order_index}
                        </div>
                        <div>
                          <div className="font-serif text-lg">{chapter.title}</div>
                          <div className="text-xs text-muted-foreground font-sans">/{chapter.slug}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/chapters/${chapter.id}`}><Edit3 className="w-4 h-4" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteChapter(chapter.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
