import { Shield, Brain, Zap, Target, BookOpen, Terminal } from "lucide-react";
import { SpotlightCard } from "@/components/SpotlightCard";
import { TextGenerateEffect } from "@/components/TextGenerateEffect";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Home(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient()

  // Handle stray auth codes (if Supabase falls back to site URL)
  if (searchParams.code) {
    redirect(`/auth/callback?code=${searchParams.code}${searchParams.next ? `&next=${searchParams.next}` : ''}`)
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-4 text-center overflow-hidden">
        
        <div className="z-10 max-w-5xl mx-auto flex flex-col items-center mt-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-sm font-mono text-[var(--color-primary)] border border-[var(--color-primary)]/30 rounded-full bg-[var(--color-primary)]/10 mb-8 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
            SYSTEM ONLINE — V1.0.0
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-display font-bold tracking-tight mb-6 text-white uppercase drop-shadow-[0_0_15px_rgba(0,200,255,0.3)]">
            Master Any <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">Cybersecurity</span> Domain
          </h1>
          
          <div className="max-w-2xl mx-auto">
            <TextGenerateEffect 
              words="Type a prompt. Get a fully personalized, expert-level cybersecurity course generated instantly by our AI engine." 
              className="text-xl md:text-2xl text-[var(--color-text-secondary)] font-sans"
            />
          </div>

          <div className="mt-12 flex flex-col sm:flex-row gap-6 w-full max-w-lg justify-center relative z-20">
            <Link href="/register" className="relative text-center overflow-hidden group w-full sm:w-auto px-8 py-4 bg-[var(--color-primary)] text-[#03050a] font-display font-bold uppercase rounded-lg hover:bg-[var(--color-success)] transition-all duration-300 transform hover:scale-[1.02]">
               <span className="relative z-10">Generate Course — Free</span>
            </Link>
            <Link href="/login" className="w-full text-center sm:w-auto px-8 py-4 border border-[var(--color-text-tertiary)] text-[var(--color-text-secondary)] font-display font-bold uppercase rounded-lg hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)] transition-colors duration-300">
              Acknowledge (Login)
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 relative z-10 bg-gradient-to-b from-transparent to-[var(--color-surface-2)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4 uppercase">
               What is EASTDAWN?
            </h2>
            <p className="text-[var(--color-text-tertiary)] max-w-2xl mx-auto">Discard rigid catalogs. Embrace living, AI-crafted curricula that evolve with the threat landscape.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SpotlightCard>
              <Brain className="w-12 h-12 text-[var(--color-primary)] mb-6" />
              <h3 className="text-xl font-display font-bold text-white mb-3">Hyper-Personalized</h3>
              <p className="text-[var(--color-text-secondary)] leading-relaxed flex-grow">
                The AI reads your prompt context and adjusts depth and complexity automatically. From absolute beginner to specialized deep-dives.
              </p>
            </SpotlightCard>

            <SpotlightCard>
              <Zap className="w-12 h-12 text-[var(--color-warning)] mb-6" />
              <h3 className="text-xl font-display font-bold text-white mb-3">Always Current</h3>
              <p className="text-[var(--color-text-secondary)] leading-relaxed flex-grow">
                Cybersecurity evolves faster than standard courses. EASTDAWN uses live knowledge to integrate the latest CVEs and threat intelligence.
              </p>
            </SpotlightCard>

            <SpotlightCard>
              <Target className="w-12 h-12 text-[var(--color-success)] mb-6" />
              <h3 className="text-xl font-display font-bold text-white mb-3">Adaptive Quizzes</h3>
              <p className="text-[var(--color-text-secondary)] leading-relaxed flex-grow">
                Every quiz is generated entirely fresh per session. Difficulty adjusts in real-time, providing deep analytics on your true knowledge gaps.
              </p>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-24 px-4 relative z-10 bg-[var(--color-surface-2)]">
        <div className="max-w-7xl mx-auto">
           <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4 uppercase">
               How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="relative p-8">
              <div className="w-16 h-16 mx-auto bg-[var(--color-surface-3)] rounded-2xl border border-[var(--color-primary)]/50 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(0,200,255,0.2)]">
                <Terminal className="w-8 h-8 text-[var(--color-primary)]" />
              </div>
              <h4 className="font-display font-bold text-lg text-white mb-2">1. Enter Command</h4>
              <p className="text-[var(--color-text-tertiary)] text-sm">"Teach me web application pentesting as a junior dev."</p>
            </div>
            
            <div className="relative p-8">
              <div className="hidden md:block absolute top-[40%] left-[-20%] w-[40%] h-[2px] bg-gradient-to-r from-transparent to-[var(--color-primary)] opacity-50" />
              <div className="w-16 h-16 mx-auto bg-[var(--color-surface-3)] rounded-2xl border border-[var(--color-secondary)]/50 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(120,80,255,0.2)]">
                 <Shield className="w-8 h-8 text-[var(--color-secondary)]" />
              </div>
              <h4 className="font-display font-bold text-lg text-white mb-2">2. Processing Generation</h4>
              <p className="text-[var(--color-text-tertiary)] text-sm">AI pipeline streams a tailored curriculum, labs, and examples.</p>
            </div>

            <div className="relative p-8">
              <div className="hidden md:block absolute top-[40%] left-[-20%] w-[40%] h-[2px] bg-gradient-to-r from-transparent to-[var(--color-secondary)] opacity-50" />
               <div className="w-16 h-16 mx-auto bg-[var(--color-surface-3)] rounded-2xl border border-[var(--color-success)]/50 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(0,220,120,0.2)]">
                 <BookOpen className="w-8 h-8 text-[var(--color-success)]" />
              </div>
              <h4 className="font-display font-bold text-lg text-white mb-2">3. Master the Course</h4>
              <p className="text-[var(--color-text-tertiary)] text-sm">Read the material, play the interactive labs, and take adaptive tests.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative z-10">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-[var(--color-surface-3)] to-[var(--color-surface-1)] border border-[var(--color-primary)]/20 p-6 sm:p-12 rounded-2xl text-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
          <h2 className="text-2xl sm:text-4xl font-display font-bold text-white mb-6 relative z-10 uppercase">
             Ready to initiate?
          </h2>
          <p className="text-lg sm:text-xl text-[var(--color-text-secondary)] mb-10 max-w-xl mx-auto relative z-10">
            Create your first AI-generated training module instantly.
          </p>
          <Link href="/register" className="inline-block relative z-10 px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg bg-transparent border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-display hover:bg-[var(--color-primary)] hover:text-[#03050a] transition-all duration-300 uppercase shadow-[0_0_20px_rgba(0,200,255,0.4)]">
             Boot Sequence
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 border-t border-[var(--color-surface-3)] bg-[#03050a] text-center text-[var(--color-text-quaternary)] font-mono text-xs flex flex-col items-center gap-4 relative z-10">
         <p>EASTDAWN © 2026 // SYSTEM PROTECTED // AUTHORIZED PERSONNEL ONLY</p>
         <p className="text-[var(--color-primary)] font-bold tracking-widest">DEVELOPED BY OPERATOR: SHUBHAM RANE</p>
      </footer>
    </div>
  );
}
