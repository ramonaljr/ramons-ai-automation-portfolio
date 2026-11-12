'use client'

import { useEffect, useRef, useState } from 'react'

import { ArrowUp, RotateCcw, UserRound } from 'lucide-react'

import { ICON_STROKE } from '@/components/landing/motion'

/**
 * A live chat with the Fernhill support agent: the real n8n workflow, reached
 * through /api/support-demo, which runs every visitor in the build's test
 * mode (nothing reaches Slack or anyone's inbox).
 */

type Escalation = 'approval' | 'handover' | null

type Message = {
  id: number
  role: 'user' | 'bot'
  text: string
  escalation?: Escalation
  tools?: string[]
  kind?: 'error'
}

/** Sample orders from the store's Airtable base, so a visitor has something real to look up. */
const ORDERS = [
  { number: 'FH-1007', email: 'chloe.bennett@example.com', note: 'Delayed by weather' },
  { number: 'FH-1017', email: 'ethan.brooks@example.com', note: 'Delivered last week' },
  { number: 'FH-1011', email: 'owen.macleod@example.com', note: 'Backordered tent' }
]

const SUGGESTIONS = [
  'Where is order FH-1007? My email is chloe.bennett@example.com',
  'Do the Granite Mid boots run true to size?',
  'The pot in FH-1017 arrived dented. I would like a refund. ethan.brooks@example.com',
  'Can you ship fuel canisters to Canada?'
]

const ESCALATION_NOTE: Record<'approval' | 'handover', string> = {
  approval: 'In the live store, this now waits for a person to approve it in Slack.',
  handover: 'In the live store, a person now picks this up from Slack.'
}

/** "Look_Up_Order" as the agent names its tools, "Look up order" as people read it. */
const toolLabel = (name: string) => {
  const words = name.replace(/_/g, ' ').trim()

  return words.charAt(0).toUpperCase() + words.slice(1).toLowerCase()
}

