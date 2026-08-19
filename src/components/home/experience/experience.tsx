// Component Imports
import Eyebrow from '@/components/shared/eyebrow/eyebrow'
import Timeline from '@/components/ui/timeline'
import ActivityCard from './activity-card'
import ExperienceTimelineItem from './experience-timeline-item'

const EXPERIENCES = [
  {
    index: '01',
    logo: '/images/features/logo-01.webp',
    company: 'Autonomous Systems & AI Consulting',
    role: 'Lead AI Automation Engineer',
    period: '2024 -',
    status: { text: 'Present', tone: 'positive' as const },
    stack: ['LangChain', 'LangGraph', 'OpenAI', 'Anthropic', 'n8n', 'Python'],
    achievement: 'Designed multi-agent systems automating 80%+ of client support & lead triage',
    description:
      'Architecting end-to-end autonomous agent networks and workflow automations for growth-stage businesses. Implemented deterministic tool-use pipelines, custom vector embeddings, and real-time event triggers.'
  },
  {
    index: '02',
    logo: '/images/features/logo-02.webp',
    company: 'AI Platforms & SaaS Solutions',
    role: 'Full-Stack AI Engineer',
    period: '2023 - 2024',
    stack: ['Next.js', 'FastAPI', 'PostgreSQL', 'Vector DBs', 'RAG'],
    achievement: 'Engineered AI-native platforms with sub-2s query response and automated ingestion',
    description:
      'Developed AI-powered web applications and CRMs with automated email parsing, structured document extraction, and seamless third-party API integrations.'
  },
  {
    index: '03',
    logo: '/images/features/logo-03.webp',
    company: 'Quantitative & Automation Lab',
    role: 'Systems & Data Pipeline Engineer',
    period: '2023',
    stack: ['Python', 'Data Pipelines', 'APIs', 'Async Automation'],
    achievement: 'Built high-throughput data processing pipelines handling real-time financial streams',
    description:
      'Created custom automation scrapers, data normalization workflows, and automated backtesting alerts with zero human intervention required.'
  },
  {
    index: '04',
    logo: '/images/features/logo-04.webp',
    company: 'Open Source & AI Labs',
    role: 'Independent AI Builder',
    period: '2022 -',
    status: { text: 'Ongoing · Research', tone: 'accent' as const },
    stack: ['Autonomous Agents', 'TypeScript', 'Python', 'MCP Tools'],
    achievement: 'Created custom AI toolkits, agent plugins, and open-source automations',
    description:
      'Experimenting with cutting-edge agentic architectures, self-correcting prompt flows, and bespoke automation hooks to push autonomous computing forward.'
  }
]

const Experience = () => {
  return (
    <section id='experience' className='min-w-0 border-b py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:space-y-16 lg:px-10.5'>
        <div className='space-y-2'>
          <Eyebrow>Stacks & Experience</Eyebrow>
          <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>
            Where i&apos;m good and where i learned from
          </h2>
        </div>

        <ActivityCard />

        <Timeline
          data={EXPERIENCES.map(({ index, ...experience }) => ({
            index,
            content: <ExperienceTimelineItem {...experience} />
          }))}
        />
      </div>
    </section>
  )
}

export default Experience
