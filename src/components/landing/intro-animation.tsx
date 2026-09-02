"use client"

import { useEffect, useState } from "react"
import { usePrefersReducedMotion } from "@/components/landing/motion"

const DISPLAY_FONT = 'var(--font-ibm-plex), "IBM Plex Sans", sans-serif'

// Timing configuration (ms)
const ENTER_DURATION = 1150
const HOLD_DURATION = 650
const EXIT_START = ENTER_DURATION + HOLD_DURATION // 1800ms
const EXIT_DURATION = 450
const CURTAIN_START = EXIT_START + 150 // 1950ms
const CURTAIN_DURATION = 1200 // 1200ms
export const HERO_REVEAL_MS = CURTAIN_START + CURTAIN_DURATION - 200 // 2950ms
export const INTRO_DURATION_MS = CURTAIN_START + CURTAIN_DURATION // 3150ms
const TOTAL_DURATION = INTRO_DURATION_MS + 250 // 3400ms

type Phase = "idle" | "in" | "out" | "done"

export function IntroAnimation({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>("idle")
  const [curtainUp, setCurtainUp] = useState(false)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (reducedMotion) {
      onDone()
      setPhase("done")
      return
    }

    const t0 = setTimeout(() => setPhase("in"), 60)
    const t1 = setTimeout(() => setPhase("out"), EXIT_START)
    const t2 = setTimeout(() => setCurtainUp(true), CURTAIN_START)
    const t3 = setTimeout(() => onDone(), HERO_REVEAL_MS)
    const t4 = setTimeout(() => setPhase("done"), TOTAL_DURATION)

    return () => {
      clearTimeout(t0)
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [onDone, reducedMotion])

  if (phase === "done") return null

  const isIdle = phase === "idle"
  const isIn = phase === "in"
  const isOut = phase === "out"

  // Base transition helper for intro elements
  const getItemStyle = (delayIn: number, yIn = 24, blurIn = 16) => {
    const opacity = isIdle ? 0 : isIn ? 1 : 0
    const blur = isIdle ? blurIn : isIn ? 0 : 16
    const translateY = isIdle ? yIn : isIn ? 0 : -18

    const transition = isOut
      ? `opacity ${EXIT_DURATION}ms cubic-bezier(0.4, 0, 1, 1), filter ${EXIT_DURATION}ms cubic-bezier(0.4, 0, 1, 1), transform ${EXIT_DURATION}ms cubic-bezier(0.4, 0, 1, 1)`
      : isIn
      ? `opacity 750ms cubic-bezier(0.16, 1, 0.3, 1) ${delayIn}ms, filter 750ms cubic-bezier(0.16, 1, 0.3, 1) ${delayIn}ms, transform 750ms cubic-bezier(0.16, 1, 0.3, 1) ${delayIn}ms`
      : "none"

    return {
      opacity,
      filter: `blur(${blur}px)`,
      transform: `translateY(${translateY}px)`,
      transition,
      willChange: "opacity, filter, transform",
    }
  }

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none" aria-hidden="true">
      {/* Curtain background — retracts upward to reveal the hero */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          bottom: curtainUp ? "100%" : "0%",
          transition: curtainUp ? `bottom ${CURTAIN_DURATION}ms cubic-bezier(0.76, 0, 0.24, 1)` : "none",
          background: "var(--ground)",
        }}
      />

      {/* Intro presentation card */}
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <div className="flex flex-col items-center text-center max-w-2xl select-none">
          {/* Eyebrow badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rule bg-ink/[0.03] mb-5"
            style={getItemStyle(100, 12, 10)}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] sm:text-[12px] tracking-[0.2em] text-ink-3 uppercase">
              AI Automation &amp; Systems
            </span>
          </div>

          {/* Scaled & Refined RAMON title */}
          <h1
            className="text-[clamp(2.5rem,6vw,4.5rem)] font-light tracking-[0.14em] text-ink leading-none uppercase mb-5"
            style={{
              fontFamily: DISPLAY_FONT,
              ...getItemStyle(220, 28, 20),
            }}
          >
            RAMON
          </h1>

          {/* Business pain-point slogan */}
          <p
            className="text-[15px] sm:text-lg md:text-xl font-light text-ink-2 max-w-[42ch] leading-relaxed tracking-tight"
            style={getItemStyle(380, 20, 14)}
          >
            Automating the manual work that quietly eats your business week.
          </p>
        </div>
      </div>
    </div>
  )
}

