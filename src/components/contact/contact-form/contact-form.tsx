'use client'

// Third-party Imports
import { useEffect } from 'react'

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
  'h-12 rounded-xl border-black/[0.10] bg-white/70 text-[14px] text-[#111] placeholder:text-black/30 focus-visible:border-black/30 focus-visible:ring-0'

const LABEL = 'font-mono text-[11px] tracking-[0.18em] text-black/45'

const ContactForm = ({ className }: ContactFormProps) => {
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

      form.setValue(
        'message',
        `I'd like to book the ${time} slot on ${readable} (PH time).\n\nThe process I want to automate:\n`
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSubmit = (values: ContactFormValues) => {
    console.log(values)
    toast.success("Message sent — I'll get back to you as soon as possible.")
    form.reset()
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
              <Select value={field.value || undefined} onValueChange={field.onChange}>
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
          className='group inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#111] py-2 pr-2 pl-6 text-[13px] tracking-wide text-white transition-colors hover:bg-black'
        >
          SEND IT OVER
          <span className='flex h-9 w-9 items-center justify-center rounded-full bg-white/15 transition-colors group-hover:bg-white/25'>
            <ArrowIcon />
          </span>
        </button>
      </form>
    </Form>
  )
}

export default ContactForm
