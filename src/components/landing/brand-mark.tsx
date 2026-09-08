export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox='0 0 72 72' aria-hidden='true'>
      <path className='intro-mark-frame' d='M18 8H8v10M54 8h10v10M8 54v10h10M64 54v10H54' />
      <path className='intro-mark-route' d='M22 53V19h16c9 0 15 5 15 13 0 7-5 12-13 13l14 10' />
      <circle className='intro-mark-node intro-mark-node-a' cx='22' cy='19' r='3' />
      <circle className='intro-mark-node intro-mark-node-b' cx='40' cy='45' r='3' />
      <circle className='intro-mark-node intro-mark-node-c' cx='54' cy='55' r='3' />
    </svg>
  )
}