const newSession = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export function SupportDemoChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [pending, setPending] = useState(false)

  const listRef = useRef<HTMLOListElement>(null)
  const sessionRef = useRef<string | null>(null)
  const nextId = useRef(0)

  // Keep the newest message in view as the thread grows.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, pending])

  const add = (message: Omit<Message, 'id'>) => {
    nextId.current += 1
    const id = nextId.current

    setMessages(current => [...current, { ...message, id }])
  }

  const submit = async (text: string) => {
    const message = text.trim()

    if (!message || pending) return

    // A conversation id per visit to this chat, made on the first message so
    // the agent's memory keys on this visitor alone.
    sessionRef.current ??= newSession()

    add({ role: 'user', text: message })
    setDraft('')
    setPending(true)

    try {
      const res = await fetch('/api/support-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sessionId: sessionRef.current })
      })

      const data = (await res.json().catch(() => null)) as {
        reply?: string
        escalation?: Escalation
        tools?: string[]
        error?: string
      } | null

      if (res.status === 429) {
        add({
          role: 'bot',
          kind: 'error',
          text: 'That is the limit for this demo for now. Try again in a few minutes.'
        })
      } else if (!res.ok || !data?.reply) {
        add({
          role: 'bot',
          kind: 'error',
          text: 'The live demo could not answer just now. Please try again in a moment.'
        })
      } else {
        add({ role: 'bot', text: data.reply, escalation: data.escalation ?? null, tools: data.tools ?? [] })
      }
    } catch {
      add({
        role: 'bot',
        kind: 'error',
        text: 'The live demo could not be reached. Check your connection and try again.'
      })
    } finally {
      setPending(false)
    }
  }

  const reset = () => {
    sessionRef.current = null
    setMessages([])
    setDraft('')
  }

  const fresh = messages.length === 0

  return (
    <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]'>
      {/* What to try */}
      <aside className='border-rule bg-surface-raised rounded-2xl border p-6'>
        <p className='text-ink-3 font-mono text-[11px] tracking-[0.2em]'>SAMPLE ORDERS</p>
        <p className='text-ink-3 mt-3 text-[14px] leading-relaxed'>
          The agent shares an order only when the number and email match, as it would for a real customer.
        </p>
        <ul className='mt-5 space-y-3'>
          {ORDERS.map(order => (
            <li key={order.number} className='border-rule rounded-xl border bg-white px-4 py-3'>
              <p className='text-ink font-mono text-[13px]'>{order.number}</p>
              <p className='text-ink-2 mt-0.5 text-[13px] break-all'>{order.email}</p>
              <p className='text-ink-4 mt-1 text-[12px]'>{order.note}</p>
            </li>
          ))}
        </ul>
        <p className='text-ink-4 mt-5 text-[12px] leading-relaxed'>
          Demo mode: refunds and handovers are logged, but nothing is posted to Slack or emailed. Fernhill is a
          fictional store.
        </p>
      </aside>

      {/* The chat */}
      <div className='border-rule flex min-h-[460px] flex-col rounded-2xl border bg-white'>
        <div className='border-rule flex items-center gap-3 border-b px-5 py-3.5'>
          <span className='bg-accent h-2 w-2 rounded-full' aria-hidden='true' />
          <p className='text-ink text-[14px] font-medium'>Fernhill support</p>
          <p className='text-ink-4 text-[12px]'>Live, on n8n</p>
          {!fresh && (
            <button
              type='button'
              onClick={reset}
              className='text-ink-3 hover:text-ink ml-auto inline-flex items-center gap-1.5 text-[12px] transition-colors'
            >
              <RotateCcw size={13} strokeWidth={ICON_STROKE} aria-hidden='true' />
              Start over
            </button>
          )}
        </div>

        {fresh ? (
          <div className='flex-1 px-3 pt-4 pb-2'>
            <p className='text-ink-3 px-3 pb-2 text-[14px] leading-relaxed'>
              Ask anything a customer might, or start with one of these:
            </p>
            {SUGGESTIONS.map(suggestion => (
              <button
                key={suggestion}
                type='button'
                onClick={() => submit(suggestion)}
                className='chat-row group text-left'
              >
                <span className='bg-accent h-1.5 w-1.5 shrink-0 rounded-full' />
                {suggestion}
              </button>
            ))}
          </div>
        ) : (
          <ol
            ref={listRef}
            role='log'
            aria-label='Conversation with the Fernhill support agent'
            aria-live='polite'
            className='chat-scroll max-h-[520px] flex-1 space-y-5 overflow-y-auto px-5 pt-4 pb-5'
          >
            {messages.map(m => (
              <li key={m.id} className='chat-turn'>
                <p className='text-ink-4 mb-1 text-[12px]'>{m.role === 'user' ? 'You' : 'Fernhill support'}</p>
                <p
                  className={`text-[14.5px] leading-[1.6] whitespace-pre-line ${
                    m.role === 'user' ? 'text-ink font-medium' : m.kind === 'error' ? 'text-ink-3' : 'text-ink-2'
                  }`}
                >
                  {m.text}
                </p>
                {m.escalation && (
                  <p className='text-accent mt-2.5 inline-flex items-center gap-1.5 text-[12.5px]'>
                    <UserRound size={13} strokeWidth={ICON_STROKE} aria-hidden='true' />
                    {ESCALATION_NOTE[m.escalation]}
                  </p>
                )}
                {m.tools && m.tools.length > 0 && (
                  <p className='text-ink-4 mt-2 font-mono text-[11px] tracking-wide'>
                    USED: {m.tools.map(toolLabel).join(' · ').toUpperCase()}
                  </p>
                )}
              </li>
            ))}

            {pending && (
              <li className='chat-turn'>
                <p className='text-ink-4 mb-2 text-[12px]'>Fernhill support</p>
                <div className='flex items-center gap-3'>
                  <span className='chat-run' aria-hidden='true'>
                    <i />
                    <b />
                    <i />
                    <b />
                    <i />
                  </span>
                  <span className='text-ink-3 text-[12.5px]'>Checking the store records</span>
                </div>
              </li>
            )}
          </ol>
        )}

        <form
          onSubmit={e => {
            e.preventDefault()
            submit(draft)
          }}
          className='px-3 pt-1.5 pb-3'
        >
          <div className='chat-composer flex items-center gap-2 rounded-2xl bg-white py-[7px] pr-[7px] pl-4'>
            <label htmlFor='support-demo-input' className='sr-only'>
              Message to Fernhill support
            </label>
            <input
              id='support-demo-input'
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder='Ask about an order, a return or a product…'
              autoComplete='off'
              maxLength={500}
              className='text-ink placeholder:text-ink-4 min-w-0 flex-1 bg-transparent text-base focus:outline-none sm:text-[14px]'
            />
            <button
              type='submit'
              disabled={!draft.trim() || pending}
              aria-label='Send message'
              className='bg-ink text-ground hover:bg-ink/90 flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] transition-opacity disabled:opacity-25'
            >
              <ArrowUp size={17} strokeWidth={ICON_STROKE} aria-hidden='true' />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
