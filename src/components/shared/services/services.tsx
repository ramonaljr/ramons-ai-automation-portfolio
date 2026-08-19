'use client'

// React Imports
import { useEffect, useRef, useState } from 'react'

// Third-party Imports
import { MinusIcon, PlusIcon } from 'lucide-react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'

// Component Imports
import Eyebrow from '@/components/shared/eyebrow/eyebrow'
import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from '@/components/ui/accordion'

const SERVICES = [
  {
    title: 'n8n AI Agents & Workflow Automation',
    image: '/images/services/thumb-01.webp',
    duration: '1 to 3 weeks',
    tools: ['n8n (Cloud & Self-Hosted)', 'Webhooks', 'Triggers', 'Error Handling'],
    description:
      'I design, build, and deploy production-grade n8n automations and autonomous AI agents that run 24/7, connect your apps, and execute complex multi-step workflows with zero human intervention.'
  },
  {
    title: 'End-to-End Business Process Automation',
    image: '/images/services/thumb-02.webp',
    duration: '2 to 4 weeks',
    tools: ['CRMs', 'Operations', 'Onboarding', 'Invoicing & AP/AR', 'Approval Flows'],
    description:
      'I eliminate repetitive manual bottlenecks across your entire business — lead management, client onboarding, automated reporting, data validation, and multi-department approval flows.'
  },
  {
    title: 'Claude, OpenAI & LLM Integrations (RAG)',
    image: '/images/services/thumb-03.webp',
    duration: '1 to 3 weeks',
    tools: ['Claude 3.5 Sonnet', 'OpenAI GPT-4o', 'DeepSeek', 'Prompt Engineering', 'RAG'],
    description:
      'I embed frontier LLM intelligence into your daily operations to classify incoming emails, extract structured data from unstructured documents/PDFs, and power secure internal knowledge bases.'
  },
  {
    title: 'Cross-Platform SaaS & API Integrations',
    image: '/images/services/thumb-04.webp',
    duration: '1 to 2 weeks',
    tools: ['Google Workspace', 'Airtable', 'Notion', 'Slack & Telegram', 'REST APIs'],
    description:
      'I synchronize your disparate software tools into a unified, real-time ecosystem — ensuring clean data flows automatically between spreadsheets, databases, and communication channels.'
  },
  {
    title: 'Autonomous AI Voice & Customer Agents',
    image: '/images/services/thumb-05.webp',
    duration: '2 to 3 weeks',
    tools: ['VAPI', 'Retell AI', 'ElevenLabs', 'Cal.com', 'WhatsApp & Twilio'],
    description:
      'I build human-like AI voice receptionists and conversational chatbots that handle customer inquiries, qualify inbound prospects, and book confirmed calendar appointments 24/7.'
  }
]

const Services = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [displayedIndex, setDisplayedIndex] = useState<number | null>(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 300, damping: 30, mass: 0.5 })
  const springY = useSpring(mouseY, { stiffness: 300, damping: 30, mass: 0.5 })

  const offsetX = useTransform(springX, value => `calc(${value}px - 50%)`)
  const offsetY = useTransform(springY, value => `calc(${value}px - 50%)`)

  const rawTilt = useMotionValue(-8)
  const tilt = useSpring(rawTilt, { stiffness: 300, damping: 20 })

  useEffect(() => {
    rawTilt.set(hoveredIndex !== null && hoveredIndex % 2 === 1 ? 8 : -8)
  }, [hoveredIndex, rawTilt])

  const handleServiceMouseEnter = (index: number) => {
    setHoveredIndex(index)
    setDisplayedIndex(index)
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()

    mouseX.set(event.clientX - bounds.left)
    mouseY.set(event.clientY - bounds.top)
  }

  const handleContainerMouseEnter = () => {
    if (!containerRef.current) return

    containerRef.current.style.setProperty('cursor', 'none', 'important')
    containerRef.current
      .querySelectorAll('button')
      .forEach(button => button.style.setProperty('cursor', 'none', 'important'))
  }

  const handleContainerMouseLeave = () => {
    if (containerRef.current) {
      containerRef.current.style.removeProperty('cursor')
      containerRef.current.querySelectorAll('button').forEach(button => button.style.removeProperty('cursor'))
    }

    setHoveredIndex(null)
  }

  return (
    <section id='services' className='border-b py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:space-y-16 lg:px-10.5'>
        <div className='space-y-2'>
          <Eyebrow>Services I provide</Eyebrow>
          <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>I can help you with these things</h2>
        </div>

        <div
          ref={containerRef}
          className='relative mx-auto'
          onMouseMove={handleMouseMove}
          onMouseEnter={handleContainerMouseEnter}
          onMouseLeave={handleContainerMouseLeave}
        >
          <Accordion className='divide-y'>
            {SERVICES.map((service, index) => (
              <AccordionItem key={service.title} value={index} onMouseEnter={() => handleServiceMouseEnter(index)}>
                <AccordionTrigger className='text-primary text-lg sm:text-xl lg:text-[26px]'>
                  <span>
                    {index + 1}. {service.title}
                  </span>
                  <span className='bg-card relative flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full'>
                    <PlusIcon className='text-accent size-4 rotate-0 opacity-100 transition-all duration-300 group-data-panel-open:rotate-90 group-data-panel-open:opacity-0' />
                    <MinusIcon className='text-accent absolute size-4 -rotate-90 opacity-0 transition-all duration-300 group-data-panel-open:rotate-0 group-data-panel-open:opacity-100' />
                  </span>
                </AccordionTrigger>
                <AccordionPanel>
                  <div className='mt-2 space-y-4'>
                    <p className='text-sm font-medium tracking-wide uppercase'>{service.duration}</p>
                    <p className='mb-1 flex flex-wrap items-center gap-3 text-sm font-medium tracking-wide uppercase'>
                      {service.tools.map((tool, toolIndex) => (
                        <span key={tool} className='flex items-center gap-2'>
                          {tool}
                          {toolIndex < service.tools.length - 1 && <span className='text-accent'>✦</span>}
                        </span>
                      ))}
                    </p>
                    <p className='text-muted-foreground text-base'>{service.description}</p>
                  </div>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>

          <motion.div
            style={{ x: offsetX, y: offsetY, rotate: tilt, opacity: hoveredIndex === null ? 0 : 1 }}
            className='dark:bg-muted-foreground/50 pointer-events-none absolute top-0 left-0 z-10 hidden w-44 rounded-lg bg-white p-1 shadow-xl transition-opacity duration-200 sm:block'
          >
            {displayedIndex !== null && (
              <img
                src={SERVICES[displayedIndex].image}
                alt='Accordion Thumb'
                className='h-auto w-full rounded-lg object-cover'
              />
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Services
