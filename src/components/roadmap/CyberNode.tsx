'use client';

import { Handle, Position, NodeProps } from '@xyflow/react';
import { Lock, Play, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export type CyberNodeData = {
  label: string;
  category: string;
  status: 'locked' | 'in-progress' | 'completed';
};

export function CyberNode({ data }: any) {
  const nodeData = data as CyberNodeData;
  const { status, label, category } = nodeData;

  const getStyleVars = () => {
    switch (status) {
      case 'completed':
        return 'bg-[#00DC78]/10 border-[#00DC78] shadow-[0_0_10px_rgba(0,220,120,0.4)] text-[#00DC78]';
      case 'in-progress':
        return 'bg-[#00C8FF]/10 border-[#00C8FF] shadow-[0_0_15px_rgba(0,200,255,0.6)] text-[#00C8FF]';
      case 'locked':
      default:
        return 'bg-[#03050A]/80 border-[#0f1f3a] text-[#3A5A7A] grayscale opacity-70';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5" />;
      case 'in-progress': return <Play className="w-5 h-5 fill-current" />;
      case 'locked': return <Lock className="w-5 h-5" />;
    }
  };

  return (
    <div className={`relative min-w-[220px] rounded border backdrop-blur-md transition-all duration-300 ${getStyleVars()}`}>
      
      {/* Target Handle (Input) - Left side for Horizontal Flow */}
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-2 h-6 !bg-transparent !border-l-2 !border-current !rounded-none -ml-[1px]" 
      />

      <div className="p-4">
        {/* Header Ribbon */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-mono tracking-widest uppercase opacity-80">
            {category}
          </span>
          <div className={`${status === 'in-progress' ? 'animate-pulse' : ''}`}>
            {getIcon()}
          </div>
        </div>

        {/* Title */}
        <h3 className={`font-orbitron text-sm leading-tight ${status === 'locked' ? 'text-[#6A8FB5]' : 'text-white'}`}>
          {label}
        </h3>
      </div>

      {/* Cyber Decorators */}
      {status !== 'locked' && (
        <>
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-current opacity-70" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-current opacity-70" />
        </>
      )}

      {/* Source Handle (Output) - Right side for Horizontal Flow */}
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-2 h-6 !bg-transparent !border-r-2 !border-current !rounded-none -mr-[1px]" 
      />
    </div>
  );
}
