"use client";

import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types';

interface CacheEntry {
  data: User;
  timestamp: number;
}

const CACHE_KEY = 'user_data_cache';
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

export function useUserCache() {
  const [cachedUser, setCachedUser] = useState<User | null>(null);

  const getCachedUser = useCallback((userId: string): User | null => {
    try {
      const cacheString = localStorage.getItem(CACHE_KEY);
      if (!cacheString) return null;

      const cache = JSON.parse(cacheString) as Record<string, CacheEntry>;
      const entry = cache[userId];

      if (!entry) return null;

      if (Date.now() - entry.timestamp > CACHE_DURATION) {
        // Cache expired
        const newCache = { ...cache };
        delete newCache[userId];
        localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
        return null;
      }

      return entry.data;
    } catch (e) {
      console.error('Error reading user cache:', e);
      return null;
    }
  }, []);

  const setCacheUser = useCallback((user: User) => {
    try {
      const cacheString = localStorage.getItem(CACHE_KEY) || '{}';
      const cache = JSON.parse(cacheString) as Record<string, CacheEntry>;

      cache[user.id] = {
        data: user,
        timestamp: Date.now(),
      };

      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      setCachedUser(user);
    } catch (e) {
      console.error('Error setting user cache:', e);
    }
  }, []);

  const clearCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    setCachedUser(null);
  }, []);

  return { cachedUser, getCachedUser, setCacheUser, clearCache };
}
