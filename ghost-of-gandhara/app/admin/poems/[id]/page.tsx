'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { Poem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

export default function AdminPoemEditor() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const isNew = !params?.id || params.id === 'new';
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Poem>>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    published: false,
  });

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
      const { data, error } = await supabase.from('poems').select('*').eq('id', params.id).single();
      if (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load poem.' });
        router.push('/admin');
        return;
      }
      setFormData(data);
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
      slug: formData.slug || `poem-${Date.now()}`,
    };

    let result;
    if (isNew) {
      result = await supabase.from('poems').insert([dataToSave]).select().single();
    } else {
      result = await supabase.from('poems').update(dataToSave).eq('id', params.id).select().single();
    }

    setSaving(false);

    if (result.error) {
      toast({ variant: 'destructive', title: 'Save Failed', description: result.error.message });
    } else {
      toast({ title: 'Success', description: 'Poem saved successfully.' });
      if (isNew && result.data) {
        router.push(`/admin/poems/${result.data.id}`);
      }
    }
  };

  if (loading || authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      <header className="border-b border-border/40 bg-card/50 sticky top-0 z-10">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin"><ArrowLeft className="w-5 h-5" /></Link>
            </Button>
            <h1 className="font-serif text-xl">{isNew ? 'Pen New Poem' : 'Edit Poem'}</h1>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Verse
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-8 max-w-4xl space-y-6 flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card/30 p-6 rounded-lg border border-border/40">
          <div className="space-y-2">
            <Label htmlFor="title">Poem Title</Label>
            <Input id="title" name="title" value={formData.title || ''} onChange={handleChange} className="bg-background/50 font-serif text-lg" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" value={formData.slug || ''} onChange={handleChange} className="bg-background/50" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="excerpt">Excerpt (Short preview)</Label>
            <Input id="excerpt" name="excerpt" value={formData.excerpt || ''} onChange={handleChange} className="bg-background/50 italic font-serif" placeholder="A single line to echo in the halls..." />
          </div>
          <div className="flex items-center space-x-2 md:col-span-2 pt-2">
            <Switch 
              id="published" 
              checked={!!formData.published}
              onCheckedChange={(c) => setFormData(p => ({ ...p, published: c }))}
            />
            <Label htmlFor="published">Published (Visible to public)</Label>
          </div>
        </div>
        
        <div className="space-y-2 flex-1 flex flex-col min-h-[600px]">
          <Label htmlFor="content">Verses (Whitespace is preserved)</Label>
          <textarea
            id="content"
            name="content"
            value={formData.content || ''}
            onChange={handleChange}
            className="flex-1 w-full rounded-md border border-input bg-background/30 px-8 py-8 text-lg font-serif leading-[2.5] shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary resize-none text-center"
            placeholder="Begin transcription..."
          />
        </div>
      </main>
    </div>
  );
}
