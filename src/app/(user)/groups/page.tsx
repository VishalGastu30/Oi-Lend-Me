'use client';

import { useEffect, useState } from 'react';
import { GroupCard } from '@/components/groups/GroupCard';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface Group {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  imageUrl: string | null;
  isVerified: boolean;
  visibility: string;
  memberCount: number;
  itemCount: number;
  owner: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchGroups();
  }, [selectedCategory]);

  const fetchGroups = async () => {
    try {
      const url = selectedCategory
        ? `/api/groups?category=${selectedCategory}`
        : '/api/groups';
      const response = await fetch(url);
      const data = await response.json();
      setGroups(data.groups || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['ACADEMIC', 'HOSTEL', 'CLUB', 'HOBBY', 'EVENT'];

  return (
    <div className="min-h-screen bg-background-dark">
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">
              Institutional Groups
            </h1>
            <p className="text-white/60">
              Join verified campus groups and access shared equipment
            </p>
          </div>
          <Button
            onClick={() => router.push('/groups/request')}
            className="bg-primary hover:bg-primary/90 text-background-dark font-bold"
          >
            Request New Group
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              selectedCategory === null
                ? 'bg-primary text-background-dark'
                : 'glass text-white/70 hover:text-white'
            }`}
          >
            All Groups
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-primary text-background-dark'
                  : 'glass text-white/70 hover:text-white'
              }`}
            >
              {category.charAt(0) + category.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Groups Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="glass rounded-xl p-6 h-64 animate-pulse"
              />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <p className="text-white/60 text-lg">
              No groups found in this category
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group, index) => (
              <GroupCard key={group.id} group={group} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
