'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Lock, Mail, AlertCircle, Loader2, ChevronRight, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { getSecurityQuestion, resetPasswordWithSecurityAnswer } from '@/app/auth-actions'
import { ParticleBackground } from '@/components/ParticleBackground'
import Link from 'next/link'

type Step = 'IDENTITY' | 'CHALLENGE' | 'RECALIBRATE' | 'SUCCESS'

export default function SecurityResetPage() {
  const [step, setStep] = useState<Step>('IDENTITY')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleIdentityCheck = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const emailVal = formData.get('email') as string
    setEmail(emailVal)

    const result = await getSecurityQuestion(emailVal)
    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else if (result.question) {
      setQuestion(result.question)
      setStep('CHALLENGE')
    }
  }

  const handleChallengeCheck = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setAnswer(formData.get('answer') as string)
    setStep('RECALIBRATE')
  }

  const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.append('email', email)
    formData.append('answer', answer)

    const result = await resetPasswordWithSecurityAnswer(formData)
    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setStep('SUCCESS')
    }
  }

  return (
    <main className="relative min-h-screen bg-[#03050A] flex flex-col justify-center overflow-hidden font-sans">
      <ParticleBackground isAuth={false} className="fixed inset-0 z-0 opacity-40" />
      
      {/* Dynamic Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#00C8FF]/5 blur-[150px] rounded-[100%] pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#7850FF]/5 blur-[120px] rounded-[100%] pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-lg mx-auto px-6 py-12">
        <div className="mb-10 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-[#00C8FF]/10 border border-[#00C8FF]/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(0,200,255,0.2)]"
          >
            <Shield className="w-8 h-8 text-[#00C8FF]" />
          </motion.div>
          <h1 className="font-orbitron text-3xl font-bold tracking-tight text-white mb-2 uppercase italic drop-shadow-[0_0_15px_rgba(0,200,255,0.5)]">
             Neural <span className="text-[#00C8FF]">Override</span>
          </h1>
          <p className="font-mono text-[#6A8FB5] text-[10px] uppercase tracking-[0.3em]">
             Emergency Security Clearance Protocol
          </p>
        </div>

        <div className="bg-[#0a1628]/80 backdrop-blur-xl border border-[#0f1f3a] shadow-2xl rounded-2xl p-8 relative overflow-hidden min-h-[400px] flex flex-col">
          {/* Progress Bar */}
          <div className="flex gap-2 mb-8">
            {(['IDENTITY', 'CHALLENGE', 'RECALIBRATE', 'SUCCESS'] as Step[]).map((s, i) => (
              <div 
                key={s} 
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  i <= ['IDENTITY', 'CHALLENGE', 'RECALIBRATE', 'SUCCESS'].indexOf(step) 
                    ? 'bg-[#00C8FF] shadow-[0_0_10px_rgba(0,200,255,0.5)]' 
                    : 'bg-[#0f1f3a]'
                }`} 
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-xs font-mono uppercase tracking-wider">{error}</p>
              </motion.div>
            )}

            {step === 'IDENTITY' && (
              <motion.div
                key="identity"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col justify-center"
              >
                <h3 className="text-white font-orbitron text-lg mb-2 uppercase">Verify Identity</h3>
                <p className="text-[#6A8FB5] text-xs font-mono mb-8 uppercase tracking-wide">Enter your secure comm link to initialize the override sequence.</p>
                
                <form onSubmit={handleIdentityCheck} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-[#00C8FF]/50 uppercase tracking-widest">Operator Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3A5A7A] group-focus-within:text-[#00C8FF] transition-colors" />
                      <input
                        type="email"
                        name="email"
                        required
                        className="w-full bg-[#03050a] border border-[#0f1f3a] rounded-xl p-4 pl-12 text-white font-sans focus:border-[#00C8FF] focus:ring-1 focus:ring-[#00C8FF] focus:outline-none transition-all placeholder-[#3A5A7A]"
                        placeholder="operator@eastdawn.network"
                      />
                    </div>
                  </div>
                  <button
                    disabled={loading}
                    className="w-full bg-[#00C8FF] hover:bg-[#00C8FF]/90 text-[#03050A] font-bold font-mono py-4 rounded-xl shadow-[0_0_20px_rgba(0,200,255,0.3)] transition-all flex justify-center items-center gap-2 group uppercase text-sm"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Initiate Scan <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 'CHALLENGE' && (
              <motion.div
                key="challenge"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col justify-center"
              >
                <h3 className="text-white font-orbitron text-lg mb-2 uppercase">Neural Challenge</h3>
                <p className="text-[#6A8FB5] text-xs font-mono mb-8 uppercase tracking-wide">Provide the secret cipher for the following protocol:</p>
                
                <div className="mb-8 p-4 rounded-xl bg-[#00C8FF]/5 border border-[#00C8FF]/20 text-white font-display text-center italic">
                   &quot;{question}&quot;
                </div>

                <form onSubmit={handleChallengeCheck} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-[#00C8FF]/50 uppercase tracking-widest">Your Cipher (Answer)</label>
                    <input
                      type="text"
                      name="answer"
                      required
                      autoFocus
                      className="w-full bg-[#03050a] border border-[#0f1f3a] rounded-xl p-4 text-white font-sans focus:border-[#00C8FF] focus:outline-none transition-all placeholder-[#3A5A7A]"
                      placeholder="Type secret answer..."
                    />
                  </div>
                  <button
                    className="w-full bg-[#00C8FF] hover:bg-[#00C8FF]/90 text-[#03050A] font-bold font-mono py-4 rounded-xl shadow-[0_0_20px_rgba(0,200,255,0.3)] transition-all flex justify-center items-center gap-2 group uppercase text-sm"
                  >
                    Validate Neural Match <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              </motion.div>
            )}

            {step === 'RECALIBRATE' && (
              <motion.div
                key="recalibrate"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col justify-center"
              >
                <h3 className="text-white font-orbitron text-lg mb-2 uppercase">Core Recalibration</h3>
                <p className="text-[#6A8FB5] text-xs font-mono mb-8 uppercase tracking-wide">Identity confirmed. Establish a new high-entropy access key.</p>
                
                <form onSubmit={handlePasswordUpdate} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-[#00C8FF]/50 uppercase tracking-widest">New Access Key</label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3A5A7A] group-focus-within:text-[#00C8FF] transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="newPassword"
                        required
                        minLength={6}
                        autoFocus
                        className="w-full bg-[#03050a] border border-[#0f1f3a] rounded-xl p-4 pl-12 pr-12 text-white font-sans focus:border-[#00C8FF] focus:ring-1 focus:ring-[#00C8FF] focus:outline-none transition-all placeholder-[#3A5A7A]"
                        placeholder="Enter new password..."
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3A5A7A] hover:text-[#00C8FF] transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <button
                    disabled={loading}
                    className="w-full bg-[#00C8FF] hover:bg-[#00C8FF]/90 text-[#03050A] font-bold font-mono py-4 rounded-xl shadow-[0_0_20px_rgba(0,200,255,0.3)] transition-all flex justify-center items-center gap-2 group uppercase text-sm"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Recalibrate Link <CheckCircle2 className="w-4 h-4" /></>}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 'SUCCESS' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center py-8"
              >
                <div className="w-20 h-20 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(34,197,94,0.2)]">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-white font-orbitron text-2xl mb-4 uppercase tracking-tighter">Override Complete</h3>
                <p className="text-[#6A8FB5] text-sm font-mono mb-10 max-w-xs leading-relaxed uppercase">Neural links synchronized. Your access key has been successfully recalibrated.</p>
                
                <Link
                  href="/login"
                  className="w-full bg-white text-[#03050A] font-bold font-mono py-4 rounded-xl hover:bg-[#00C8FF] transition-all uppercase text-sm"
                >
                  Return to Dashboard
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 text-center">
           <Link href="/login" className="text-[10px] font-mono text-[#3A5A7A] hover:text-[#00C8FF] transition-colors uppercase tracking-[0.2em]">
             Abort Override Procedure
           </Link>
        </div>
      </div>
    </main>
  )
}
