import { useCallback, useEffect, useState } from 'react';
import {
  CATEGORY_STORAGE_KEY,
  DEFAULT_CATEGORIES,
} from '../data/categories';

function readCategories() {
  try {
    const saved = JSON.parse(localStorage.getItem(CATEGORY_STORAGE_KEY));
    return Array.isArray(saved) && saved.length ? saved : DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export function useCategories() {
  const [categories, setCategories] = useState(readCategories);

  useEffect(() => {
    localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  const addCategory = useCallback((category) => {
    setCategories((current) => [
      ...current,
      { ...category, id: `category-${crypto.randomUUID()}` },
    ]);
  }, []);

  const updateCategory = useCallback((id, updates) => {
    setCategories((current) =>
      current.map((category) =>
        category.id === id ? { ...category, ...updates } : category,
      ),
    );
  }, []);

  const deleteCategory = useCallback((id) => {
    setCategories((current) =>
      current.filter((category) => category.id !== id || category.protected),
    );
  }, []);

  const resetCategories = useCallback(() => {
    setCategories(DEFAULT_CATEGORIES);
  }, []);

  return {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    resetCategories,
  };
}
