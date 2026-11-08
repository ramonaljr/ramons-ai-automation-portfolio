'use client'

import { ChevronDown, CircleCheck, EllipsisVertical, LoaderCircle, Timer } from 'lucide-react'

import { AppMark, visualOf, type WorldProps } from '@/components/landing/demo/world'
import type { DemoNode } from '@/lib/demos/types'

/**
 * A Zap, drawn the way Zapier's editor draws it: step cards down a column,
 * a "+" between each, Paths fanning out under a bar with a pill naming each
 * path, and an error-handled step splitting into Success and Error. The
 * layout is worked out from the Zap's own structure
 * (scripts/zapier-demo-layout.mjs); the export has no positions to copy.
 */

/** Built-in Zapier tools wear an outlined badge; app steps a plain one. */
const BUILT_IN = new Set(['FilterAPI', 'CodeCLIAPI', 'BranchingAPI', 'EngineAPI', 'DelayCLIAPI', 'AICLIAPI'])

const bottom = (node: DemoNode) => [node.x + node.w / 2, node.y + node.h] as const
const top = (node: DemoNode) => [node.x + node.w / 2, node.y] as const

export function ZapierWorld({ layout, stateOf, edgeLit, onOpen }: WorldProps) {
  const byName = new Map(layout.nodes.map(node => [node.name, node]))
  const hasOut = (node: DemoNode) => layout.edges.some(edge => edge.from === node.name)

  return (
    <>
      <svg className='zap-links' aria-hidden='true'>
        {layout.edges.map((edge, index) => {
          const from = byName.get(edge.from)
          const to = byName.get(edge.to)

          if (!from || !to) return null

          const [ax, ay] = bottom(from)
          const [bx, by] = top(to)
          const lit = edgeLit(edge, index)

          if (!edge.label) {
            return (
              <g key={index} data-lit={lit || undefined}>
                <path d={`M ${ax} ${ay} V ${by}`} />
                <text x={ax} y={(ay + by) / 2 + 8} textAnchor='middle'>
                  +
                </text>
              </g>
            )
          }

          // A branch: down to the bar, across to its lane, down past the pill.
          const bar = ay + 36

          return (
            <g key={index} data-lit={lit || undefined}>
              <path d={`M ${ax} ${ay} V ${bar} H ${bx} V ${by}`} />
              {edge.tone !== 'path' && (
                <text x={bx} y={by - 34} textAnchor='middle'>
                  +
                </text>
              )}
            </g>
          )
        })}

        {/* The "+" under a column's last step, where the next step would go. */}
        {layout.nodes
          .filter(node => !hasOut(node))
          .map(node => {
            const [x, y] = bottom(node)

            return (
              <g key={node.name}>
                <path d={`M ${x} ${y} V ${y + 40}`} />
                <text x={x} y={y + 30} textAnchor='middle'>
                  +
                </text>
              </g>
            )
          })}
      </svg>

      {layout.edges.map((edge, index) => {
        const to = byName.get(edge.to)

        if (!edge.label || !to) return null

        const [x, y] = top(to)

        return (
          <span
            key={index}
            className='zap-pill'
            data-tone={edge.tone}
            data-lit={edgeLit(edge, index) || undefined}
            style={{ left: x, top: y - (edge.tone === 'path' ? 32 : 92) }}
          >
            {edge.label}
            {edge.tone === 'path' ? (
              <ChevronDown size={14} aria-hidden='true' />
            ) : (
              edge.tone === 'error' && <EllipsisVertical size={13} aria-hidden='true' />
            )}
          </span>
        )
      })}

      {layout.nodes.map(node => {
        const state = stateOf(node)
        const visual = visualOf('zapier', node.type)

        return (
          <button
            key={node.name}
            type='button'
            className='zap-step'
            data-state={state}
            style={{ left: node.x, top: node.y, width: node.w, height: node.h }}
            aria-label={`${node.name}${state === 'success' ? ', ran' : ''}. Show data out`}
            onClick={() => onOpen(node.name)}
          >
            <span className='zap-step-top'>
              {state === 'running' || state === 'waiting' ? (
                <LoaderCircle className='zap-spin' size={15} aria-hidden='true' />
              ) : (
                <CircleCheck className='zap-check' size={15} aria-hidden='true' />
              )}
              <span className='zap-app' data-builtin={BUILT_IN.has(node.type) || undefined}>
                <AppMark visual={visual} size={14} />
                {node.label}
              </span>
              {node.shape === 'trigger' && (
                <span className='zap-poll'>
                  <Timer size={12} aria-hidden='true' />2 min
                </span>
              )}
              <EllipsisVertical className='zap-more' size={15} aria-hidden='true' />
            </span>
            <span className='zap-title'>
              <span>{node.name}</span>
              {(node.outputs?.length ?? 0) > 2 || node.type === 'FilterAPI' || node.shape === 'trigger' ? (
                <ChevronDown size={15} aria-hidden='true' />
              ) : null}
            </span>
          </button>
        )
      })}
    </>
  )
}
