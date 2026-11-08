'use client'

import { useId } from 'react'

import { Clock, Funnel, Plus, Wrench } from 'lucide-react'

import { AppMark, visualOf, type WorldProps } from '@/components/landing/demo/world'
import type { DemoNode } from '@/lib/demos/types'

/**
 * A Make scenario, drawn the way Make's designer draws it: modules as large
 * circles in their app's colour, each link a row of dots between two "ears",
 * a router's routes fanning out with their filters labelled on the link, and
 * error handlers hanging below on hollow dots. Positions are the blueprint's.
 */

const R = 75
const EAR = 26
const ORDINAL = ['1st', '2nd', '3rd', '4th', '5th']

const centre = (node: DemoNode) => [node.x + node.w / 2, node.y + node.h / 2] as const

/** Where a link leaves one circle and meets the next, ears included. */
function ends(from: DemoNode, to: DemoNode) {
  const [ax, ay] = centre(from)
  const [bx, by] = centre(to)
  const length = Math.hypot(bx - ax, by - ay) || 1
  const ux = (bx - ax) / length
  const uy = (by - ay) / length

  return {
    earA: [ax + ux * (R + 6), ay + uy * (R + 6)] as const,
    earB: [bx - ux * (R + 6), by - uy * (R + 6)] as const,
    start: [ax + ux * (R + EAR + 10), ay + uy * (R + EAR + 10)] as const,
    end: [bx - ux * (R + EAR + 10), by - uy * (R + EAR + 10)] as const,
    length
  }
}

/** Make's link: evenly spaced dots, about one every 30 units. */
function dots(start: readonly [number, number], end: readonly [number, number]) {
  const length = Math.hypot(end[0] - start[0], end[1] - start[1])
  const count = Math.max(2, Math.round(length / 30) + 1)

  return Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 0.5 : i / (count - 1)

    return [start[0] + (end[0] - start[0]) * t, start[1] + (end[1] - start[1]) * t] as const
  })
}

