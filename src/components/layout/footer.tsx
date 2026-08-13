// Next Imports
import Image from 'next/image'

// Component Imports
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const socials = [
  { label: 'GitHub', src: '/images/footer/github-logo.webp' },
  { label: 'Email', src: '/images/footer/gmail.webp' },
  { label: 'LinkedIn', src: '/images/footer/linkedin.webp' },
  { label: 'X', src: '/images/footer/twitter.webp' }
]

const Footer = () => {
  return (
    <footer className='lg:px-10.5'>
      <div className='mx-auto max-w-4xl space-y-12 pb-12 lg:border-x xl:max-w-245'>
        <div className='flex items-center gap-3'>
          <Separator className='flex-1' />
          <div className='flex items-center gap-3'>
            {socials.map(social => (
              <Button
                key={social.label}
                variant='outline'
                size='icon'
                aria-label={social.label}
                className='hover:bg-muted/5 min-w-10 rounded-md'
              >
                <Image src={social.src} alt={social.label} width={16} height={16} />
              </Button>
            ))}
          </div>
          <Separator className='flex-1' />
        </div>

        <div className='mb-8 flex items-center justify-center gap-5 text-center max-lg:hidden xl:ml-8'>
          <p className='text-muted-foreground'>Thank you, for visiting here</p>
          <img src='/images/footer/tree-seal.webp' alt='Seal' className='size-25' />
          <p className='text-muted-foreground'>Let&apos;s create something beautiful</p>
        </div>

        <div className='-ml-5 space-y-1 text-center'>
          <img src='/images/footer/signature.webp' alt='Seal' className='mx-auto -mb-6 w-60' />
          <p className='text-xs'>@zolt Mercer {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
