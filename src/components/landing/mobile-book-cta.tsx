'use client'

import { useEffect, useState } from 'react'

/**
 * Phones only. Below `md` the nav's "Book a free call" lives inside the burger
 * menu, so once the hero's buttons scroll away nothing on screen offers the
 * call until the contact section, about thirty screens down. This keeps one
 * button within thumb reach for that stretch.
 *
 * It waits until the hero is mostly gone, so it never doubles up with the
 * hero's own button, and steps aside once the contact section is on screen,
 * where the booking calendar takes over. The right edge stays clear of the
 * chat launcher, which sits at the same height.
 */
export function MobileBookCta() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const contact = document.getElementById('contact')
    let frame = 0

    const update = () => {
      frame = 0
      const pastHero = window.scrollY > window.innerHeight * 0.8
      const atContact = contact ? contact.getBoundingClientRect().top < window.innerHeight : false

      setVisible(pastHero && !atContact)
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <a
      href='#contact'
      aria-hidden={!visible}
      tabIndex={visible ? undefined : -1}
      className={`bg-ink text-fine text-ground fixed right-20 bottom-4 left-4 z-40 flex h-12 items-center justify-center rounded-full shadow-[0_8px_28px_-6px_rgba(0,0,0,0.45)] transition-[opacity,transform,visibility] duration-300 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 md:hidden ${
        visible ? 'visible translate-y-0 opacity-100' : 'pointer-events-none invisible translate-y-20 opacity-0'
      }`}
    >
      Book a free call
    </a>
  )
}
