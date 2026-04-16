'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Mail, User, AlertCircle, Loader2 } from 'lucide-react'
import { login, signup, signInWithOAuth } from '@/app/auth-actions'

export function AuthForm({ mode = 'register' }: { mode?: 'login' | 'register' }) {
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'github' | 'google' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    
    let result;
    if (mode === 'login') {
      result = await login(formData)
    } else {
      result = await signup(formData)
    }

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  const handleOAuth = async (provider: 'github' | 'google') => {
    setOauthLoading(provider)
    setError(null)
    try {
      await signInWithOAuth(provider)
    } catch (e: any) {
      setError(e.message ?? 'OAuth error')
      setOauthLoading(null)
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
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading || oauthLoading !== null}
          className="w-full bg-[#00C8FF] hover:bg-[#00C8FF]/90 text-[#03050A] font-bold font-mono py-3 px-4 rounded mt-2 shadow-[0_0_15px_rgba(0,200,255,0.4)] hover:shadow-[0_0_25px_rgba(0,200,255,0.6)] border border-[#00C8FF]/50 transition-all flex justify-center items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{mode === 'login' ? 'AUTHENTICATING...' : 'INITIALIZING...'}</span>
            </>
          ) : (
            <span>{mode === 'login' ? 'ACKNOWLEDGE LINK' : 'ESTABLISH LINK'}</span>
          )}
        </motion.button>
      </form>

      <div className="mt-8 mb-6 flex items-center gap-4">
        <div className="h-px bg-[#0f1f3a] flex-1" />
        <span className="text-xs font-mono text-[#6A8FB5] uppercase tracking-widest">
          OR BYPASS VIA
        </span>
        <div className="h-px bg-[#0f1f3a] flex-1" />
      </div>

      <div className="flex gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOAuth('github')}
          disabled={loading || oauthLoading !== null}
          className="flex-1 bg-[#060e1e] hover:bg-[#0a1628] border border-[#0f1f3a] hover:border-[#7850FF] text-[#C8D8F0] font-sans py-3 px-4 rounded transition-all flex justify-center items-center gap-2 group"
        >
          {oauthLoading === 'github' ? (
            <Loader2 className="w-5 h-5 animate-spin text-[#7850FF]" />
          ) : (
            <svg className="w-5 h-5 text-[#6A8FB5] group-hover:text-[#7850FF] transition-colors" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          )}
          <span className="text-sm font-medium">GitHub</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOAuth('google')}
          disabled={loading || oauthLoading !== null}
          className="flex-1 bg-[#060e1e] hover:bg-[#0a1628] border border-[#0f1f3a] hover:border-[#00C8FF] text-[#C8D8F0] font-sans py-3 px-4 rounded transition-all flex justify-center items-center gap-2 group"
        >
          {oauthLoading === 'google' ? (
            <Loader2 className="w-5 h-5 animate-spin text-[#00C8FF]" />
          ) : (
            <svg className="w-5 h-5 text-[#6A8FB5] group-hover:text-[#00dc78] transition-colors" viewBox="0 0 24 24" fill="currentColor">
               <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
               <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
               <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
               <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          <span className="text-sm font-medium">Google</span>
        </motion.button>
      </div>
    </div>
  )
}
