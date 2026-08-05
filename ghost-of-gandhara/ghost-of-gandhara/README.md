# Ghost of Gandhara

A dark academia literary website for the pen name **Ghost of Gandhara**.

Built with **Next.js 15 App Router**, **Tailwind CSS v4**, and **Supabase**.

---

## What you need before deploying

1. **Supabase project** — create one at [supabase.com](https://supabase.com).
2. **Database schema** — open `supabase-schema.sql` in the Supabase SQL Editor and run it.
3. **Admin user** — create a user in Supabase Auth (Authentication → Users → Add user). Then replace `REPLACE_WITH_ADMIN_EMAIL` in the SQL policies with that email and re-run the policy section, or create a new SQL query that updates the policies.
4. **Environment variables** — in Vercel (or your hosting platform), add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   (Find them in Supabase → Project Settings → API.)

---

## Deploy to Vercel

1. **Push this folder to GitHub as a standalone repo.** Do not push it as a subfolder inside a larger monorepo.

   ```bash
   # Create a new empty repo on GitHub first, then:
   cd ghost-of-gandhara
   git init
   git add .
   git commit -m "Initial Ghost of Gandhara site"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/ghost-of-gandhara.git
   git push -u origin main
   ```

2. Import the repo in [Vercel](https://vercel.com) → **Add New Project**.
3. Add the environment variables from step 4 above.
4. Deploy. Vercel will run `next build` and host the site.

---

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

If you are running this inside the Replit monorepo, the project reads `SUPABASE_URL` / `SUPABASE_ANON_KEY` from Replit secrets. For a standalone Vercel deployment, set the `NEXT_PUBLIC_*` variables instead.

---

## Architecture

```
app/                     Next.js App Router pages (each folder = one route)
├── page.tsx             Homepage
├── books/               Books listing and detail
│   ├── page.tsx
│   └── [bookSlug]/
│       ├── page.tsx
│       └── [chapterSlug]/
│           └── page.tsx
├── poems/               Poems listing and detail
│   ├── page.tsx
│   └── [poemSlug]/
│       └── page.tsx
├── admin/               CMS for authenticated admin
│   ├── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── books/[id]/
│   │   └── page.tsx
│   ├── chapters/[id]/
│   │   └── page.tsx
│   └── poems/[id]/
│       └── page.tsx
├── layout.tsx           Root layout (fonts, providers, Toaster)
├── not-found.tsx        404 page
└── globals.css          Dark academia theme + Tailwind v4

src/
├── components/
│   ├── layout/          Navbar, Footer, PageLayout
│   └── ui/              Minimal shadcn/ui components (15 files)
├── hooks/               useAuth, useNavigationData, useToast
├── lib/                 supabase client, cn() utility
└── types/               TypeScript types for Book, Chapter, Poem

public/                  Static assets (hero-bg.jpg, book-cover-placeholder.jpg, favicon.svg, robots.txt)
```

---

## Important notes

- **Every page is a client component** (`'use client'`) because the site uses Supabase and browser hooks directly.
- **Images are plain `<img>` tags**, not `next/image`, so no image-optimization server is required.
- **Dynamic routes are server-rendered on demand** by Vercel, which is why the admin editor URLs (`/admin/books/[id]`, etc.) work without pre-generating every possible ID at build time. This is the simplest, most reliable setup for a small CMS-backed site.
- **Only 15 shadcn/ui components are included** (the ones actually imported). Removing any of them will break the build.
- **Trailing slashes are enabled** (`trailingSlash: true`), so URLs look like `/books/the-garden/`.
