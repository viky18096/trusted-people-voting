"use client";

import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsData {
  totalUsers: number;
  totalNominees: number;
  totalVotes: number;
  topCategories: { name: string; count: number }[];
  recentActivity: { date: string; votes: number; nominations: number }[];
}

export default function AdminAnalyticsPage() {
  const [user] = useAuthState(auth);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { logAnalyticsEvent } = useAnalytics();

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user || user.email !== 'admin@example.com') {
        setLoading(false);
        return;
      }

      try {
        // Fetch total users, nominees, and votes
        const [usersSnapshot, nomineesSnapshot, votesSnapshot] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'nominees')),
          getDocs(collection(db, 'votes'))
        ]);

        // Fetch top categories
        const categoriesQuery = query(collection(db, 'nominees'), orderBy('votes', 'desc'), limit(5));
        const categoriesSnapshot = await getDocs(categoriesQuery);
        const topCategories = categoriesSnapshot.docs.map(doc => ({
          name: doc.data().category,
          count: doc.data().votes
        }));

        // Fetch recent activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentVotesQuery = query(collection(db, 'votes'), where('timestamp', '>=', sevenDaysAgo));
        const recentNominationsQuery = query(collection(db, 'nominees'), where('createdAt', '>=', sevenDaysAgo));
        const [recentVotesSnapshot, recentNominationsSnapshot] = await Promise.all([
          getDocs(recentVotesQuery),
          getDocs(recentNominationsQuery)
        ]);

        const recentActivity = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return {
            date: date.toISOString().split('T')[0],
            votes: 0,
            nominations: 0
          };
        }).reverse();

        recentVotesSnapshot.forEach(doc => {
          const date = doc.data().timestamp.toDate().toISOString().split('T')[0];
          const index = recentActivity.findIndex(item => item.date === date);
          if (index !== -1) {
            recentActivity[index].votes++;
          }
        });

        recentNominationsSnapshot.forEach(doc => {
          const date = doc.data().createdAt.toDate().toISOString().split('T')[0];
          const index = recentActivity.findIndex(item => item.date === date);
          if (index !== -1) {
            recentActivity[index].nominations++;
          }
        });

        setAnalyticsData({
          totalUsers: usersSnapshot.size,
          totalNominees: nomineesSnapshot.size,
          totalVotes: votesSnapshot.size,
          topCategories,
          recentActivity
        });

        logAnalyticsEvent('admin_analytics_viewed');
      } catch (error) {
        console.error('Error fetching analytics:', error);
        logAnalyticsEvent('admin_analytics_error', { error: (error as Error).message });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, logAnalyticsEvent]);

  if (!user || user.email !== 'admin@example.com') {
    return <div>Access denied. Admin privileges required.</div>;
  }

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  if (!analyticsData) {
    return <div>Error loading analytics data.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Analytics Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{analyticsData.totalUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Nominees</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{analyticsData.totalNominees}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Votes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{analyticsData.totalVotes}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.topCategories}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.recentActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="votes" fill="#8884d8" />
              <Bar dataKey="nominations" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}