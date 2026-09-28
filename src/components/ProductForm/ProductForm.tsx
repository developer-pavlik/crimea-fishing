'use client';

import { useState } from 'react';

interface ProductData {
  title: string;
  price: number;
}

interface ProductFormProps {
  initialData?: ProductData;
  onSubmit?: (data: ProductData) => Promise<void>;
}

export default function ProductForm({ initialData, onSubmit = async () => {} }: ProductFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [price, setPrice] = useState(initialData?.price || 0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit({ title, price });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Название товара</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <label>Цена</label>
        <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
      </div>
      <button type="submit" disabled={loading}>
        {initialData ? 'Сохранить изменения' : 'Создать товар'}
      </button>
    </form>
  );
}