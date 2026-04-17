'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, AlertCircle, Loader2 } from 'lucide-react'
import { updatePassword } from '@/app/auth-actions'
import { ParticleBackground } from '@/components/ParticleBackground'

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await updatePassword(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  return (
    <main className="relative min-h-screen bg-[#03050A] flex flex-col justify-center overflow-hidden">
      <ParticleBackground isAuth={false} className="fixed inset-0 z-0 opacity-40" />
      
      {/* Central glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#7850FF]/10 blur-[120px] rounded-[100%] pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <div className="mb-10 text-center">
          <h1 className="font-orbitron text-3xl font-bold tracking-tight text-white mb-2 uppercase italic drop-shadow-[0_0_15px_rgba(0,200,255,0.5)]">
             Recalibrate <span className="text-[#00C8FF]">Access</span>
          </h1>
          <p className="font-mono text-[#6A8FB5] text-xs uppercase tracking-[0.2em]">
            Security Protocol Overhaul
          </p>
        </div>

        <div className="bg-[#0a1628]/80 backdrop-blur-md border border-[#0f1f3a] shadow-2xl rounded-lg p-8 relative overflow-hidden">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded bg-[#0a1628] border border-[#FFA040]/50 flex items-start gap-3 text-[#FFA040]"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-mono">{error}</p>
            </motion.div>
          )}

          {success ? (
            <div className="text-center py-4">
              <h3 className="text-white font-orbitron text-lg mb-4 uppercase">Success</h3>
              <p className="text-[#6A8FB5] text-sm font-mono mb-6">
                Neural link recalibrated. Authenticate with your new key.
              </p>
              <a 
                href="/login"
                className="inline-block w-full bg-[#00C8FF] text-[#03050A] font-bold font-mono py-3 rounded text-center uppercase"
              >
                Return to Login
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#00C8FF]/70 uppercase tracking-wider">
                  New Access Key
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6A8FB5] group-focus-within:text-[#00C8FF] transition-colors" />
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    className="w-full bg-[#060e1e] border border-[#0f1f3a] rounded p-3 pl-10 text-white font-sans focus:border-[#00C8FF] focus:ring-1 focus:ring-[#00C8FF] focus:outline-none transition-all placeholder-[#3A5A7A]"
                    placeholder="Enter new high-entropy key..."
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-[#00C8FF] hover:bg-[#00C8FF]/90 text-[#03050A] font-bold font-mono py-3 px-4 rounded mt-2 shadow-[0_0_15px_rgba(0,200,255,0.4)] border border-[#00C8FF]/50 transition-all flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>RECALIBRATING...</span>
                  </>
                ) : (
                  <span>AUTHORIZE CHANGE</span>
                )}
              </motion.button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
