'use client';

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background py-12">
      <div className="container mx-auto flex flex-col items-center justify-center space-y-4 px-6 text-center">
        <div className="divider-ornate w-32 mx-auto text-primary/50">✦</div>
        <p className="font-serif text-lg tracking-wide text-foreground/80">
          Ghost of Gandhara
        </p>
        <p className="text-sm font-sans text-muted-foreground">
          &copy; {new Date().getFullYear()} All rights reserved.
        </p>
      </div>
    </footer>
  );
}
