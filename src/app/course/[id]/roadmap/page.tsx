import { RoadmapGraph } from '@/components/roadmap/RoadmapGraph';
import Link from 'next/link';

export const metadata = {
  title: 'Neural Network Roadmap | EASTDAWN',
  description: 'Interactive course progression matrix.',
};

export default async function RoadmapPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <main className="relative w-full h-screen bg-[#03050A] overflow-hidden flex flex-col">
      {/* Top HUD / Header */}
      <header className="relative z-50 h-[80px] shrink-0 border-b border-[#0f1f3a] bg-[#03050A]/80 backdrop-blur-md flex items-center justify-between px-6 shadow-[0_4px_30px_rgba(0,200,255,0.05)]">
        <div>
          <Link 
            href="/dashboard" 
            className="text-[#00C8FF] hover:text-white font-mono text-xs uppercase tracking-widest transition-colors inline-block mb-1"
          >
            &lt; Return to Command Center
          </Link>
          <div className="flex items-center gap-3">
             <h1 className="font-orbitron font-bold text-xl text-white tracking-wider">
               THREAT INTELLIGENCE <span className="text-[#3A5A7A] ml-2 font-mono text-xs">COURSE ID: {id}</span>
             </h1>
          </div>
        </div>
        
        {/* Progress Quick Stats */}
        <div className="flex items-center gap-6">
           <div className="text-right hidden sm:block">
             <p className="text-[#6A8FB5] font-mono text-[10px] uppercase tracking-widest">Network Penetrated</p>
             <p className="font-orbitron text-lg text-[#00C8FF]">33%</p>
           </div>
           <div className="text-right hidden sm:block">
             <p className="text-[#6A8FB5] font-mono text-[10px] uppercase tracking-widest">Active Objectives</p>
             <p className="font-orbitron text-lg text-[#00DC78]">2</p>
           </div>
        </div>
      </header>

      {/* Main Canvas Area */}
      <div className="flex-1 w-full relative">
        <RoadmapGraph />
      </div>

    </main>
  );
}
