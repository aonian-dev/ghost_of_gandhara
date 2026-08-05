'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: error.message,
      });
      setLoading(false);
    } else {
      toast({
        title: 'Welcome Back',
        description: 'Successfully authenticated.',
      });
      router.push('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/40 shadow-2xl bg-card">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center">
             <span className="text-primary text-xl">✦</span>
          </div>
          <CardTitle className="font-serif text-3xl">Librarian Access</CardTitle>
          <CardDescription className="font-sans">Enter your credentials to manage the archives.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-sans text-xs tracking-widest uppercase">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="librarian@gandhara.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background/50 border-border/50 focus-visible:ring-primary h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-sans text-xs tracking-widest uppercase">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background/50 border-border/50 focus-visible:ring-primary h-11"
              />
            </div>
            <Button type="submit" className="w-full h-11 font-sans tracking-widest" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Enter Archive'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
