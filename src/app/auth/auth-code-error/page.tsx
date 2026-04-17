import Link from 'next/link'

export default function AuthCodeError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#03050A] text-white p-6">
      <div className="max-w-md w-full bg-[#0a1628] border border-red-500/50 rounded-lg p-8 text-center shadow-[0_0_30px_rgba(239,68,68,0.1)]">
        <h1 className="text-2xl font-orbitron font-bold text-red-500 mb-4 uppercase tracking-tight">
          Authentication Error
        </h1>
        <p className="text-[#6A8FB5] font-mono text-sm mb-8 leading-relaxed">
          The security handshake could not be completed. Your authentication code may be expired or already used.
        </p>
        <Link 
          href="/login" 
          className="inline-block w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 font-mono text-sm transition-all uppercase"
        >
          Return to Login
        </Link>
      </div>
    </div>
  )
}
