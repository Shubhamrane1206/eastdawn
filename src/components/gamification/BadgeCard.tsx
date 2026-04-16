'use client'

import { motion } from 'framer-motion'
import { Shield, Lock, Award, Zap, Crosshair } from 'lucide-react'

interface BadgeCardProps {
  badge: {
    name: string;
    description: string;
    tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND' | string;
  };
  isUnlocked: boolean;
}

export function BadgeCard({ badge, isUnlocked }: BadgeCardProps) {
  // Determine Cyberpunk color themes based on the tier
  const tierColors = {
    BRONZE: 'from-[#cd7f32]/20 to-transparent border-[#cd7f32] text-[#cd7f32]',
    SILVER: 'from-[#A1B5C4]/20 to-transparent border-[#A1B5C4] text-[#A1B5C4]',
    GOLD: 'from-[#FFA040]/20 to-transparent border-[#FFA040] text-[#FFA040]',
    DIAMOND: 'from-[#00C8FF]/20 to-transparent border-[#00C8FF] text-[#00C8FF]'
  }

  const activeColor = tierColors[badge.tier as keyof typeof tierColors] || tierColors['BRONZE']

  return (
    <motion.div
      whileHover={isUnlocked ? { scale: 1.05, y: -5 } : {}}
      className={`relative rounded-xl overflow-hidden backdrop-blur-md p-6 h-full flex flex-col justify-between transition-all duration-300 ${
        isUnlocked 
          ? `bg-[#0a1628]/80 border ${activeColor} shadow-[0_0_15px_rgba(0,0,0,0.5)]` 
          : 'bg-[#03050A]/60 border border-[#0f1f3a] opacity-60 grayscale'
      }`}
    >
      {/* Background Matrix/Hexagon effect can go here, simulated by gradient */}
      {isUnlocked && (
        <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-b ${activeColor.split(' ')[0]} to-transparent opacity-20 pointer-events-none`} />
      )}

      {/* Top Header Row */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className={`p-3 rounded-lg ${isUnlocked ? 'bg-[#03050A]/50 backdrop-blur-md border border-current shadow-[0_0_10px_currentColor]' : 'bg-[#0f1f3a]'}`}>
          {isUnlocked ? (
            badge.tier === 'DIAMOND' ? <Zap className="w-8 h-8" /> :
            badge.tier === 'GOLD' ? <Award className="w-8 h-8" /> :
            <Shield className="w-8 h-8" />
          ) : (
            <Lock className="w-8 h-8 text-[#3A5A7A]" />
          )}
        </div>
        <div className="text-right">
          <span className={`text-xs font-mono font-bold tracking-[0.2em] uppercase ${isUnlocked ? '' : 'text-[#3A5A7A]'}`}>
            {badge.tier}
          </span>
          <p className="text-[10px] text-[#6A8FB5] font-mono mt-1">CLASS</p>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h3 className={`font-orbitron text-xl mb-2 tracking-wide ${isUnlocked ? 'text-white' : 'text-[#3A5A7A]'}`}>
          {badge.name}
        </h3>
        <p className={`font-sans text-sm leading-relaxed ${isUnlocked ? 'text-[#C8D8F0]' : 'text-[#3A5A7A]/70'}`}>
          {badge.description}
        </p>
      </div>

      {/* Cyberpunk Decorative Corners */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-current opacity-50" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-current opacity-50" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-current opacity-50" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-current opacity-50" />
    </motion.div>
  )
}
