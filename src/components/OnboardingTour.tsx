'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, 
  Target, 
  Zap, 
  Trophy, 
  ChevronRight, 
  X,
  Terminal,
  Brain
} from 'lucide-react'
import { markOnboardingComplete } from '@/app/auth-actions'

interface Step {
  title: string
  description: string
  icon: React.ReactNode
  color: string
}

const steps: Step[] = [
  {
    title: "Welcome to Eastdawn",
    description: "Your neural interface to the world's first AI-native cybersecurity training platform. You are now an authorized operator.",
    icon: <Shield className="w-12 h-12" />,
    color: "#00C8FF"
  },
  {
    title: "Command Center",
    description: "This is your primary dashboard. Track your active courses, resume modules, and monitor your system status in real-time.",
    icon: <Terminal className="w-12 h-12" />,
    color: "#7850FF"
  },
  {
    title: "Neural XP & Standing",
    description: "Earn Experience Points (XP) by completing modules and acing quizzes. Rank up against other operators on the global leaderboard.",
    icon: <Trophy className="w-12 h-12" />,
    color: "#FFD700"
  },
  {
    title: "Generation Node",
    description: "The core of Eastdawn. Provide a prompt, and our AI pipeline will synthesize a tailored, expert-level course instantly.",
    icon: <Zap className="w-12 h-12" />,
    color: "#00FF80"
  }
]

export function OnboardingTour() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = async () => {
    setIsVisible(false)
    await markOnboardingComplete()
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#03050A]/90 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg bg-[#0a1628] border border-[#0f1f3a] rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-[#0f1f3a]">
          <motion.div 
            className="h-full bg-gradient-to-r from-[#00C8FF] to-[#7850FF]"
            initial={{ width: "0%" }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Close Button */}
        <button 
          onClick={handleComplete}
          className="absolute top-4 right-4 p-2 text-[#6A8FB5] hover:text-white transition-colors rounded-lg hover:bg-[#0f1f3a]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 pb-32">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center"
            >
              <div 
                className="p-6 rounded-2xl bg-[#03050A] mb-8 relative group"
                style={{ color: steps[currentStep].color }}
              >
                <div 
                  className="absolute inset-0 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"
                  style={{ backgroundColor: steps[currentStep].color }}
                />
                {steps[currentStep].icon}
              </div>

              <h2 className="text-3xl font-display font-bold text-white uppercase tracking-tight mb-4">
                {steps[currentStep].title}
              </h2>
              <p className="text-lg text-[#6A8FB5] font-sans leading-relaxed">
                {steps[currentStep].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="absolute bottom-0 left-0 w-full p-6 flex items-center justify-between bg-[#03050A]/50 backdrop-blur-md border-t border-[#0f1f3a]">
          <button 
            onClick={handleComplete}
            className="text-sm font-mono text-[#4A6B8F] hover:text-[#00C8FF] transition-colors uppercase tracking-widest"
          >
            Skip Manual
          </button>

          <div className="flex gap-2">
            {steps.map((_, i) => (
              <div 
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === currentStep ? 'w-6 bg-[#00C8FF]' : 'bg-[#0f1f3a]'
                }`}
              />
            ))}
          </div>

          <button 
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2 bg-[#00C8FF] hover:bg-[#00C8FF]/90 text-[#03050A] font-display font-bold text-xs uppercase rounded transition-all shadow-[0_0_15px_rgba(0,200,255,0.3)]"
          >
            {currentStep === steps.length - 1 ? 'Acknowledge' : 'Next Probe'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
      
      {/* Background Decorative Tech Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-64 h-64 bg-[#7850FF]/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#00C8FF]/5 blur-[120px] rounded-full" />
      </div>
    </div>
  )
}
