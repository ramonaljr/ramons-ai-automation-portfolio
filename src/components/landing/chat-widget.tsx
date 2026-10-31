'use client'

import { useEffect, useRef, useState } from 'react'

import { MessageCircle, Send, X } from 'lucide-react'

import { PROFILE } from '@/lib/portfolio'

import { DISPLAY_FONT, ICON_STROKE } from '@/components/landing/motion'

type Message = { id: number; role: 'user' | 'bot'; text: string }

// Deliberately not a list of platform names: it went stale the moment a
// fourth one was added, and the answer is the same question either way.
const SUGGESTIONS = ['What can you automate for me?', 'Which platform should I use?', 'How much does a build cost?']

const GREETING =
  "Hi, I'm Ramon's assistant. Ask me about automation, the platforms I build on, or how an engagement works."

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

/** Dispatch on `window` to open the chat from anywhere on the page. */
export const OPEN_CHAT_EVENT = 'portfolio:open-chat'

/**
 * Whether the assistant answered its health check. `null` until it has, so
 * nothing is hidden on a guess. Module state plus an event rather than a
 * context provider: the widget mounts once at the layout level and the FAQ's
 * "Ask the assistant" box is the only other reader.
 */
const CHAT_STATUS_EVENT = 'portfolio:chat-status'
let chatAvailable: boolean | null = null

function publishAvailability(value: boolean) {
  chatAvailable = value
  window.dispatchEvent(new Event(CHAT_STATUS_EVENT))
}

