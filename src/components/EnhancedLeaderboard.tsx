import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, startAfter, getDocs, onSnapshot, where } from 'firebase/firestore';
import { useAnalytics } from '../hooks/useAnalytics';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useInView } from 'react-intersection-observer';

interface Nominee {
  id: string;
  name: string;
  votes: number;
  collegeName: string;
  location: string;
}

const ITEMS_PER_PAGE = 10;

const EnchancedLeaderboard: React.FC = () => {
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState({ college: 'All', location: 'All' });
  const [sort, setSort] = useState<'votes' | 'name'>('votes');
  const [search, setSearch] = useState('');
  const [colleges, setColleges] = useState<string[]>(['All']);
  const [locations, setLocations] = useState<string[]>(['All']);
  const { logAnalyticsEvent } = useAnalytics();
  const { ref, inView } = useInView();

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        let baseQuery = collection(db, 'nominees');
        let constraints: any[] = [orderBy(sort, 'desc'), limit(ITEMS_PER_PAGE)];

        if (filter.college !== 'All') {
          constraints.push(where('collegeName', '==', filter.college));
        }
        if (filter.location !== 'All') {
          constraints.push(where('location', '==', filter.location));
        }
        if (search) {
          constraints.push(where('name', '>=', search), where('name', '<=', search + '\uf8ff'));
        }

        const q = query(baseQuery, ...constraints);

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const fetchedNominees: Nominee[] = [];
          querySnapshot.forEach((doc) => {
            fetchedNominees.push({ id: doc.id, ...doc.data() } as Nominee);
          });
          setNominees(fetchedNominees);
          setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
          setHasMore(querySnapshot.docs.length === ITEMS_PER_PAGE);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching nominees:', error);
        setError('Error fetching nominees. Please try again later.');
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [filter, sort, search]);

  useEffect(() => {
    const fetchMetadata = async () => {
      const collegesSet = new Set<string>(['All']);
      const locationsSet = new Set<string>(['All']);

      const nomineesSnapshot = await getDocs(collection(db, 'nominees'));
      nomineesSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.collegeName) collegesSet.add(data.collegeName);
        if (data.location) locationsSet.add(data.location);
      });

      setColleges(Array.from(collegesSet));
      setLocations(Array.from(locationsSet));
    };

    fetchMetadata();
  }, []);

  useEffect(() => {
    if (inView && hasMore) {
      loadMore();
    }
  }, [inView]);

  const loadMore = async () => {
    if (!lastVisible) return;

    try {
      let baseQuery = collection(db, 'nominees');
      let constraints: any[] = [
        orderBy(sort, 'desc'),
        startAfter(lastVisible),
        limit(ITEMS_PER_PAGE)
      ];

      if (filter.college !== 'All') {
        constraints.push(where('collegeName', '==', filter.college));
      }
      if (filter.location !== 'All') {
        constraints.push(where('location', '==', filter.location));
      }
      if (search) {
        constraints.push(where('name', '>=', search), where('name', '<=', search + '\uf8ff'));
      }

      const q = query(baseQuery, ...constraints);
      const querySnapshot = await getDocs(q);

      const newNominees = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Nominee));
      setNominees(prev => [...prev, ...newNominees]);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setHasMore(querySnapshot.docs.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error loading more nominees:', error);
      setError('Error loading more nominees. Please try again.');
    }
  };

  const handleFilterChange = (key: 'college' | 'location', value: string) => {
    setFilter(prev => ({ ...prev, [key]: value }));
    logAnalyticsEvent('leaderboard_filter_changed', { [key]: value });
  };

  const handleSortChange = (value: 'votes' | 'name') => {
    setSort(value);
    logAnalyticsEvent('leaderboard_sort_changed', { sort: value });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    logAnalyticsEvent('leaderboard_search', { term: e.target.value });
  };

  if (loading) return <div>Loading leaderboard...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Select onValueChange={(value) => handleFilterChange('college', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select College" />
          </SelectTrigger>
          <SelectContent>
            {colleges.map((college) => (
              <SelectItem key={college} value={college}>{college}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => handleFilterChange('location', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select Location" />
          </SelectTrigger>
          <SelectContent>
            {locations.map((location) => (
              <SelectItem key={location} value={location}>{location}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => handleSortChange(value as 'votes' | 'name')}>
          <SelectTrigger>
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="votes">Votes</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="text"
          placeholder="Search nominees..."
          value={search}
          onChange={handleSearch}
        />
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={nominees.slice(0, 5)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="votes" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>College</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Votes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {nominees.map((nominee, index) => (
            <TableRow key={nominee.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{nominee.name}</TableCell>
              <TableCell>{nominee.collegeName}</TableCell>
              <TableCell>{nominee.location}</TableCell>
              <TableCell>{nominee.votes}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {hasMore && (
        <div ref={ref}>
          <Button onClick={loadMore}>Load More</Button>
        </div>
      )}
    </div>
  );
};

export default EnchancedLeaderboard;