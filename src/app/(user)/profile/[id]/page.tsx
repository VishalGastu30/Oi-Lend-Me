import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { BorrowScore } from '@/components/profile/BorrowScore';
import { ReputationBadges } from '@/components/profile/ReputationBadges';
import { FadeUp } from '@/components/ui/motion';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth-edge';
import { Flame, Users, Shield, Crown } from 'lucide-react';
import { ProfileAbout } from '@/components/profile/ProfileAbout';

async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;
  
  try {
    return await verifyJWT<{ userId: string; role: string }>(token);
  } catch (e) {
    return null;
  }
}

export default async function ProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getCurrentSession();
  const isAdminViewer = session?.role === 'ADMIN';

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      _count: {
        select: {
          items: true,
          requests: true,
        },
      },
      groupMemberships: {
        include: {
          group: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              category: true,
              isVerified: true,
              memberCount: true,
            }
          }
        }
      }
    },
  });

  if (!user) {
    notFound();
  }

  // Count items currently lent out (status BORROWED)
  const itemsLentCount = await prisma.item.count({
    where: {
      ownerId: user.id,
      status: 'BORROWED'
    }
  });

  // ---------------------------------------------------------------------------
  // ADMIN VIEW STRIPPING (CRITICAL)
  // ---------------------------------------------------------------------------
  if (isAdminViewer) {
    return (
       <div className="container max-w-4xl mx-auto py-24">
         <div className="bg-card border rounded-lg p-8 space-y-6">
            <div className="flex items-center gap-6">
                <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-3xl font-bold text-muted-foreground overflow-hidden">
                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                        user.name[0]
                    )}
                </div>
                <div>
                    <h1 className="text-3xl font-bold">{user.name}</h1>
                    <p className="text-muted-foreground">{user.email}</p>
                    <div className="mt-2 flex gap-2">
                        <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded text-xs font-medium uppercase tracking-wider">
                            {user.role}
                        </span>
                        <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-medium uppercase tracking-wider">
                            UID: {user.id}
                        </span>
                    </div>
                </div>
            </div>

            <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Admin Insights</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground">Items Listed</div>
                        <div className="text-2xl font-bold text-foreground">{user._count.items}</div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground">Currently Lending</div>
                        <div className="text-2xl font-bold text-foreground">{itemsLentCount}</div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground">Karma Score</div>
                        <div className="text-2xl font-bold text-muted-foreground">--</div>
                    </div>
                     <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground">Joined</div>
                        <div className="text-lg font-medium text-foreground">{new Date(user.createdAt).toLocaleDateString()}</div>
                    </div>
                </div>
            </div>
            
            <div className="border-t pt-6">
               <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-4 text-yellow-500 text-sm">
                  ⚠️ You are viewing this profile in <strong>Admin Mode</strong>. User-facing stats and interactive elements are hidden.
               </div>
            </div>
         </div>
       </div>
    );
  }

  // ---------------------------------------------------------------------------
  // NORMAL USER VIEW
  // ---------------------------------------------------------------------------
  const isOwnProfile = session?.userId === user.id;
  const karma = user.karmaScore;
  
  // Dynamic Fire Text Logic (from original client component)
  let fireText = "Your reputation is getting warm.";
  let subText = "Keep participating to heat things up!";
  
  if (karma > 500) {
      fireText = "Oi! Your reputation is absolutely ON FIRE!";
      subText = "You're a legend in the North Campus borrowing scene.";
  } else if (karma > 200) {
      fireText = "You're getting pretty popular around here!";
      subText = "People trust you with their stuff.";
  } else if (karma > 50) {
      fireText = "You're off to a great start!";
      subText = "Building trust one item at a time.";
  }

  // Transform Prisma user to match component expectations if necessary
  const serializableUser = {
    ...user,
    createdAt: user.createdAt.toISOString(),
    lastSeen: user.lastSeen ? user.lastSeen.toISOString() : null,
    bannedUntil: user.bannedUntil ? user.bannedUntil.toISOString() : null,
  };

  return (
    <div className="bg-[#0f1823] pb-8 px-4 sm:px-6 flex justify-center overflow-x-hidden font-sans">
      <div className="layout-content-container flex flex-col max-w-[1100px] w-full gap-8">
        
        <FadeUp className="flex flex-col gap-1 mt-4">
          <h2 className="text-white tracking-tight text-3xl font-extrabold leading-tight text-left flex items-center gap-2">
            {karma > 500 && <Flame className="text-orange-500 fill-orange-500 animate-pulse" />}
            {fireText}
          </h2>
          <p className="text-[#9aa9bc] text-lg">{subText}</p>
        </FadeUp>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <FadeUp delay={0.1} className="lg:col-span-2 h-full">
            <ProfileHeader user={serializableUser as any} isOwnProfile={isOwnProfile} />
          </FadeUp>
          <FadeUp delay={0.2} className="h-full">
            <BorrowScore karmaScore={karma} />
          </FadeUp>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <FadeUp delay={0.3} className="lg:col-span-3 flex flex-col gap-6">
            <div className="glass-card rounded-xl p-6">
              <div className="flex flex-col gap-3">
                <div className="flex gap-6 justify-between items-center">
                  <h3 className="text-white text-base font-bold">Progress to next Badge</h3>
                  <p className="text-[#4F9DFF] text-sm font-bold">
                    {(karma % 100)}%
                  </p>
                </div>
                <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                  <div 
                    className="h-full bg-[#4F9DFF] rounded-full transition-all duration-1000 ease-out" 
                    style={{width: `${karma % 100}%`}}
                  ></div>
                </div>
                <p className="text-[#9aa9bc] text-sm">
                  Earn {100 - (karma % 100)} more karma to reach the next level!
                </p>
              </div>
            </div>

            <ProfileAbout 
              initialAbout={user.about} 
              isOwnProfile={isOwnProfile}
              userRole={user.role}
              createdAt={user.createdAt.toISOString()}
            />
          </FadeUp>
        </div>

        <FadeUp delay={0.5} className="w-full">
          <ReputationBadges 
              karmaScore={karma} 
              itemsLent={itemsLentCount} 
              createdAt={serializableUser.createdAt} 
          />
        </FadeUp>

        {/* Groups Section */}
        {user.groupMemberships.length > 0 && (
          <FadeUp delay={0.6} className="w-full">
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-white text-base font-bold mb-4 flex items-center gap-2">
                <Users size={18} className="text-[#4F9DFF]" />
                Groups
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {user.groupMemberships.map((membership: any) => (
                  <a 
                    key={membership.group.id} 
                    href={`/groups/${membership.group.id}`}
                    className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group"
                  >
                    <div 
                      className="size-12 rounded-xl bg-center bg-cover border border-white/10 shrink-0 relative"
                      style={{ backgroundImage: `url("${membership.group.imageUrl || 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=200&auto=format&fit=crop'}")` }}
                    >
                      {membership.group.isVerified && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5 ring-2 ring-[#0f1823]">
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate group-hover:text-[#4F9DFF] transition-colors">
                        {membership.group.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          membership.role === 'ADMIN' ? 'bg-emerald-500/10 text-emerald-400' :
                          membership.role === 'OWNER' ? 'bg-purple-500/10 text-purple-400' :
                          'bg-white/5 text-white/50'
                        }`}>
                          {membership.role === 'ADMIN' && <Shield size={10} />}
                          {membership.role === 'OWNER' && <Crown size={10} />}
                          {membership.role}
                        </span>
                        <span className="text-[10px] text-white/30">
                          {membership.group.memberCount} members
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </FadeUp>
        )}

        <footer className="py-6 text-center text-[#9aa9bc] text-xs border-t border-white/5 mt-auto">
          <p>© 2026 Oi! Lend Me. Made with care on Campus.</p>
        </footer>
      </div>
    </div>
  );
}
