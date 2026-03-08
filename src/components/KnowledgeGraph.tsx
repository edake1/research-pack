'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Share2, Loader2, ExternalLink } from 'lucide-react'

interface GraphNode {
  id: string
  title: string
  topic: string
  creator: string
  isCurrent: boolean
  weight: number
  // Simulation
  x: number
  y: number
  vx: number
  vy: number
}

interface GraphEdge {
  source: string
  target: string
  strength: number
  label: string
}

function forceSimulation(
  nodes: GraphNode[],
  edges: GraphEdge[],
  width: number,
  height: number,
  iterations: number = 300
) {
  const cx = width / 2
  const cy = height / 2

  // Initialize positions in a circle
  nodes.forEach((n, i) => {
    if (n.isCurrent) {
      n.x = cx
      n.y = cy
    } else {
      const angle = (2 * Math.PI * i) / nodes.length
      const r = Math.min(width, height) * 0.3
      n.x = cx + r * Math.cos(angle)
      n.y = cy + r * Math.sin(angle)
    }
    n.vx = 0
    n.vy = 0
  })

  const nodeMap = new Map(nodes.map(n => [n.id, n]))

  for (let iter = 0; iter < iterations; iter++) {
    const alpha = 1 - iter / iterations
    const decay = 0.6 * alpha

    // Repulsion between all node pairs
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i]
        const b = nodes[j]
        let dx = b.x - a.x
        let dy = b.y - a.y
        let dist = Math.sqrt(dx * dx + dy * dy) || 1
        const force = (800 * decay) / (dist * dist)
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force
        a.vx -= fx
        a.vy -= fy
        b.vx += fx
        b.vy += fy
      }
    }

    // Attraction along edges
    for (const edge of edges) {
      const a = nodeMap.get(edge.source)
      const b = nodeMap.get(edge.target)
      if (!a || !b) continue
      let dx = b.x - a.x
      let dy = b.y - a.y
      let dist = Math.sqrt(dx * dx + dy * dy) || 1
      const idealDist = 120 / Math.sqrt(edge.strength)
      const force = (dist - idealDist) * 0.01 * decay
      const fx = (dx / dist) * force
      const fy = (dy / dist) * force
      a.vx += fx
      a.vy += fy
      b.vx -= fx
      b.vy -= fy
    }

    // Center gravity
    for (const n of nodes) {
      n.vx += (cx - n.x) * 0.005 * decay
      n.vy += (cy - n.y) * 0.005 * decay
    }

    // Apply velocities with damping
    for (const n of nodes) {
      n.vx *= 0.85
      n.vy *= 0.85
      n.x += n.vx
      n.y += n.vy
      // Keep within bounds
      const pad = 40
      n.x = Math.max(pad, Math.min(width - pad, n.x))
      n.y = Math.max(pad, Math.min(height - pad, n.y))
    }
  }

  return nodes
}

