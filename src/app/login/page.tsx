import { AuthForm } from '@/components/ui/AuthForm'
import { ParticleBackground } from '@/components/ParticleBackground'
import Link from 'next/link'

export const metadata = {
  title: 'Login | EASTDAWN',
  description: 'Authenticate your agent credentials.',
}

export default function LoginPage() {
  return (
    <main className="relative min-h-screen bg-[#03050A] flex flex-col justify-center overflow-hidden">
      {/* Particle background for cyberpunk aesthetic */}
      <div className="absolute inset-0 z-0">
         <ParticleBackground className="absolute inset-0 z-0 opacity-40" />
      </div>
      
      {/* Central glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#7850FF]/10 blur-[120px] rounded-[100%] pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#00C8FF]/10 blur-[100px] rounded-[100%] pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-xl mx-auto px-6 pt-10 pb-16">
        <div className="mb-10 text-center">
          <Link href="/">
            <h1 className="font-orbitron text-4xl md:text-5xl font-bold tracking-tight text-white inline-block mb-3 drop-shadow-[0_0_15px_rgba(0,200,255,0.5)]">
               EAST<span className="text-[#00C8FF]">DAWN</span>
            </h1>
          </Link>
          <p className="font-mono text-[#6A8FB5] text-sm uppercase tracking-[0.2em]">
            Operator Authentication
          </p>
        </div>

        <div className="bg-[#0a1628]/80 backdrop-blur-md border border-[#0f1f3a] shadow-2xl shadow-[#000000]/50 rounded-lg p-8 relative overflow-hidden">
          {/* Subtle tech border effects */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#7850FF]/30 to-transparent" />
          <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-[#7850FF]/20 via-transparent to-transparent" />
          <div className="absolute top-0 right-0 w-[1px] h-[30%] bg-gradient-to-b from-[#7850FF]/30 to-transparent" />
          <div className="absolute bottom-0 right-0 w-[30%] h-[1px] bg-gradient-to-r from-transparent to-[#7850FF]/30" />
          
          <div className="mb-6 border-b border-[#0f1f3a] pb-6">
            <h2 className="font-orbitron text-2xl text-white tracking-wide">
              ACKNOWLEDGE LINK
            </h2>
            <p className="font-sans text-[#6A8FB5] text-sm mt-2">
              Provide your clearance credentials to access the global intelligence matrix.
            </p>
          </div>

          <AuthForm mode="login" />

          <div className="mt-8 text-center text-sm font-sans text-[#6A8FB5]">
            Need clearance?{' '}
            <Link href="/register" className="text-[#7850FF] hover:text-[#00C8FF] transition-colors font-medium">
              Initialize Connection (Register)
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
