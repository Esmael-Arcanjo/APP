import React, { useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';

/**
 * Image uploader that pushes files to Cloudinary via backend and stores secure URLs.
 * Props:
 *  - value: string[] (list of URLs)
 *  - onChange: (urls: string[]) => void
 *  - multiple: boolean (default true)
 *  - max: number (default 8)
 *  - testId: string
 */
const ImageUploader = ({ value = [], onChange, multiple = true, max = 8, testId = 'image-uploader' }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const remaining = max - value.length;
    const files = Array.from(fileList).slice(0, remaining);
    if (files.length === 0) {
      toast.error(`Máximo de ${max} imagens.`);
      return;
    }
    setUploading(true);
    try {
      const uploaded = [];
      for (const f of files) {
        const fd = new FormData();
        fd.append('file', f);
        const { data } = await api.post('/uploads/image', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (data?.url) uploaded.push(data.url);
      }
      onChange([...value, ...uploaded]);
      if (uploaded.length) toast.success(`${uploaded.length} imagem(ns) enviada(s)`);
    } catch (e) {
      toast.error('Falha no upload de imagens');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const remove = (i) => {
    const next = value.filter((_, idx) => idx !== i);
    onChange(next);
  };

  return (
    <div data-testid={testId} className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {value.map((url, i) => (
          <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-border group">
            <img src={url} alt={`upload-${i}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              data-testid={`${testId}-remove-${i}`}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        {value.length < max && (
          <button
            type="button"
            data-testid={`${testId}-add`}
            onClick={() => inputRef.current?.click()}
            className="w-24 h-24 rounded-lg border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors bg-background"
          >
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            <span className="text-[10px]">{uploading ? 'Enviando...' : 'Upload'}</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
        data-testid={`${testId}-input`}
      />
      <p className="text-xs text-muted-foreground">Até {max} imagens · JPG, PNG, WebP · até 10 MB cada</p>
    </div>
  );
};

export default ImageUploader;