export function useChatAvailable() {
  const [available, setAvailable] = useState<boolean | null>(chatAvailable)

  useEffect(() => {
    const sync = () => setAvailable(chatAvailable)

    sync()
    window.addEventListener(CHAT_STATUS_EVENT, sync)

    return () => window.removeEventListener(CHAT_STATUS_EVENT, sync)
  }, [])

  return available
}

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([{ id: 0, role: 'bot', text: GREETING }])
  const [draft, setDraft] = useState('')
  const [pending, setPending] = useState(false)

  // Connection state is reported from what actually happened, never asserted
  // up front. "idle" until a real exchange proves it either way, so the header
  // cannot claim to be connected to a backend that is down.
  const [status, setStatus] = useState<'idle' | 'ok' | 'down'>('idle')

  const available = useChatAvailable()
  const offline = available === false

  // Phones: the launcher steps aside while the page moves, so it never sits on
  // top of the text being read, and returns once scrolling stops.
  const [scrolling, setScrolling] = useState(false)

  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const nextId = useRef(1)

  // Keep the newest message in view as the thread grows.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, pending])

  // One health check per visit, after the page has settled. A failed check
  // hides the launcher: a chat that can only say it is unavailable is worse
  // than none, and the page's email links still work.
  useEffect(() => {
    if (chatAvailable !== null) return

    const timer = window.setTimeout(() => {
      fetch('/api/chat')
        .then(r => r.json())
        .then((d: { ok?: boolean }) => publishAvailability(d?.ok === true))
        .catch(() => publishAvailability(false))
    }, 2000)

    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    let timer = 0

    const onScroll = () => {
      setScrolling(true)
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setScrolling(false), 700)
    }

    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.clearTimeout(timer)
    }
  }, [])

  // Other parts of the page (the FAQ's "Ask the assistant") open the chat by
  // event rather than by prop, so the widget stays self-contained.
  useEffect(() => {
    const openChat = () => setOpen(true)

    window.addEventListener(OPEN_CHAT_EVENT, openChat)

    return () => window.removeEventListener(OPEN_CHAT_EVENT, openChat)
  }, [])

  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('keydown', onKey)
    inputRef.current?.focus()

    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const submit = async (text: string) => {
    const value = text.trim()

    if (!value || pending) return

    const mine: Message = { id: nextId.current++, role: 'user', text: value }

    setMessages(prev => [...prev, mine])
    setDraft('')
    setPending(true)

    try {
      const reply = await sendMessage(value)

      setStatus('ok')
      setMessages(prev => [...prev, { id: nextId.current++, role: 'bot', text: reply }])
    } catch {
      setStatus('down')
      setMessages(prev => [
        ...prev,
        {
          id: nextId.current++,
          role: 'bot',
          text: `I can't reach my backend right now. Email ${PROFILE.email} or book a free call from the contact section and Ramon will pick it up directly.`
        }
      ])
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      {/* Launcher. Always shown: when the health check fails, the panel offers
          email and a call instead of a dead chat, rather than the icon simply
          vanishing (it did, and read as a broken page). */}
      <button
        type='button'
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls='chat-panel'
        aria-label={open ? 'Close chat' : "Chat with Ramon's assistant"}
        className={`bg-ink text-ground fixed right-4 bottom-4 z-[110] flex h-12 w-12 items-center justify-center rounded-full shadow-[0_0_0_1px_rgba(255,255,255,0.16),0_8px_28px_-6px_rgba(0,0,0,0.45)] transition-[transform,opacity] duration-300 hover:scale-105 active:scale-95 sm:right-5 sm:bottom-5 sm:h-14 sm:w-14 ${
          scrolling && !open ? 'max-sm:pointer-events-none max-sm:translate-y-20 max-sm:opacity-0' : ''
        }`}
      >
        {open ? (
          <X size={22} strokeWidth={ICON_STROKE} aria-hidden='true' />
        ) : (
          <MessageCircle size={22} strokeWidth={ICON_STROKE} aria-hidden='true' />
        )}
      </button>

      {/* Panel */}
      <div
        id='chat-panel'
        role='dialog'
        aria-label="Chat with Ramon's assistant"
        hidden={!open}
        className='border-rule bg-ground fixed right-5 bottom-24 z-[110] flex w-[calc(100vw-2.5rem)] max-w-[380px] flex-col overflow-hidden rounded-2xl border shadow-[0_24px_60px_-16px_rgba(0,0,0,0.35)]'
        style={{ height: 'min(560px, calc(100vh - 8rem))' }}
      >
        {/* Header */}
        <div className='border-rule bg-surface flex items-start justify-between gap-3 border-b px-5 py-4'>
          <div>
            <p className='text-ink text-[15px] font-medium' style={{ fontFamily: DISPLAY_FONT }}>
              Ask about automation
            </p>
            <p className='text-ink-2 mt-0.5 flex items-center gap-1.5 text-[12px]'>
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  status === 'ok' ? 'bg-emerald-500' : status === 'down' || offline ? 'bg-amber-500' : 'bg-ink/25'
                }`}
              />
              {status === 'ok'
                ? 'Connected'
                : offline
                  ? 'Assistant offline'
                  : status === 'down'
                    ? 'Assistant unavailable'
                    : 'Usually replies in seconds'}
            </p>
          </div>
          <button
            type='button'
            onClick={() => setOpen(false)}
            aria-label='Close chat'
            className='border-rule text-ink-2 hover:border-rule-strong hover:text-ink flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all'
          >
            <X size={14} strokeWidth={ICON_STROKE} aria-hidden='true' />
          </button>
        </div>

        {/* Offline: the health check failed, so offer the two ways that do
            not depend on the assistant instead of a chat that cannot answer. */}
        {offline && (
          <div className='flex flex-1 flex-col justify-center gap-4 px-6 py-8'>
            <p className='text-ink text-[15px] leading-relaxed'>The assistant is offline right now.</p>
            <p className='text-ink-2 text-[13.5px] leading-relaxed'>
              You can still reach me directly by email or by booking a call.
            </p>
            <div className='flex flex-col gap-2 pt-1'>
              <a
                href={`mailto:${PROFILE.email}`}
                className='bg-ink text-ground hover:bg-ink/90 rounded-full px-4 py-2.5 text-center text-[13.5px] transition-colors'
              >
                Email Ramon
              </a>
              <a
                href='#contact'
                onClick={() => setOpen(false)}
                className='border-rule-strong text-ink hover:bg-ink/3 rounded-full border px-4 py-2.5 text-center text-[13.5px] transition-colors'
              >
                Book a free call
              </a>
            </div>
          </div>
        )}

        {/* Thread */}
        <div ref={listRef} className='flex-1 space-y-3 overflow-y-auto px-5 py-5' hidden={offline}>
          {messages.map(m => (
            <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
              <p
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-ink text-ground rounded-br-sm'
                    : 'border-rule bg-surface-raised text-ink-2 rounded-bl-sm border'
                }`}
              >
                {m.text}
              </p>
            </div>
          ))}

          {pending && (
            <div className='flex justify-start' aria-live='polite'>
              <p className='border-rule bg-surface-raised flex gap-1.5 rounded-2xl rounded-bl-sm border px-4 py-3.5'>
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className='bg-ink/35 h-1.5 w-1.5 rounded-full'
                    style={{ animation: `pulse-dot 1.2s ease-in-out ${i * 0.15}s infinite` }}
                  />
                ))}
              </p>
            </div>
          )}
        </div>

        {/* Suggestions — only while the thread is untouched */}
        {messages.length === 1 && !offline && (
          <div className='flex flex-wrap gap-1.5 px-5 pb-3'>
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                type='button'
                onClick={() => submit(s)}
                className='border-rule bg-surface text-ink-2 hover:border-rule-strong hover:text-ink rounded-full border px-3 py-1.5 text-[11.5px] transition-all'
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Composer */}
        <form
          hidden={offline}
          onSubmit={e => {
            e.preventDefault()
            submit(draft)
          }}
          className='border-rule bg-surface flex items-center gap-2 border-t px-4 py-3'
        >
          <label htmlFor='chat-input' className='sr-only'>
            Message
          </label>
          <input
            id='chat-input'
            ref={inputRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder='Ask a question…'
            autoComplete='off'
            className='text-ink placeholder:text-ink-3 flex-1 bg-transparent px-1 text-[13.5px] focus:outline-none'
          />
          <button
            type='submit'
            disabled={!draft.trim() || pending}
            aria-label='Send message'
            className='bg-ink text-ground hover:bg-ink/90 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-opacity disabled:opacity-30'
          >
            <Send size={15} strokeWidth={ICON_STROKE} aria-hidden='true' />
          </button>
        </form>
      </div>
    </>
  )
}