function GraphCanvas({ nodes, edges, onNodeClick }: { nodes: GraphNode[]; edges: GraphEdge[]; onNodeClick: (id: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState({ width: 500, height: 400 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      setDimensions({ width: Math.floor(width), height: Math.floor(height) })
    })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  const simulatedNodes = useRef<GraphNode[]>([])

  useEffect(() => {
    if (nodes.length === 0) return
    simulatedNodes.current = forceSimulation(
      nodes.map(n => ({ ...n, x: 0, y: 0, vx: 0, vy: 0 })),
      edges,
      dimensions.width,
      dimensions.height
    )
  }, [nodes, edges, dimensions])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || simulatedNodes.current.length === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = dimensions.width * dpr
    canvas.height = dimensions.height * dpr
    ctx.scale(dpr, dpr)

    const nodeMap = new Map(simulatedNodes.current.map(n => [n.id, n]))
    const isDark = document.documentElement.classList.contains('dark')

    // Clear
    ctx.clearRect(0, 0, dimensions.width, dimensions.height)

    // Draw edges
    for (const edge of edges) {
      const src = nodeMap.get(edge.source)
      const tgt = nodeMap.get(edge.target)
      if (!src || !tgt) continue

      const isHovered = hoveredNode === edge.source || hoveredNode === edge.target
      ctx.beginPath()
      ctx.moveTo(src.x, src.y)
      ctx.lineTo(tgt.x, tgt.y)
      ctx.strokeStyle = isHovered
        ? (isDark ? 'rgba(167, 139, 250, 0.5)' : 'rgba(139, 92, 246, 0.5)')
        : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')
      ctx.lineWidth = Math.min(edge.strength, 3)
      ctx.stroke()
    }

    // Draw nodes
    for (const node of simulatedNodes.current) {
      const isHovered = hoveredNode === node.id
      const r = node.isCurrent ? 22 : 12 + Math.min(node.weight, 20) * 0.5

      // Glow for current
      if (node.isCurrent) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, r + 8, 0, Math.PI * 2)
        ctx.fillStyle = isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)'
        ctx.fill()
      }

      // Node circle
      ctx.beginPath()
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2)
      if (node.isCurrent) {
        ctx.fillStyle = isDark ? '#8b5cf6' : '#7c3aed'
      } else if (isHovered) {
        ctx.fillStyle = isDark ? '#a78bfa' : '#8b5cf6'
      } else {
        ctx.fillStyle = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'
      }
      ctx.fill()

      // Border
      ctx.beginPath()
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2)
      ctx.strokeStyle = node.isCurrent
        ? (isDark ? '#a78bfa' : '#7c3aed')
        : isHovered
          ? (isDark ? '#a78bfa' : '#8b5cf6')
          : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)')
      ctx.lineWidth = node.isCurrent ? 2 : 1
      ctx.stroke()

      // Label
      const label = node.title.length > 20 ? node.title.slice(0, 18) + '…' : node.title
      ctx.font = node.isCurrent ? 'bold 11px system-ui' : '10px system-ui'
      ctx.textAlign = 'center'
      ctx.fillStyle = isHovered || node.isCurrent
        ? (isDark ? '#e4e4e7' : '#18181b')
        : (isDark ? '#a1a1aa' : '#71717a')
      ctx.fillText(label, node.x, node.y + r + 14)

      // Creator name for hovered
      if (isHovered && !node.isCurrent) {
        ctx.font = '9px system-ui'
        ctx.fillStyle = isDark ? '#71717a' : '#a1a1aa'
        ctx.fillText(`by ${node.creator}`, node.x, node.y + r + 26)
      }
    }
  }, [nodes, edges, hoveredNode, dimensions])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    let found: string | null = null
    for (const node of simulatedNodes.current) {
      const r = node.isCurrent ? 22 : 12 + Math.min(node.weight, 20) * 0.5
      const dx = node.x - x
      const dy = node.y - y
      if (dx * dx + dy * dy < (r + 5) * (r + 5)) {
        found = node.id
        break
      }
    }
    setHoveredNode(found)
    canvas.style.cursor = found ? 'pointer' : 'default'
  }, [])

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    for (const node of simulatedNodes.current) {
      const r = node.isCurrent ? 22 : 12 + Math.min(node.weight, 20) * 0.5
      const dx = node.x - x
      const dy = node.y - y
      if (dx * dx + dy * dy < (r + 5) * (r + 5)) {
        onNodeClick(node.id)
        break
      }
    }
  }, [onNodeClick])

  return (
    <div ref={containerRef} className="w-full h-full min-h-[350px]">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ width: dimensions.width, height: dimensions.height }}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        onMouseLeave={() => setHoveredNode(null)}
      />
    </div>
  )
}

export function KnowledgeGraph({ packId }: { packId: string }) {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<{ nodes: GraphNode[]; edges: GraphEdge[] } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const router = useRouter()

  const fetchGraph = useCallback(async () => {
    if (data) return
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(`/api/packs/${packId}/related-graph`)
      if (!res.ok) throw new Error('Failed')
      const result = await res.json()
      setData(result)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [packId, data])

  const handleOpen = () => {
    setOpen(true)
    fetchGraph()
  }

  const handleNodeClick = (id: string) => {
    setOpen(false)
    router.push(`/packs/${id}`)
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpen}
        className="border-border/50 hover:border-border"
      >
        <Share2 className="h-3.5 w-3.5 mr-1.5" />
        Knowledge Graph
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden border-border/30 bg-background/80 backdrop-blur-2xl shadow-2xl rounded-2xl">
          <DialogTitle className="sr-only">Knowledge Graph</DialogTitle>

          {/* Header */}
          <div className="px-6 pt-5 pb-4 border-b border-border/30">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-muted border border-border/30">
                <Share2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <h2 className="font-semibold">Knowledge Graph</h2>
                <p className="text-xs text-muted-foreground">
                  {data ? `${data.nodes.length} related packs connected by shared topics & tags` : 'Explore connections between related research'}
                </p>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="h-[420px] relative">
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Building graph...</p>
              </div>
            )}

            {error && !loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <p className="text-sm text-muted-foreground">Couldn&apos;t build the knowledge graph.</p>
                <Button variant="outline" size="sm" onClick={() => { setData(null); fetchGraph() }}>
                  Try Again
                </Button>
              </div>
            )}

            {data && !loading && data.nodes.length <= 1 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
                <Share2 className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No related packs found yet. As more packs are created with similar topics, connections will appear here.</p>
              </div>
            )}

            {data && !loading && data.nodes.length > 1 && (
              <GraphCanvas nodes={data.nodes} edges={data.edges} onNodeClick={handleNodeClick} />
            )}
          </div>

          {/* Legend */}
          {data && data.nodes.length > 1 && (
            <div className="px-6 py-3 border-t border-border/30 flex items-center gap-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-500" /> Current pack
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/20 border border-border" /> Related pack
              </span>
              <span className="ml-auto flex items-center gap-1">
                <ExternalLink className="h-3 w-3" /> Click a node to navigate
              </span>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
