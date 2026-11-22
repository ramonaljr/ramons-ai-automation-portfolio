import { DRIVE_FOLDER, driveUrl, PHASES, TEMPLATES, type TemplateKey } from '@/lib/playbook'

/** The 20 Drive templates, grouped under the phase that first uses each one. */
export function TemplatesView() {
  const seen = new Set<TemplateKey>()

  const groups = PHASES.map((phase, i) => {
    const keys = [...new Set(phase.items.flatMap(([, l]) => l.t ?? []))].filter(k => !seen.has(k))

    keys.forEach(k => seen.add(k))

    return { phase, i, keys }
  }).filter(g => g.keys.length)

  return (
    <section>
      <div className='rvd-head'>
        <span className='rvd-eyebrow'>Templates</span>
        <h1>Documents, in the order you use them</h1>
        <p>
          All 20 live in Google Drive:{' '}
          <a href={DRIVE_FOLDER} target='_blank' rel='noopener noreferrer'>
            Client Document Templates folder ↗
          </a>
          . Make a copy for each client, then fill the <span className='rvd-mono'>{'{{PLACEHOLDERS}}'}</span>.
        </p>
      </div>
      <div className='rvd-tgroups'>
        {groups.map(({ phase, i, keys }) => (
          <div key={phase.id} className='rvd-tg'>
            <h2>
              <span className='rvd-mono' style={{ color: 'var(--accent)', marginRight: 8 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              {phase.name}
            </h2>
            <div className='rvd-tlist'>
              {keys.map(key => (
                <a
                  key={key}
                  className='rvd-tcard'
                  href={driveUrl(TEMPLATES[key].id)}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <b>{TEMPLATES[key].name}</b>
                  <span>{TEMPLATES[key].use}</span>
                  <i>Open in Drive ↗</i>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
