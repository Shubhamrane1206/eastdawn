'use client';

import { useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Node,
  Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css'; // Essential Flow styles
import { CyberNode } from './CyberNode';

const nodeTypes = {
  cyber: CyberNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'cyber',
    position: { x: 50, y: 150 },
    data: { label: 'Reconnaissance & Footprinting', category: 'Intelligence', status: 'completed' }
  },
  {
    id: '2',
    type: 'cyber',
    position: { x: 350, y: 150 },
    data: { label: 'Network Enumeration', category: 'Scanning', status: 'completed' }
  },
  {
    id: '3',
    type: 'cyber',
    position: { x: 650, y: 50 },
    data: { label: 'Vulnerability Analysis', category: 'Exploitation', status: 'in-progress' }
  },
  {
    id: '4',
    type: 'cyber',
    position: { x: 650, y: 250 },
    data: { label: 'Web Service Mapping', category: 'Web AppSec', status: 'in-progress' }
  },
  {
    id: '5',
    type: 'cyber',
    position: { x: 950, y: 150 },
    data: { label: 'Privilege Escalation Lab', category: 'Post-Exploitation', status: 'locked' }
  },
  {
    id: '6',
    type: 'cyber',
    position: { x: 1250, y: 150 },
    data: { label: 'Command & Control Setup', category: 'Advanced', status: 'locked' }
  }
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#00DC78', strokeWidth: 2 } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#00C8FF', strokeWidth: 2 } },
  { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: '#00C8FF', strokeWidth: 2 } },
  { id: 'e3-5', source: '3', target: '5', style: { stroke: '#3A5A7A', strokeWidth: 2, strokeDasharray: '5 5' } },
  { id: 'e4-5', source: '4', target: '5', style: { stroke: '#3A5A7A', strokeWidth: 2, strokeDasharray: '5 5' } },
  { id: 'e5-6', source: '5', target: '6', style: { stroke: '#3A5A7A', strokeWidth: 2, strokeDasharray: '5 5' } }
];

export function RoadmapGraph() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="w-full h-full relative" style={{ background: '#03050A' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        // Overriding the default zoom features to avoid breaking aesthetics 
        // while allowing typical interactive map drag/zoom actions
        minZoom={0.2}
        maxZoom={2}
        className="cyber-flow-theme"
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={30} 
          size={1.5} 
          color="#162c4a" 
        />
        <Controls 
          className="bg-[#0a1628] border-[#0f1f3a] fill-[#6A8FB5]" 
          showInteractive={false} 
        />
      </ReactFlow>
      
      {/* Visual Overlay Scanlines to keep it fully Cyberpunk */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] z-50 mix-blend-overlay" />
    </div>
  );
}
