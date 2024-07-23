import React from 'react';
import { useRouter } from 'next/router';
import { useAnalytics } from '../hooks/useAnalytics';
import { Button } from '@/components/ui/button';

export const categories = [
  { id: 'educator', name: 'Educator', icon: '👨‍🏫' },
  { id: 'community-leader', name: 'Community Leader', icon: '🤝' },
  { id: 'healthcare-worker', name: 'Healthcare Worker', icon: '👨‍⚕️' },
  { id: 'entrepreneur', name: 'Entrepreneur', icon: '💼' },
  { id: 'artist', name: 'Artist', icon: '🎨' },
  { id: 'other', name: 'Other', icon: '✨' },
];

const CategoryExplorer: React.FC = () => {
  const router = useRouter();
  const { logAnalyticsEvent } = useAnalytics();

  const handleCategoryClick = (categoryId: string) => {
    logAnalyticsEvent('category_selected', { category: categoryId });
    router.push(`/nominees?category=${categoryId}`);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant="outline"
          className="h-24 flex flex-col items-center justify-center"
          onClick={() => handleCategoryClick(category.id)}
        >
          <span className="text-2xl mb-2">{category.icon}</span>
          <span>{category.name}</span>
        </Button>
      ))}
    </div>
  );
};

export default CategoryExplorer;