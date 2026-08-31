"use client"

import { useEffect, useRef, useState } from "react"

import { PROFILE } from "@/lib/portfolio"

const DISPLAY_FONT = 'var(--font-ibm-plex), "IBM Plex Sans", sans-serif'

type Message = { id: number; role: "user" | "bot"; text: string }

const SUGGESTIONS = [
  "What can you automate for me?",
  "n8n, Zapier or Make?",
  "How much does a build cost?",
]

const GREETING =
  "Hi — I'm Ramon's assistant. Ask me about automation, the platforms I build on, or how an engagement works."

/**
 * Conversation key for the agent's memory window.
 *
 * The n8n agent keys its buffer on whatever it is handed, so a constant would
 * pool every visitor into one conversation and let them read fragments of each
 * other's. sessionStorage rather than localStorage: a returning visitor should
 * start fresh rather than resume a thread the agent no longer has context for,
 * since the memory window on the server side is finite.
 */
const SESSION_KEY = 'ramon-chat-session'

function sessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY)

    if (existing) return existing

    const fresh = `web-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

    sessionStorage.setItem(SESSION_KEY, fresh)

    return fresh
  } catch {
    // Private mode and blocked site data both throw on access. A per-call id
    // costs conversational memory but still keeps visitors out of each
    // other's threads, which is the part that matters.
    return `web-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  }
}

/**
 * The route handler forwards to n8n server-side, so the instance URL never
 * reaches the browser and no CORS configuration is involved.
 */
async function sendMessage(message: string): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId: sessionId() })
  })

  const data = (await res.json().catch(() => null)) as { reply?: string } | null

  if (!res.ok || !data?.reply) throw new Error(`chat failed: ${res.status}`)

  return data.reply
}

function Ico({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

const P = {
  chat: "M21 11.5a8.4 8.4 0 01-9 8.4 9.9 9.9 0 01-3.9-.8L3 21l1.9-4.9A8.4 8.4 0 0121 11.5z",
  close: "M18 6L6 18M6 6l12 12",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
}

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([{ id: 0, role: "bot", text: GREETING }])
  const [draft, setDraft] = useState("")
  const [pending, setPending] = useState(false)

  // Connection state is reported from what actually happened, never asserted
  // up front. "idle" until a real exchange proves it either way, so the header
  // cannot claim to be connected to a backend that is down.
  const [status, setStatus] = useState<"idle" | "ok" | "down">("idle")

  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const nextId = useRef(1)

  // Keep the newest message in view as the thread grows.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, pending])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }

    document.addEventListener("keydown", onKey)
    inputRef.current?.focus()

    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  const submit = async (text: string) => {
    const value = text.trim()

    if (!value || pending) return

    const mine: Message = { id: nextId.current++, role: "user", text: value }

    setMessages(prev => [...prev, mine])
    setDraft("")
    setPending(true)

    try {
      const reply = await sendMessage(value)

      setStatus("ok")
      setMessages(prev => [...prev, { id: nextId.current++, role: "bot", text: reply }])
    } catch {
      setStatus("down")
      setMessages(prev => [...prev, {
        id: nextId.current++,
        role: "bot",
        text: `I can't reach my backend right now. Email ${PROFILE.email} or book a workflow audit from the contact section and Ramon will pick it up directly.`,
      }])
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls="chat-panel"
        aria-label={open ? "Close chat" : "Chat with Ramon's assistant"}
        className="fixed bottom-5 right-5 z-[110] flex h-14 w-14 items-center justify-center rounded-full bg-[#111] text-white shadow-[0_8px_28px_-6px_rgba(0,0,0,0.45)] transition-transform duration-300 hover:scale-105 active:scale-95"
      >
        <Ico d={open ? P.close : P.chat} size={22} />
      </button>

      {/* Panel */}
      <div
        id="chat-panel"
        role="dialog"
        aria-label="Chat with Ramon's assistant"
        hidden={!open}
        className="fixed bottom-24 right-5 z-[110] flex w-[calc(100vw-2.5rem)] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-black/10 bg-[#F5F4F0] shadow-[0_24px_60px_-16px_rgba(0,0,0,0.35)]"
        style={{ height: "min(560px, calc(100vh - 8rem))" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-black/[0.08] bg-white/60 px-5 py-4">
          <div>
            <p
              className="text-[15px] font-medium text-[#111]"
              style={{ fontFamily: DISPLAY_FONT }}
            >
              Ask about automation
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-black/68">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  status === "ok" ? "bg-emerald-500" : status === "down" ? "bg-amber-500" : "bg-black/25"
                }`}
              />
              {status === "ok"
                ? "Connected"
                : status === "down"
                  ? "Assistant unavailable"
                  : "Usually replies in seconds"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/10 text-black/68 transition-all hover:border-black/25 hover:text-black"
          >
            <Ico d={P.close} size={14} />
          </button>
        </div>

        {/* Thread */}
        <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
          {messages.map(m => (
            <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <p
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed ${
                  m.role === "user"
                    ? "rounded-br-sm bg-[#111] text-white"
                    : "rounded-bl-sm border border-black/[0.08] bg-white text-black/75"
                }`}
              >
                {m.text}
              </p>
            </div>
          ))}

          {pending && (
            <div className="flex justify-start" aria-live="polite">
              <p className="flex gap-1.5 rounded-2xl rounded-bl-sm border border-black/[0.08] bg-white px-4 py-3.5">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-black/35"
                    style={{ animation: `pulse-dot 1.2s ease-in-out ${i * 0.15}s infinite` }}
                  />
                ))}
              </p>
            </div>
          )}
        </div>

        {/* Suggestions — only while the thread is untouched */}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-1.5 px-5 pb-3">
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => submit(s)}
                className="rounded-full border border-black/12 bg-white/60 px-3 py-1.5 text-[11.5px] text-black/72 transition-all hover:border-black/30 hover:text-black"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Composer */}
        <form
          onSubmit={e => { e.preventDefault(); submit(draft) }}
          className="flex items-center gap-2 border-t border-black/[0.08] bg-white/60 px-4 py-3"
        >
          <label htmlFor="chat-input" className="sr-only">Message</label>
          <input
            id="chat-input"
            ref={inputRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Ask a question…"
            autoComplete="off"
            className="flex-1 bg-transparent px-1 text-[13.5px] text-[#111] placeholder:text-black/58 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!draft.trim() || pending}
            aria-label="Send message"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#111] text-white transition-opacity hover:bg-black disabled:opacity-30"
          >
            <Ico d={P.send} size={15} />
          </button>
        </form>
      </div>
    </>
  )
}
