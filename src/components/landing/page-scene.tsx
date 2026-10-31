import Image from 'next/image'

import { ParticleField } from '@/components/landing/particle-field'

/**
 * The autumn scene behind a sub-page header, so /services, /blog, /contact
 * and the articles open in the same place the homepage does: branches at the
 * top right, warm light falling through them, and (where the page has no
 * leaf layer of its own above the fold) falling leaves. The whole scene
 * fades out down the header, clear of the copy on the left.
 *
 * It sits behind the header's content; the header needs `relative isolate`.
 */
export function PageScene({ leaves = false }: { leaves?: boolean }) {
  return (
    <div aria-hidden='true' className='page-scene'>
      <Image
        src='/images/landing/autumn-environment-overlay.webp'
        alt=''
        fill
        sizes='100vw'
        loading='eager'
        className='page-scene-branches'
      />
      <div className='blossom-story-rays page-scene-rays'>
        <i />
        <i />
      </div>
      {leaves && <ParticleField />}
    </div>
  )
}
