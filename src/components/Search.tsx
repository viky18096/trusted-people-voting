import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from 'use-debounce';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { useAnalytics } from '../hooks/useAnalytics';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

interface SearchResult {
  id: string;
  name: string;
  collegeName: string;
  votes: number;
  photoURL: string;
}

const Search: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { logAnalyticsEvent } = useAnalytics();
  const prevSearchTermRef = useRef<string>('');

  const performSearch = useCallback(async (term: string) => {
    if (term.trim() === '') {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const q = query(
        collection(db, 'nominees'),
        where('name', '>=', term),
        where('name', '<=', term + '\uf8ff'),
        orderBy('name'),
        limit(5)
      );

      const querySnapshot = await getDocs(q);
      const searchResults: SearchResult[] = [];
      querySnapshot.forEach((doc) => {
        searchResults.push({ id: doc.id, ...doc.data() } as SearchResult);
      });
      setResults(searchResults);
      logAnalyticsEvent('search_performed', { term: term, resultCount: searchResults.length });
    } catch (error) {
      console.error('Error performing search:', error);
      logAnalyticsEvent('search_error', { error: (error as Error).message });
    } finally {
      setLoading(false);
    }
  }, [logAnalyticsEvent]);

  useEffect(() => {
    if (debouncedSearchTerm !== prevSearchTermRef.current) {
      prevSearchTermRef.current = debouncedSearchTerm;
      if (debouncedSearchTerm) {
        performSearch(debouncedSearchTerm);
      } else {
        setResults([]);
      }
    }
  }, [debouncedSearchTerm, performSearch]);

  return (
    <div className="relative">
      <Input
        type="search"
        placeholder="Search nominees..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full"
      />
      {loading && <div className="mt-2">Searching...</div>}
      {results.length > 0 && (
        <Card className="absolute w-full mt-1 z-10">
          <CardContent className="p-0">
            {results.map((result) => (
              <Link href={`/nominee/${result.id}`} key={result.id}>
                <div className="flex items-center p-2 hover:bg-gray-100 cursor-pointer">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={result.photoURL} alt={result.name} />
                    <AvatarFallback>{result.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{result.name}</p>
                    <p className="text-sm text-gray-500">{result.collegeName}</p>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Search;