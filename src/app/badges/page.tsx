import { db } from '@/lib/db'
import { BadgeCard } from '@/components/gamification/BadgeCard'
import { ParticleBackground } from '@/components/ParticleBackground'
import Link from 'next/link'

export const metadata = {
  title: 'Badges | EASTDAWN',
  description: 'Your gamification achievements and clearances.',
}

// Fallback constant for when DB is unreachable or unseeded
const FALLBACK_BADGES = [
  { id: '1', name: 'First Blood', description: 'Perfect score on an introductory cybersecurity quiz.', tier: 'BRONZE' },
  { id: '2', name: 'Network Novice', description: 'Initiate and complete your first network security learning module.', tier: 'BRONZE' },
  { id: '3', name: 'Iron Streak', description: 'Maintain a 7-day consecutive login and learning streak.', tier: 'SILVER' },
  { id: '4', name: 'Code Breaker', description: 'Successfully pass a reverse engineering fundamentals module.', tier: 'SILVER' },
  { id: '5', name: 'Threat Hunter', description: 'Complete the Threat Intelligence curriculum track.', tier: 'GOLD' },
  { id: '6', name: 'Master of Zero-Day', description: 'Achieve a flawless score on a Master-tier vulnerability assessment lab.', tier: 'DIAMOND' },
];

export default async function BadgesPage() {
  let allBadges = FALLBACK_BADGES;
  let userEarnedBadgeIds: string[] = ['1', '3']; // Simulating earned badges for the UX

  try {
    // Attempt real database fetch
    const fetchedBadges = await db.badge.findMany();
    if (fetchedBadges.length > 0) {
      allBadges = fetchedBadges;
      userEarnedBadgeIds = []; // No session auth implemented yet for server components in this phase
    }
  } catch (error) {
    console.error('Database unreachable — using fallback gamification data:', error);
  }

  // Count Unlocked
  const earnedCount = userEarnedBadgeIds.length;
  const completionPercentage = Math.round((earnedCount / allBadges.length) * 100);

  return (
    <main className="relative min-h-screen bg-[#03050A] overflow-hidden pt-24 pb-16 px-4 md:px-8">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <ParticleBackground className="absolute inset-0 z-0 opacity-20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6 border-b border-[#0f1f3a] pb-8">
          <div>
            <Link href="/" className="text-[#00C8FF] hover:text-[#00DC78] font-mono text-xs uppercase tracking-widest mb-4 inline-block transition-colors">
              &lt; Return to Main Console
            </Link>
            <h1 className="font-orbitron text-4xl md:text-5xl font-bold text-white tracking-tight drop-shadow-[0_0_15px_rgba(0,200,255,0.4)]">
              OPERATOR <span className="text-[#00C8FF]">ACHIEVEMENTS</span>
            </h1>
            <p className="font-sans text-[#6A8FB5] mt-3 max-w-2xl text-lg">
              Unlock clearance tiers by proving your mastery across the cybersecurity spectrum.
            </p>
          </div>

          {/* Progress Stats Block */}
          <div className="flex gap-8 bg-[#0a1628]/80 backdrop-blur-md border border-[#00C8FF]/30 p-6 rounded-lg shadow-[0_0_20px_rgba(0,200,255,0.1)]">
            <div>
              <p className="text-[#6A8FB5] font-mono text-[10px] uppercase tracking-widest mb-1">Clearance Level</p>
              <p className="text-3xl font-orbitron text-white">{completionPercentage}%</p>
            </div>
            <div className="w-px bg-[#0f1f3a]" />
            <div>
              <p className="text-[#6A8FB5] font-mono text-[10px] uppercase tracking-widest mb-1">Badges Unlocked</p>
              <p className="text-3xl font-orbitron text-[#00C8FF]">{earnedCount}<span className="text-xl text-[#3A5A7A]">/{allBadges.length}</span></p>
            </div>
          </div>
        </div>

        {/* Gamification Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allBadges.map((badge) => {
            const isUnlocked = userEarnedBadgeIds.includes(badge.id);
            return (
              <BadgeCard 
                key={badge.id}
                badge={badge}
                isUnlocked={isUnlocked}
              />
            )
          })}
        </div>

      </div>
    </main>
  )
}
