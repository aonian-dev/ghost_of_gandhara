'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Key } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigationData } from '@/hooks/use-navigation-data';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const pathname = usePathname();
  const { books, poems } = useNavigationData();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        <Link href="/" className="flex items-center space-x-2">
          <span className="heading-spaced text-lg sm:text-xl font-bold tracking-widest text-primary text-shadow-glow">
            GHOST OF GANDHARA
          </span>
        </Link>

        <div className="hidden md:flex flex-1 items-center justify-center gap-8">
          <Link
            href="/"
            className={cn(
              'text-lg transition-colors hover:text-primary',
              pathname === '/' ? 'text-primary' : 'text-foreground/80'
            )}
          >
            Home
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'text-lg transition-colors hover:text-primary focus:outline-none',
                  pathname.startsWith('/books') ? 'text-primary' : 'text-foreground/80'
                )}
              >
                Books
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56 bg-card border-border/50">
              <DropdownMenuItem asChild>
                <Link href="/books" className="w-full cursor-pointer text-base font-serif italic text-primary/80 hover:text-primary">
                  View All Books
                </Link>
              </DropdownMenuItem>
              {books.map((book) => (
                <DropdownMenuItem key={book.id} asChild>
                  <Link href={`/books/${book.slug}`} className="w-full cursor-pointer font-serif">
                    {book.title}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'text-lg transition-colors hover:text-primary focus:outline-none',
                  pathname.startsWith('/poems') ? 'text-primary' : 'text-foreground/80'
                )}
              >
                Poems
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56 bg-card border-border/50">
              <DropdownMenuItem asChild>
                <Link href="/poems" className="w-full cursor-pointer text-base font-serif italic text-primary/80 hover:text-primary">
                  View All Poems
                </Link>
              </DropdownMenuItem>
              {poems.map((poem) => (
                <DropdownMenuItem key={poem.id} asChild>
                  <Link href={`/poems/${poem.slug}`} className="w-full cursor-pointer font-serif">
                    {poem.title}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild className="hover:bg-primary/20 hover:text-primary">
            <Link href="/admin">
              <Key className="h-5 w-5" />
              <span className="sr-only">Admin</span>
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
