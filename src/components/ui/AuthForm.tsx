'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Mail, User, AlertCircle, Loader2 } from 'lucide-react'
import { login, signup, forgotPassword } from '@/app/auth-actions'
import { createClient } from '@/utils/supabase/client'

export function AuthForm({ mode: initialMode = 'register' }: { mode?: 'login' | 'register' | 'reset' }) {
  const [mode, setMode] = useState(initialMode)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)

    const result = (
      mode === 'login' ? await login(formData) : 
      mode === 'register' ? await signup(formData) : 
      await forgotPassword(formData)
    ) as { error?: string, success?: boolean, message?: string } | undefined;

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (result?.success) {
      setSuccessMessage(result.message ?? null)
      setLoading(false)
    }
  }


  return (
    <div className="w-full max-w-md mx-auto">
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

      {successMessage ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-6 rounded bg-[#03050a] border border-[#00C8FF]/50 shadow-[0_0_20px_rgba(0,200,255,0.2)] text-center"
        >
          <div className="w-12 h-12 bg-[#00C8FF]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#00C8FF]/30">
            <Mail className="w-6 h-6 text-[#00C8FF]" />
          </div>
          <h3 className="text-white font-orbitron text-lg mb-2 uppercase tracking-tight">Transmission Sent</h3>
          <p className="text-[#6A8FB5] text-sm font-mono leading-relaxed">
            {successMessage}
          </p>
          <div className="mt-6 pt-6 border-t border-[#0f1f3a]">
            <p className="text-[10px] font-mono text-[#00C8FF]/50 uppercase tracking-[0.2em]">
              Awaiting neural acknowledgement...
            </p>
          </div>
        </motion.div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#00C8FF]/70 uppercase tracking-wider">
                  Agent Designation (Name)
                </label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6A8FB5] group-focus-within:text-[#00C8FF] transition-colors" />
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full bg-[#060e1e] border border-[#0f1f3a] rounded p-3 pl-10 text-white font-sans focus:border-[#00C8FF] focus:ring-1 focus:ring-[#00C8FF] focus:outline-none transition-all placeholder-[#3A5A7A]"
                    placeholder="e.g. ZeroCool"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-mono text-[#00C8FF]/70 uppercase tracking-wider">
                Secure Comm Link (Email)
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6A8FB5] group-focus-within:text-[#00C8FF] transition-colors" />
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full bg-[#060e1e] border border-[#0f1f3a] rounded p-3 pl-10 text-white font-sans focus:border-[#00C8FF] focus:ring-1 focus:ring-[#00C8FF] focus:outline-none transition-all placeholder-[#3A5A7A]"
                  placeholder="operator@eastdawn.network"
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#00C8FF]/70 uppercase tracking-wider">
                  Access Key (Password)
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6A8FB5] group-focus-within:text-[#00C8FF] transition-colors" />
                  <input
                    type="password"
                    name="password"
                    required
                    className="w-full bg-[#060e1e] border border-[#0f1f3a] rounded p-3 pl-10 text-white font-sans focus:border-[#00C8FF] focus:ring-1 focus:ring-[#00C8FF] focus:outline-none transition-all placeholder-[#3A5A7A]"
                    placeholder="Requires high entropy..."
                  />
                </div>
                {mode === 'login' && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setMode('reset')}
                      className="text-[10px] font-mono text-[#6A8FB5] hover:text-[#00C8FF] transition-colors uppercase"
                    >
                      Forgot Access Key?
                    </button>
                  </div>
                )}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-[#00C8FF] hover:bg-[#00C8FF]/90 text-[#03050A] font-bold font-mono py-3 px-4 rounded mt-2 shadow-[0_0_15px_rgba(0,200,255,0.4)] hover:shadow-[0_0_25px_rgba(0,200,255,0.6)] border border-[#00C8FF]/50 transition-all flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>
                    {mode === 'login' ? 'AUTHENTICATING...' : 
                     mode === 'register' ? 'INITIALIZING...' : 
                     'TRANSMITTING RESET...'}
                  </span>
                </>
              ) : (
                <span>
                  {mode === 'login' ? 'ACKNOWLEDGE LINK' : 
                   mode === 'register' ? 'ESTABLISH LINK' : 
                   'SEND RESET LINK'}
                </span>
              )}
            </motion.button>
            
            {mode === 'reset' && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs font-mono text-[#6A8FB5] hover:text-[#00C8FF] transition-colors uppercase"
                >
                  Return to Login
                </button>
              </div>
            )}
          </form>

        </>
      )}
    </div>
  )
}
