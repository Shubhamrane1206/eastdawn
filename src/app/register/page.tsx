import { AuthForm } from '@/components/ui/AuthForm'
import { ParticleBackground } from '@/components/ParticleBackground' // From PRD references
import Link from 'next/link'

export const metadata = {
  title: 'Register | EASTDAWN',
  description: 'Initialize your agent designation and access key.',
}

export default function RegisterPage() {
  return (
    <main className="relative min-h-screen bg-[#03050A] flex flex-col justify-center overflow-hidden">
      {/* Particle background for cyberpunk aesthetic */}
      <div className="absolute inset-0 z-0">
         {/* Simple fallback in case ParticleBackground isn't working as expected, but it was listed in PRD */}
         <ParticleBackground className="absolute inset-0 z-0 opacity-40" />
      </div>
      
      {/* Central glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#00C8FF]/10 blur-[120px] rounded-[100%] pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#7850FF]/10 blur-[100px] rounded-[100%] pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-xl mx-auto px-6 pt-10 pb-16">
        <div className="mb-10 text-center">
          <Link href="/">
            <h1 className="font-orbitron text-4xl md:text-5xl font-bold tracking-tight text-white inline-block mb-3 drop-shadow-[0_0_15px_rgba(0,200,255,0.5)]">
               EAST<span className="text-[#00C8FF]">DAWN</span>
            </h1>
          </Link>
          <p className="font-mono text-[#6A8FB5] text-sm uppercase tracking-[0.2em]">
            New Operator Registration
          </p>
        </div>

        <div className="bg-[#0a1628]/80 backdrop-blur-md border border-[#0f1f3a] shadow-2xl shadow-[#000000]/50 rounded-lg p-8 relative overflow-hidden">
          {/* Subtle tech border effects */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00C8FF]/30 to-transparent" />
          <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-[#00C8FF]/20 via-transparent to-transparent" />
          <div className="absolute top-0 right-0 w-[1px] h-[30%] bg-gradient-to-b from-[#00C8FF]/30 to-transparent" />
          <div className="absolute bottom-0 right-0 w-[30%] h-[1px] bg-gradient-to-r from-transparent to-[#00C8FF]/30" />
          
          <div className="mb-6 border-b border-[#0f1f3a] pb-6">
            <h2 className="font-orbitron text-2xl text-white tracking-wide">
              INITIALIZE CONNECTION
            </h2>
            <p className="font-sans text-[#6A8FB5] text-sm mt-2">
              Generate a secure link to the global intelligence matrix. Access requires clearance.
            </p>
          </div>

          <AuthForm />

          <div className="mt-8 text-center text-sm font-sans text-[#6A8FB5]">
            Already have clearance?{' '}
            <Link href="/login" className="text-[#00C8FF] hover:text-[#00DC78] transition-colors font-medium">
              Acknowledge Link (Login)
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
