'use client';

import { useState, useEffect, useCallback } from 'react';
import { matchesApi } from '@/lib/api';
import { Match } from '@/types/match';

interface UseMatchesReturn {
  matches: Match[];
  loading: boolean;
  error: string | null;
  fetchMatches: (params?: any) => Promise<void>;
  refreshMatches: () => Promise<void>;
}

export const useMatches = (): UseMatchesReturn => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [cache, setCache] = useState<Map<string, Match[]>>(new Map());

  const fetchMatches = useCallback(async (params?: any) => {
    try {
      setLoading(true);
      setError(null);
      
      // Create cache key from params
      const cacheKey = JSON.stringify(params || {});
      
      // Check cache first
      if (cache.has(cacheKey)) {
        setMatches(cache.get(cacheKey) || []);
        setLoading(false);
        return;
      }
      
      // Rate limiting: wait at least 1 second between requests
      const now = Date.now();
      const timeSinceLastFetch = now - lastFetchTime;
      if (timeSinceLastFetch < 1000) {
        await new Promise(resolve => setTimeout(resolve, 1000 - timeSinceLastFetch));
      }
      
      // Add delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const response = await matchesApi.getMatches({
        limit: 200, // Fetch more matches to support date navigation
        ...params,
      });
      
      if (response.success) {
        const matchesData = response.data || [];
        setMatches(matchesData);
        
        // Cache the result
        setCache(prev => new Map(prev).set(cacheKey, matchesData));
      } else {
        setError(response.error || 'Failed to fetch matches');
      }
      
      setLastFetchTime(Date.now());
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError('Rate limit exceeded. Please wait a moment before trying again.');
      } else if (err.response?.status === 500) {
        setError('Server error. The football data service may be temporarily unavailable.');
      } else {
        setError(err.message || 'Failed to fetch matches');
      }
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  }, [lastFetchTime]);

  const refreshMatches = useCallback(async () => {
    await fetchMatches();
  }, [fetchMatches]);

  return {
    matches,
    loading,
    error,
    fetchMatches,
    refreshMatches,
  };
};
