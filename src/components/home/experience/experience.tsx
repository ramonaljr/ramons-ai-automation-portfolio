// Component Imports
import Eyebrow from '@/components/shared/eyebrow/eyebrow'
import Timeline from '@/components/ui/timeline'
import ActivityCard from './activity-card'
import ExperienceTimelineItem from './experience-timeline-item'

const EXPERIENCES = [
  {
    index: '01',
    logo: '/images/features/logo-01.webp',
    company: 'My Mountain Mover',
    role: 'Financial Analyst (AI & Valuation)',
    period: '2022 -',
    status: { text: 'Present · US Remote', tone: 'positive' as const },
    stack: ['Claude', 'OpenAI', 'DCF Valuation', 'n8n', 'Python', 'Excel'],
    achievement: 'Automated DCF valuation modeling and earnings-call analysis pipelines',
    description:
      'Maintain DCF valuation models and financial statement forecasts for US portfolios. Leverage Claude and AI automation daily to accelerate research, financial analysis, and structured reporting workflows.'
  },
  {
    index: '02',
    logo: '/images/features/logo-02.webp',
    company: 'Johndorf Ventures Corporation',
    role: 'Branch Accountant',
    period: '2020 - 2021',
    stack: ['Team Leadership', 'AP/AR', 'Reconciliation', 'SAP', 'Process Mapping'],
    achievement: 'Led a 10-person accounting team delivering monthly & annual closes',
    description:
      'Owned and documented repeatable close, reconciliation, and approval processes across AP, AR, and disbursement — establishing the exact process-mapping discipline required for enterprise automation.'
  },
  {
    index: '03',
    logo: '/images/features/logo-03.webp',
    company: 'Johndorf Ventures Corporation',
    role: 'Project Cost Accountant',
    period: '2016 - 2020',
    stack: ['Cost Accounting', 'Variance Analysis', 'QuickBooks', 'Workbooks'],
    achievement: 'Reconciled multi-million project cost ledgers with automated reporting',
    description:
      'Performed standard costing and variance analysis for a major real estate developer. Reconciled material, labor, and overhead costs against item ledgers and built recurring reporting systems.'
  },
  {
    index: '04',
    logo: '/images/features/logo-04.webp',
    company: 'Johndorf Ventures Corporation',
    role: 'AP Supervisor & Tax Compliance Analyst',
    period: '2015 - 2018',
    status: { text: 'Accounting Operations', tone: 'accent' as const },
    stack: ['Tax Compliance', 'Invoicing', 'Vendor Reconciliation', 'Voucher Controls'],
    achievement: 'Supervised full AP lifecycle and strict statutory filing calendars',
    description:
      'Supervised end-to-end invoice processing, vendor aging, and voucher controls. Managed statutory tax compliance calendars — high-volume, rules-based operations prime for automation.'
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
