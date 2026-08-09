'use client';

import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { ImageIcon, Upload, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ImageUploadProps {
  /** Current image URL (shown as preview) */
  value: string;
  /** Called with the new URL after a successful upload or manual entry */
  onChange: (url: string) => void;
  label: string;
  hint?: string;
  /** Supabase Storage bucket name — must be public */
  bucket?: string;
  /** Tailwind aspect-ratio class, e.g. "aspect-video" or "aspect-[2/3]" */
  aspectClass?: string;
}

export function ImageUpload({
  value,
  onChange,
  label,
  hint,
  bucket = 'site-images',
  aspectClass = 'aspect-video',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    setError('');
    setUploading(true);

    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, { cacheControl: '3600', upsert: false });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
  }, [bucket, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-muted-foreground" /> {label}
      </Label>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !uploading && inputRef.current?.click()}
        className={[
          'relative cursor-pointer rounded border-2 border-dashed transition-colors overflow-hidden w-full max-w-sm',
          aspectClass,
          dragging ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/50',
        ].join(' ')}
      >
        {value ? (
          <>
            <img
              src={value}
              alt="Preview"
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <Upload className="w-6 h-6 text-white" />
              <span className="text-white text-sm font-sans">Replace image</span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground p-6">
            <Upload className="w-8 h-8" />
            <p className="text-sm text-center font-sans leading-relaxed">
              Drop an image here<br />or click to browse
            </p>
          </div>
        )}

        {/* Uploading overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
            <span className="text-white text-sm font-sans">Uploading…</span>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {/* Manual URL fallback */}
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Or paste a URL directly:</p>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="bg-background/50 text-sm"
        />
      </div>

      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
