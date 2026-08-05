'use client';

import Link from 'next/link';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <PageLayout>
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-6 relative overflow-hidden">
        
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <div className="w-[800px] h-[800px] border border-foreground rounded-full animate-[spin_60s_linear_infinite]" />
          <div className="w-[600px] h-[600px] border border-foreground rounded-full absolute animate-[spin_40s_linear_infinite_reverse]" />
          <div className="w-[400px] h-[400px] border border-foreground rounded-full absolute animate-[spin_20s_linear_infinite]" />
        </div>

        <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="font-serif text-8xl md:text-9xl text-primary text-shadow-glow mb-6">404</h1>
          <h2 className="font-serif text-2xl md:text-3xl italic text-foreground/80 mb-8">
            This page has been lost to the sands of time.
          </h2>
          <div className="divider-ornate text-primary/50 mx-auto w-32 mb-12">✦</div>
          <Button size="lg" className="font-sans tracking-wide" asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