export function MakeWorld({ layout, stateOf, edgeLit, countOf, onOpen }: WorldProps) {
  // Gradient ids are page-wide; two canvases open at once must not share them.
  const uid = useId().replace(/[^\w-]/g, '')
  const byName = new Map(layout.nodes.map(node => [node.name, node]))
  const colour = (node: DemoNode) => visualOf('make', node.type).color
  const hasOut = (node: DemoNode) => layout.edges.some(edge => edge.from === node.name && edge.kind === 'main')

  // The grey band Make draws under an aggregator's range: through every module from feeder to aggregator.
  const bands = (layout.bands ?? []).map(band => {
    const path: DemoNode[] = []
    let at = byName.get(band.from)

    while (at && path.length < 50) {
      path.push(at)
      if (at.name === band.to) break
      at = byName.get(layout.edges.find(edge => edge.from === at?.name && edge.kind === 'main')?.to ?? '')
    }

    return path.map(node => centre(node).join(',')).join(' ')
  })

  return (
    <>
      <svg className='make-links' aria-hidden='true'>
        <defs>
          {layout.edges.map((edge, index) => {
            const from = byName.get(edge.from)
            const to = byName.get(edge.to)

            if (!from || !to) return null

            const { start, end } = ends(from, to)

            return (
              <linearGradient
                key={index}
                id={`${uid}-link-${index}`}
                gradientUnits='userSpaceOnUse'
                x1={start[0]}
                y1={start[1]}
                x2={end[0]}
                y2={end[1]}
              >
                <stop offset='0' stopColor={colour(from)} />
                <stop offset='1' stopColor={colour(to)} />
              </linearGradient>
            )
          })}
        </defs>

        {bands.map(points => (
          <polyline key={points} className='make-band' points={points} />
        ))}

        {layout.edges.map((edge, index) => {
          const from = byName.get(edge.from)
          const to = byName.get(edge.to)

          if (!from || !to) return null

          const { earA, earB, start, end } = ends(from, to)
          const lit = edgeLit(edge, index)
          const error = edge.kind === 'error'

          return (
            <g key={index} data-lit={lit || undefined} data-kind={error ? 'error' : 'main'}>
              <circle className='make-ear' cx={earA[0]} cy={earA[1]} r={EAR} fill={colour(from)} />
              <circle className='make-ear' cx={earB[0]} cy={earB[1]} r={EAR} fill={colour(to)} />
              {dots(start, end).map(([x, y], dot) => (
                <circle
                  key={dot}
                  className='make-dot'
                  cx={x}
                  cy={y}
                  r={error ? 7 : 9}
                  fill={error ? 'var(--make-canvas)' : `url(#${uid}-link-${index})`}
                  stroke={error ? colour(to) : undefined}
                  style={{ animationDelay: `${dot * 90}ms` }}
                />
              ))}
            </g>
          )
        })}

        {/* A module with nothing after it keeps an open ear with a plus. */}
        {layout.nodes
          .filter(node => node.type !== 'builtin:Break' && !hasOut(node))
          .map(node => {
            const [cx, cy] = centre(node)

            return (
              <circle
                key={node.name}
                className='make-ear'
                data-open
                cx={cx + R + 6}
                cy={cy}
                r={EAR}
                fill={colour(node)}
              />
            )
          })}
      </svg>

      {layout.edges.map((edge, index) => {
        const from = byName.get(edge.from)
        const to = byName.get(edge.to)

        if (edge.label || edge.kind === 'error' || !from || !to || from.type === 'builtin:BasicRouter') return null

        const { start, end } = ends(from, to)

        return (
          <Wrench
            key={`wrench-${index}`}
            className='make-wrench'
            size={18}
            aria-hidden='true'
            style={{ left: (start[0] + end[0]) / 2, top: (start[1] + end[1]) / 2 + 34 }}
          />
        )
      })}

      {/* Filter labels sit on the link, a third of the way along. */}
      {layout.edges.map((edge, index) => {
        const from = byName.get(edge.from)
        const to = byName.get(edge.to)

        if (!edge.label || !from || !to) return null

        const { start, end } = ends(from, to)
        const t = from.type === 'builtin:BasicRouter' ? 0.42 : 0.5
        const x = start[0] + (end[0] - start[0]) * t
        const y = start[1] + (end[1] - start[1]) * t

        return (
          <span key={index} className='make-filter' style={{ left: x, top: y }}>
            {from.type === 'builtin:BasicRouter' && <b>{ORDINAL[edge.output] ?? `${edge.output + 1}th`}</b>}
            <span>{edge.label}</span>
            <Funnel size={14} aria-hidden='true' />
          </span>
        )
      })}

      {layout.nodes.map(node => {
        const state = stateOf(node)
        const visual = visualOf('make', node.type)
        const [cx, cy] = centre(node)
        const count = state === 'success' ? countOf(node) : 0
        const retry = node.type === 'builtin:Break'

        return (
          <button
            key={node.name}
            type='button'
            className='make-module'
            data-state={state}
            data-retry={retry || undefined}
            style={{ left: node.x, top: node.y, width: node.w, height: node.h, '--app': visual.color } as never}
            aria-label={`${node.label ?? node.name}${state === 'success' ? ', ran' : ''}. Show output`}
            onClick={() => onOpen(node.name)}
          >
            <span className='make-circle'>
              <AppMark visual={visual} size={retry ? 54 : 66} tint={retry ? visual.color : '#fff'} />
            </span>

            {node.shape === 'trigger' && (
              <span className='make-clock' aria-hidden='true'>
                <Clock size={40} strokeWidth={2} />
              </span>
            )}

            {count > 0 && <span className='make-bubble'>{count}</span>}

            {!hasOut(node) && !retry && (
              <Plus
                className='make-plus'
                size={26}
                strokeWidth={2.4}
                aria-hidden='true'
                style={{ left: cx - node.x + R + 6 - 13 }}
              />
            )}

            <span className='make-label' style={{ top: cy - node.y + R + 18 }}>
              <span className='make-name'>
                {node.label ?? node.name}
                {node.number !== undefined && <span className='make-number'>{node.number}</span>}
              </span>
              {node.subtitle && <span className='make-action'>{node.subtitle}</span>}
            </span>
          </button>
        )
      })}
    </>
  )
}
