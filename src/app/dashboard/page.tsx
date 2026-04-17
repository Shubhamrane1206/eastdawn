import { Shield, Flame, Target, Trophy, Clock, ArrowRight } from "lucide-react";
import { SpotlightCard } from "@/components/SpotlightCard";
import Link from "next/link";
import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const dbUser = await db.user.upsert({
    where: { email: user.email! },
    update: {},
    create: { email: user.email!, name: user.user_metadata?.name || '' },
  })

  // Fetch their most recent course
  const latestCourse = await db.course.findFirst({
    where: { userId: dbUser.id },
    orderBy: { createdAt: 'desc' },
    include: { modules: true },
  })

  // Ranking logic
  const topOperators = await db.user.findMany({
    orderBy: { totalXp: 'desc' },
    take: 5,
    select: { id: true, name: true, totalXp: true, avatarUrl: true }
  })

  const userRank = await db.user.count({
    where: { totalXp: { gt: dbUser.totalXp } }
  }) + 1

  // Calculate progress
  let progressPct = 0
  let completedModules = 0
  let totalModules = 0
  let nextModule = null

  if (latestCourse) {
    totalModules = latestCourse.modules.length
    completedModules = latestCourse.modules.filter(m => m.isCompleted).length
    progressPct = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0
    nextModule = latestCourse.modules.find(m => !m.isCompleted) || latestCourse.modules[0]
  }

  return (
    <div className="flex flex-col min-h-screen px-4 py-24 sm:px-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 border-b border-[var(--color-surface-3)] pb-8">
        <div>
          <h1 className="text-4xl font-display font-bold text-white uppercase tracking-tight drop-shadow-[0_0_15px_rgba(255,49,49,0.3)]">
            Command Center
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-2 font-mono text-sm max-w-xl text-[var(--color-warning)]">
            Neural link active. System scan complete. Your global standing is synchronized.
          </p>
        </div>
        <div className="mt-6 md:mt-0 flex gap-4">
           <div className="bg-[var(--color-surface-3)] border border-[var(--color-primary)]/20 px-6 py-3 rounded-lg flex items-center gap-3 shadow-[0_0_15px_rgba(0,200,255,0.1)]">
             <Flame className="w-5 h-5 text-[var(--color-warning)] animate-pulse" />
             <div>
               <p className="text-xs text-[var(--color-text-tertiary)] font-mono uppercase">Neural XP</p>
               <p className="text-xl font-bold font-display text-white mt-0.5">{dbUser.totalXp} XP</p>
             </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column (Primary Views) */}
        <div className="md:col-span-8 flex flex-col gap-8">
          
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                 <Target className="w-5 h-5 text-[var(--color-primary)]" />
                 Active Training
              </h2>
              <Link href="/library" className="text-[var(--color-primary)] font-mono text-xs hover:underline uppercase">View All Modules</Link>
            </div>
            
            {latestCourse ? (
              <SpotlightCard className="p-6 cursor-pointer border-l-2 border-l-[var(--color-primary)]">
                 <div className="flex justify-between items-start mb-4">
                   <div>
                     <div className="inline-flex items-center gap-2 px-2 py-1 text-xs font-mono text-[var(--color-warning)] border border-[var(--color-warning)]/30 rounded bg-[var(--color-warning)]/10 mb-3">
                       IN PROGRESS - {progressPct}%
                     </div>
                     <h3 className="text-xl font-display font-bold text-white">{latestCourse.title}</h3>
                   </div>
                   <div className="p-2 bg-[var(--color-surface-2)] rounded-lg">
                     <Clock className="w-5 h-5 text-[var(--color-text-secondary)]" />
                   </div>
                 </div>
                 
                 <p className="text-[var(--color-text-tertiary)] text-sm mb-6 max-w-lg">
                   {nextModule ? `Next Up: Module ${nextModule.orderIndex + 1} - ${nextModule.title}` : latestCourse.summary}
                 </p>

                 <div className="w-full h-1.5 bg-[var(--color-surface-3)] rounded-full overflow-hidden">
                   <div className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-warning)] transition-all" style={{ width: `${progressPct}%` }} />
                 </div>
                 
                 <div className="mt-6 flex gap-4">
                    <Link href={`/course/${latestCourse.id}`} className="px-5 py-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-primary)] hover:text-[#03050a] text-white font-mono text-sm border border-[var(--color-surface-3)] transition-colors rounded">
                      Resume Module
                    </Link>
                 </div>
              </SpotlightCard>
            ) : (
              <SpotlightCard className="p-6 border-dashed border-2 flex items-center justify-center flex-col text-center border-[var(--color-surface-3)]">
                 <Shield className="w-10 h-10 text-[var(--color-text-tertiary)] mb-4" />
                 <h3 className="text-xl font-display font-bold text-white mb-2">No Active Courses</h3>
                 <p className="text-sm font-mono text-[var(--color-text-quaternary)] mb-6">Initialize a procedural learning block to begin your neural training.</p>
                 <Link href="/generate" className="px-6 py-2 bg-[var(--color-primary)] text-[#03050a] font-display font-bold text-xs uppercase flex items-center gap-2 hover:bg-[var(--color-success)] rounded transition-all">
                   Generate Course <ArrowRight className="w-4 h-4" />
                 </Link>
              </SpotlightCard>
            )}
          </section>

          <section>
             <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                 <Shield className="w-5 h-5 text-[var(--color-secondary)]" />
                 System Generation Node
              </h2>
            </div>
            <div className="p-8 border border-[var(--color-surface-3)] rounded-xl bg-[var(--color-surface-1)] relative overflow-hidden group">
               <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
               <p className="text-[var(--color-text-secondary)] mb-6 font-mono text-sm uppercase tracking-widest leading-relaxed">
                 Access the core generative matrix to synthesize custom procedural training blocks.
               </p>
               <Link 
                 href="/generate" 
                 className="inline-flex items-center gap-3 px-8 py-4 bg-[var(--color-primary)] text-[#03050a] text-sm font-display font-bold uppercase rounded-lg hover:bg-[var(--color-success)] transition-all shadow-[0_0_20px_rgba(0,200,255,0.3)] hover:shadow-[0_0_30px_rgba(0,220,120,0.5)] group/btn"
               >
                 <Zap className="w-4 h-4 group-hover:animate-pulse" />
                 INITIATE NEURAL UPLINK
               </Link>
            </div>
          </section>

        </div>

        {/* Right Column (Gamification / Stats) */}
        <div className="md:col-span-4 flex flex-col gap-8">
          
          <SpotlightCard className="p-6 border-t-2 border-t-[var(--color-warning)]">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-xl font-display font-bold text-white uppercase">Neural Standing</h2>
                </div>
                <div className="text-2xl font-display font-bold text-[var(--color-warning)] drop-shadow-[0_0_10px_rgba(255,160,64,0.3)]">
                  #{userRank}
                </div>
             </div>
             
             <div className="space-y-4">
                <p className="text-xs font-mono text-[var(--color-text-tertiary)] uppercase tracking-widest border-b border-[var(--color-surface-3)] pb-2 mb-4">Global Leaders</p>
                {topOperators.map((operator, i) => (
                  <div key={operator.id} className={`flex items-center justify-between p-2 rounded ${operator.id === dbUser.id ? 'bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20' : ''}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-[var(--color-text-quaternary)] w-4">{i + 1}.</span>
                      <div className="w-6 h-6 rounded-full bg-[var(--color-surface-3)] overflow-hidden border border-[var(--color-surface-3)]">
                        {operator.avatarUrl ? (
                          <img src={operator.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] font-mono text-[var(--color-text-quaternary)]">
                             OP
                          </div>
                        )}
                      </div>
                      <span className={`text-sm font-mono ${operator.id === dbUser.id ? 'text-[var(--color-primary)] font-bold' : 'text-white'}`}>
                        {operator.name || 'Anonymous'}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-[var(--color-text-tertiary)]">
                      {operator.totalXp} XP
                    </span>
                  </div>
                ))}
             </div>

             <Link href="/leaderboard" className="block w-full mt-6 text-xs font-mono text-[var(--color-text-quaternary)] hover:text-[var(--color-primary)] text-center transition-colors uppercase tracking-tighter">
               View Complete Leaderboard
             </Link>
          </SpotlightCard>

          <SpotlightCard className="p-6">
             <div className="flex items-center gap-3 mb-6">
                <Shield className="w-5 h-5 text-[var(--color-primary)]" />
                <h2 className="text-xl font-display font-bold text-white uppercase">Recent Badges</h2>
             </div>
             
             <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-square bg-[var(--color-surface-2)] border border-[var(--color-surface-3)] rounded-lg flex flex-col items-center justify-center opacity-50 hover:opacity-100 transition-opacity cursor-help relative group">
                    <Shield className="w-6 h-6 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-primary)] transition-colors" />
                     {i === 1 && (
                       <div className="absolute inset-0 bg-yellow-400/20 mix-blend-overlay rounded-lg" />
                     )}
                  </div>
                ))}
             </div>
             <Link href="/badges" className="block w-full mt-6 text-xs font-mono text-[var(--color-text-quaternary)] hover:text-[var(--color-primary)] text-center transition-colors">
               VIEW ALL ACHIEVEMENTS
             </Link>
          </SpotlightCard>

        </div>
      </div>
    </div>
  );
}
