'use client'

// Third-party Imports
import { useEffect, useState } from 'react'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

// Type Imports
import type { ContactFormValues } from './contact-form-schema'
import { contactFormSchema, SERVICE_OPTIONS } from './contact-form-schema'

// Component Imports
import { ArrowIcon } from '@/components/landing/motion'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from '@/components/ui/select'

// Util Imports
import { cn } from '@/lib/utils'

type ContactFormProps = {
  className?: string
}

// Landing-page field chrome: hairline on white, mono label above.
const FIELD =
  'h-12 rounded-xl border-rule bg-surface text-[14px] text-ink placeholder:text-ink-4 focus-visible:border-rule-strong focus-visible:ring-0'

const LABEL = 'font-mono text-[11px] tracking-[0.18em] text-ink-3'

const ContactForm = ({ className }: ContactFormProps) => {
  // A slot arriving in the query string is what separates a booking from a
  // general enquiry, so it is held in state rather than only read once to
  // prefill the message: submit needs it to choose an endpoint.
  const [slot, setSlot] = useState<{ date: string; time: string } | null>(null)
  const [pending, setPending] = useState(false)

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      service: '',
      message: ''
    }
  })

  // The booking panel on the landing page links here carrying a chosen slot.
  // Read it from location rather than useSearchParams so /contact stays static.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const date = params.get('date')
    const time = params.get('time')
    const topic = params.get('topic')

    if (topic) {
      const match = SERVICE_OPTIONS.find(o => o.toLowerCase().startsWith(topic.toLowerCase()))

      form.setValue('service', match ?? SERVICE_OPTIONS[0])
    }

    if (date && time) {
      const readable = new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })

      setSlot({ date, time })
      form.setValue(
        'message',
        `I'd like to book the ${time} slot on ${readable} (PH time).\n\nThe process I want to automate:\n`
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSubmit = async (values: ContactFormValues) => {
    if (pending) return

    setPending(true)

    // With a slot the submission books a real calendar event; without one it
    // is an enquiry. Same form, two endpoints, decided by what the landing
    // page passed through.
    const booking = slot !== null

    const endpoint = booking ? '/api/booking' : '/api/contact'

    const payload = booking
      ? {
          name: values.name,
          email: values.email,
          date: slot.date,
          time: slot.time,
          topic: values.service,
          notes: values.message
        }
      : values

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = (await res.json().catch(() => null)) as {
        ok?: boolean
        error?: string
        message?: string
        reference?: string
      } | null

      if (res.ok && data?.ok) {
        toast.success(
          booking
            ? `Booked for ${slot.time} on ${slot.date}. Check your email for the calendar invite${data.reference ? ` — reference ${data.reference}` : ''}.`
            : "Message sent — I'll get back to you as soon as possible."
        )
        form.reset()
        setSlot(null)

        return
      }

      // 409 is the interesting one: the slot went while the form was open.
      // Saying so beats a generic failure, because the fix is to pick again.
      if (res.status === 409) {
        toast.error(data?.message ?? 'That slot is no longer free. Please pick another time.')

        return
      }

      toast.error(
        res.status === 503
          ? 'Cannot reach the booking service right now. Please email me directly.'
          : 'Something went wrong sending that. Please try again, or email me directly.'
      )
    } catch {
      toast.error('Network error. Please try again, or email me directly.')
    } finally {
      setPending(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn('space-y-6', className)}>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem className='gap-2'>
              <FormLabel className={LABEL}>YOUR NAME</FormLabel>
              <FormControl>
                <Input placeholder='Dana Whitfield' className={FIELD} {...field} />
              </FormControl>
              <FormMessage className='text-[12px]' />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem className='gap-2'>
              <FormLabel className={LABEL}>EMAIL</FormLabel>
              <FormControl>
                <Input type='email' placeholder='you@company.com' className={FIELD} {...field} />
              </FormControl>
              <FormMessage className='text-[12px]' />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='service'
          render={({ field }) => (
            <FormItem className='gap-2'>
              <FormLabel className={LABEL}>WHAT YOU NEED</FormLabel>
              {/* `null`, not `undefined`: Base UI decides controlled-ness from
                  the first render and treats only `undefined` as uncontrolled.
                  With `|| undefined` the prefill below flipped the Select from
                  uncontrolled to controlled and it warned. */}
              <Select value={field.value || null} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className={cn(FIELD, 'h-12! w-full')}>
                    <SelectValue placeholder='Pick the closest fit' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    {SERVICE_OPTIONS.map(service => (
                      <SelectItem key={service} value={service}>
                        {service}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage className='text-[12px]' />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='message'
          render={({ field }) => (
            <FormItem className='gap-2'>
              <FormLabel className={LABEL}>THE PROCESS YOU WANT TO AUTOMATE</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='What happens today, who does it, and how often. Rough is fine.'
                  className={cn(FIELD, 'min-h-36 py-3 leading-relaxed')}
                  {...field}
                />
              </FormControl>
              <FormMessage className='text-[12px]' />
            </FormItem>
          )}
        />

        <button
          type='submit'
          disabled={pending}
          className='group bg-ink text-ground hover:bg-ink/90 inline-flex w-full items-center justify-center gap-3 rounded-full py-2 pr-2 pl-6 text-[13px] tracking-wide transition-colors disabled:opacity-60'
        >
          {pending ? 'SENDING…' : slot ? 'CONFIRM THIS SLOT' : 'SEND IT OVER'}
          <span className='flex h-9 w-9 items-center justify-center rounded-full bg-white/15 transition-colors group-hover:bg-white/25'>
            <ArrowIcon />
          </span>
        </button>
      </form>
    </Form>
  )
}

export default ContactForm
