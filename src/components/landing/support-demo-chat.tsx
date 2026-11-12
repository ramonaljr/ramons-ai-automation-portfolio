'use client'

import { useEffect, useRef, useState } from 'react'

import { ArrowUp, RotateCcw, UserRound } from 'lucide-react'

import { ICON_STROKE } from '@/components/landing/motion'

/**
 * A live chat with the Fernhill support agent, drawn as the WhatsApp thread a
 * customer sees: the real n8n workflow, reached through /api/support-demo with
 * channel "whatsapp", in the build's test mode (nothing reaches Slack, anyone's
 * inbox or anyone's phone).
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
          Sandbox: this is the same agent that answers on WhatsApp. Refunds and handovers are logged, but nothing is
          posted to Slack, emailed or sent to a phone. Fernhill is a fictional store.
        </p>
      </aside>

      {/* The chat, drawn as a WhatsApp thread: the build's main channel. */}
      <div className='flex min-h-[460px] flex-col overflow-hidden rounded-2xl border border-[#e2ddd5] bg-[#efeae2]'>
        <div className='flex items-center gap-3 bg-[#008069] px-4 py-3 text-white'>
          <span
            className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/90 text-[13px] font-semibold text-[#008069]'
            aria-hidden='true'
          >
            FO
          </span>
          <div className='min-w-0'>
            <p className='text-[14.5px] leading-tight font-medium'>Fernhill Outdoor Supply</p>
            <p className='text-[12px] leading-tight text-white/80'>WhatsApp sandbox · live agent on n8n</p>
          </div>
          {!fresh && (
            <button
              type='button'
              onClick={reset}
              className='ml-auto inline-flex items-center gap-1.5 text-[12px] text-white/85 transition-colors hover:text-white'
            >
              <RotateCcw size={13} strokeWidth={ICON_STROKE} aria-hidden='true' />
              Start over
            </button>
          )}
        </div>

        {fresh ? (
          <div className='flex-1 px-3 pt-4 pb-2'>
            <p className='mx-auto mb-3 w-fit rounded-lg bg-[#fff5c4] px-3 py-1.5 text-center text-[12.5px] leading-snug text-[#54656f]'>
              Ask anything a customer might, or start with one of these:
            </p>
            {SUGGESTIONS.map(suggestion => (
              <button
                key={suggestion}
                type='button'
                onClick={() => submit(suggestion)}
                className='mb-2 ml-auto block max-w-[88%] rounded-lg rounded-tr-none bg-[#d9fdd3] px-3 py-2 text-left text-[14px] leading-snug text-[#111b21] shadow-[0_1px_0.5px_rgb(11_20_26/13%)] transition-[filter] hover:brightness-95'
              >
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
            className='chat-scroll flex max-h-[520px] flex-1 flex-col gap-2 overflow-y-auto px-3 pt-4 pb-4'
          >
            {messages.map(m => (
              <li
                key={m.id}
                className={`chat-turn max-w-[88%] rounded-lg px-3 py-2 shadow-[0_1px_0.5px_rgb(11_20_26/13%)] ${
                  m.role === 'user' ? 'self-end rounded-tr-none bg-[#d9fdd3]' : 'self-start rounded-tl-none bg-white'
                }`}
              >
                <span className='sr-only'>{m.role === 'user' ? 'You: ' : 'Fernhill support: '}</span>
                <p
                  className={`text-[14.5px] leading-[1.5] whitespace-pre-line ${
                    m.kind === 'error' ? 'text-[#667781]' : 'text-[#111b21]'
                  }`}
                >
                  {m.text}
                </p>
                {m.escalation && (
                  <p className='mt-2 inline-flex items-center gap-1.5 text-[12.5px] text-[#008069]'>
                    <UserRound size={13} strokeWidth={ICON_STROKE} aria-hidden='true' />
                    {ESCALATION_NOTE[m.escalation]}
                  </p>
                )}
                {m.tools && m.tools.length > 0 && (
                  <p className='mt-1.5 font-mono text-[10.5px] tracking-wide text-[#667781]'>
                    USED: {m.tools.map(toolLabel).join(' · ').toUpperCase()}
                  </p>
                )}
              </li>
            ))}

            {pending && (
              <li className='chat-turn flex items-center gap-3 self-start rounded-lg rounded-tl-none bg-white px-3 py-2.5 shadow-[0_1px_0.5px_rgb(11_20_26/13%)]'>
                <span className='chat-run' aria-hidden='true'>
                  <i />
                  <b />
                  <i />
                  <b />
                  <i />
                </span>
                <span className='text-[12.5px] text-[#667781]'>Checking the store records</span>
              </li>
            )}
          </ol>
        )}

        <form
          onSubmit={e => {
            e.preventDefault()
            submit(draft)
          }}
          className='flex items-center gap-2 bg-[#f0f2f5] px-3 py-2.5'
        >
          <label htmlFor='support-demo-input' className='sr-only'>
            Message to Fernhill support
          </label>
          <input
            id='support-demo-input'
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder='Type a message'
            autoComplete='off'
            maxLength={500}
            className='min-w-0 flex-1 rounded-full bg-white px-4 py-2.5 text-base text-[#111b21] placeholder:text-[#667781] focus:outline-none sm:text-[14px]'
          />
          <button
            type='submit'
            disabled={!draft.trim() || pending}
            aria-label='Send message'
            className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#00a884] text-white transition-opacity disabled:opacity-40'
          >
            <ArrowUp size={18} strokeWidth={ICON_STROKE} aria-hidden='true' />
          </button>
        </form>
      </div>
    </div>
  )
}
