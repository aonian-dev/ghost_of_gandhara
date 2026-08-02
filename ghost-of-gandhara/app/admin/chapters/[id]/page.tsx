'use client';

export const dynamic = 'force-static';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { Chapter } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminChapterEditor() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const bookId = searchParams?.get('book_id');
  const isNew = !params?.id || params.id === 'new';
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Chapter>>({
    title: '',
    slug: '',
    content: '',
    order_index: 1,
    book_id: bookId || '',
  });

  useEffect(() => {
    if (!authLoading && !user) router.push('/admin/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (isNew) {
      if (!bookId) {
        toast({ variant: 'destructive', title: 'Error', description: 'Missing book context.' });
        router.push('/admin');
        return;
      }
      
      // Auto-set next order index
      supabase.from('chapters').select('order_index').eq('book_id', bookId).order('order_index', { ascending: false }).limit(1)
        .then(({ data }) => {
          if (data && data.length > 0) {
            setFormData(prev => ({ ...prev, order_index: data[0].order_index + 1 }));
          }
          setLoading(false);
        });
      return;
    }

    async function fetchData() {
      if (!params?.id) return;
      const { data, error } = await supabase.from('chapters').select('*').eq('id', params.id).single();
      if (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load chapter.' });
        router.push('/admin');
        return;
      }
      setFormData(data);
      setLoading(false);
    }
    fetchData();
  }, [isNew, params?.id, bookId, router, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'order_index' ? parseInt(value) || 0 : value 
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const dataToSave = {
      ...formData,
      title: formData.title || 'Untitled',
      slug: formData.slug || `chapter-${Date.now()}`,
    };

    let result;
    if (isNew) {
      result = await supabase.from('chapters').insert([dataToSave]).select().single();
    } else {
      result = await supabase.from('chapters').update(dataToSave).eq('id', params.id).select().single();
    }

    setSaving(false);

    if (result.error) {
      toast({ variant: 'destructive', title: 'Save Failed', description: result.error.message });
    } else {
      toast({ title: 'Success', description: 'Chapter saved successfully.' });
      router.push(`/admin/books/${formData.book_id}`);
    }
  };

  if (loading || authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/40 bg-card/50 sticky top-0 z-10">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/admin/books/${formData.book_id}`}><ArrowLeft className="w-5 h-5" /></Link>
            </Button>
            <h1 className="font-serif text-xl">{isNew ? 'Scribe New Chapter' : 'Edit Chapter'}</h1>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Chapter
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-8 max-w-5xl flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title">Chapter Title</Label>
            <Input id="title" name="title" value={formData.title || ''} onChange={handleChange} className="bg-background/50 font-serif text-lg" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" value={formData.slug || ''} onChange={handleChange} className="bg-background/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="order_index">Order (Chapter #)</Label>
            <Input id="order_index" name="order_index" type="number" value={formData.order_index || 0} onChange={handleChange} className="bg-background/50" />
          </div>
        </div>
        
        <div className="space-y-2 flex-1 flex flex-col min-h-[500px]">
          <Label htmlFor="content">Manuscript Content (Markdown supported)</Label>
          <textarea
            id="content"
            name="content"
            value={formData.content || ''}
            onChange={handleChange}
            className="flex-1 w-full rounded-md border border-input bg-background/30 px-6 py-6 text-base font-serif leading-loose shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary resize-none"
            placeholder="Once upon a midnight dreary..."
          />
        </div>
      </main>
    </div>
  );
}
