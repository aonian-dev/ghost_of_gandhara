export interface Book {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: string;
  book_id: string;
  title: string;
  slug: string;
  content: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Poem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}
