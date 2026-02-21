'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface GroupCardProps {
  group: {
    id: string;
    slug: string;
    name: string;
    category: string;
    description: string | null;
    imageUrl: string | null;
    isVerified: boolean;
    memberCount: number;
    itemCount: number;
    owner: {
      id: string;
      name: string;
      avatarUrl: string | null;
    };
  };
  index: number;
}

export function GroupCard({ group, index }: GroupCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const handleCardClick = () => {
    router.push(`/groups/${group.id}`);
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowJoinModal(true);
  };

  return (
    <>
      <div
        className={`glass rounded-xl p-6 cursor-pointer transition-all duration-300 hover:bg-white/5 ${
          isHovered ? 'transform -translate-y-1 shadow-2xl shadow-primary/20' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
        style={{
          animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`,
        }}
      >
        {/* Group Image */}
        <div className="relative mb-4">
          <div
            className="w-full h-40 rounded-lg bg-gradient-to-br from-primary/20 to-blue-600/20 bg-cover bg-center"
            style={{
              backgroundImage: group.imageUrl ? `url(${group.imageUrl})` : undefined,
            }}
          />
          {group.isVerified && (
            <div className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm text-background-dark px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">verified</span>
              Verified
            </div>
          )}
        </div>

        {/* Group Info */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-1">{group.name}</h3>
          <p className="text-primary text-sm font-semibold mb-2">
            {group.category.charAt(0) + group.category.slice(1).toLowerCase()}
          </p>
          <p className="text-white/60 text-sm line-clamp-2">
            {group.description || 'No description available'}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-white/60 text-sm mb-4">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-base">group</span>
            {group.memberCount} Members
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-base">category</span>
            {group.itemCount} Items
          </span>
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleApplyClick}
          className={`w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 font-bold transition-all ${
            isHovered ? 'opacity-100' : 'opacity-70'
          }`}
        >
          Apply to Join
        </Button>
      </div>

      {/* Join Modal - Simple version for now */}
      {showJoinModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowJoinModal(false)}
        >
          <div
            className="glass rounded-xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-white mb-4">
              Apply to Join {group.name}
            </h3>
            <p className="text-white/60 mb-4">
              Your request will be sent to the group admins for approval.
            </p>
            <textarea
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/40 mb-4"
              placeholder="Optional message to group admins..."
              rows={3}
            />
            <div className="flex gap-3">
              <Button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    await fetch(`/api/groups/${group.id}/join-requests`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ message: '' }),
                    });
                    setShowJoinModal(false);
                    alert('Join request submitted!');
                  } catch (error) {
                    console.error('Error submitting join request:', error);
                  }
                }}
                className="flex-1 bg-primary hover:bg-primary/90 text-background-dark font-bold"
              >
                Submit Request
              </Button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
