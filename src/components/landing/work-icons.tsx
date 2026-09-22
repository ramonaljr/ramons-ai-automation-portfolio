/**
 * The icons the work cards and the case-study dialog both draw on.
 *
 * They lived in the dialog while it was the only place a walkthrough or a repo
 * could be linked. The cards now carry the same two links, and one copy of a
 * GitHub path is enough.
 */

/** A single-path outline glyph on the shared 24px grid. */
export function Ico({ d, size = 13 }: { d: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path d={d} />
    </svg>
  )
}

export function VideoIcon({ size = 13 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <polygon points='23 7 16 12 23 17 23 7' />
      <rect x='1' y='5' width='15' height='14' rx='2' ry='2' />
    </svg>
  )
}

export function GitHubIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z'
      />
    </svg>
  )
}

export const P = {
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z',

  // Sustained volume rather than per-run latency — see `speedKind`.
  stack: 'M12 2l9 5-9 5-9-5 9-5zM3 17l9 5 9-5M3 12l9 5 9-5',
  arrow: 'M4 12h14M13 6l6 6-6 6',
  close: 'M6 18L18 6M6 6l12 12',
  external: 'M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3'
}

/**
 * A link that is a link only when there is something to link to.
 *
 * Rendered as a `span` when empty rather than a disabled `a`: an anchor with
 * no href is already unfocusable and unclickable, but a span says so in the
 * accessibility tree too, and `aria-disabled` tells a screen reader why it is
 * being offered at all.
 */
export function WorkLink({
  href,
  label,
  icon,
  sameTab = false,
  onClick
}: {
  href?: string | null
  label: string
  icon: React.ReactNode

  /** Internal routes stay in the tab; a walkthrough or a repo does not. */
  sameTab?: boolean

  /** Given instead of `href` when the action happens on this page. */
  onClick?: () => void
}) {
  const className =
    'work-aux-link border-rule-strong text-meta text-ink inline-flex items-center gap-2 rounded-full border px-4 py-2.5 font-mono tracking-wide transition-all'

  // An action rather than a destination, so it is a button and never inert.
  if (onClick) {
    return (
      <button type='button' className={className} onClick={onClick}>
        {icon}
        {label}
      </button>
    )
  }

  if (!href) {
    return (
      <span className={className} data-empty='true' aria-disabled='true' title={`${label} not published yet`}>
        {icon}
        {label}
      </span>
    )
  }

  return (
    <a
      href={href}
      target={sameTab ? undefined : '_blank'}
      rel={sameTab ? undefined : 'noopener noreferrer'}
      className={className}
    >
      {icon}
      {label}
    </a>
  )
}

/** Blank strings are the norm in this data, so treat them as absent. */
export const linkOf = (url?: string) => (url && url.trim().length > 0 ? url.trim() : null)
